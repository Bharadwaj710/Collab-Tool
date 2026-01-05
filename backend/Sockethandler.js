const Document = require('./models/Document');
const User = require('./models/User'); // Import User model

// Server-side state: rooms[roomId] = { users: [], content: string, version: number }
const rooms = {};

const setupSocketHandlers = (io) => {
  console.log('Collaborative Workspace: Socket Handlers Ready');

  io.on('connection', (socket) => {
    console.log(`Connected: ${socket.id}`);

    // ISSUE 1: PARTICIPANTS VISIBILITY
    socket.on('join-room', async ({ roomId, user }) => {
      if (!roomId || !user) return;
      
      const joiningUserId = user.id ? String(user.id) : null;
      console.log(`User ${user.name} joining room: ${roomId} (ID: ${joiningUserId})`);
      socket.join(roomId);

      if (!rooms[roomId]) {
        rooms[roomId] = {
          users: [],
          content: '{"ops":[{"insert":"\\n"}]}', 
          version: 0,
          title: 'Untitled Document',
          ownerId: null
        };
      }

      try {
        const isObjectId = roomId.length === 24 && /^[0-9a-fA-F]+$/.test(roomId);
        let doc = isObjectId ? await Document.findById(roomId) : null;

        if (doc) {
          // CASE A: DB-Persisted Document
          let participant = doc.participants.find(p => 
            (p.userId && String(p.userId) === joiningUserId) || 
            (p.guestId && String(p.guestId) === joiningUserId)
          );

          if (!participant) {
            const isCreator = doc.createdBy && String(doc.createdBy) === joiningUserId;
            let name = user.name || 'Anonymous';
            const role = isCreator ? 'creator' : 'participant';
            
            // If creator, try to get authoritative name from DB
            if (isCreator && joiningUserId && joiningUserId.length === 24) {
               try {
                  const creatorUser = await User.findById(joiningUserId);
                  if (creatorUser && creatorUser.username) {
                      name = creatorUser.username;
                  }
               } catch (e) { console.error('Error fetching creator name:', e); }
            }

            participant = {
              userId: (joiningUserId && joiningUserId.length === 24) ? joiningUserId : null,
              guestId: (joiningUserId && joiningUserId.length !== 24) ? joiningUserId : null,
              name,
              role,
              joinedAt: new Date(),
              status: 'connected'
            };
            
            doc.participants.push(participant);
            await doc.save();
          } else {
             // Existing participant: Update status and ensure Creator name is correct
             let dirty = false;
             
             if (participant.role === 'creator' && participant.userId) {
                 const creatorUser = await User.findById(participant.userId);
                 if (creatorUser && creatorUser.username && creatorUser.username !== participant.name) {
                     participant.name = creatorUser.username;
                     dirty = true;
                 }
             }

             if (participant.status !== 'connected') {
                 participant.status = 'connected';
                 dirty = true;
             }
             
             if (dirty) await doc.save();
          }

          // Update in-memory presence
          const socketUser = { 
            id: joiningUserId, 
            socketId: socket.id, 
            name: user.name || participant.name 
          };
          if (!rooms[roomId].users.find(u => u.socketId === socket.id)) {
            rooms[roomId].users.push(socketUser);
          }

          // Broadcast authoritative list
          const onlineIds = new Set(rooms[roomId].users.map(u => String(u.id)));
          const list = doc.participants.map(p => ({
            userId: p.userId,
            guestId: p.guestId,
            name: p.name || 'Anonymous',
            role: p.role,
            isOnline: onlineIds.has(String(p.userId || p.guestId)),
            status: onlineIds.has(String(p.userId || p.guestId)) ? 'connected' : 'disconnected'
          }));

          io.to(roomId).emit('room-users', list);
          
          if (!rooms[roomId].ownerId && doc.owner) rooms[roomId].ownerId = String(doc.owner);
          // Initialize in-memory state from DB if fresh
          if (rooms[roomId].version === 0) {
             if (doc.discussionContent && !rooms[roomId].discussionContent) {
                 rooms[roomId].discussionContent = doc.discussionContent;
             }
             if (doc.code && !rooms[roomId].code) {
                 rooms[roomId].code = doc.code;
             }
          }

          // Calculate live timer for sync
          const getSyncedTimer = (timer) => {
              if (timer && timer.isRunning && timer.lastUpdatedAt) {
                  const now = new Date();
                  const elapsed = Math.floor((now - new Date(timer.lastUpdatedAt)) / 1000);
                  // Return a copy with adjusted remaining time
                  return { ...timer, remaining: Math.max(0, timer.remaining - elapsed) };
              }
              return timer;
          };

            socket.emit('full-state', {
            discussionContent: rooms[roomId].discussionContent || doc.discussionContent,
            code: rooms[roomId].code || doc.code,
            version: rooms[roomId].version,
            title: rooms[roomId].title,
            ownerId: String(doc.owner),
            problemStatement: doc.problemStatement,
            timer: getSyncedTimer(doc.timer.toObject ? doc.timer.toObject() : doc.timer),
            chat: doc.chat,
            // Only send notes to interviewers/creator
            notes: (participant.role === 'creator' || participant.role === 'interviewer') ? doc.notes : [],
            personalNotes: participant.privateNotes || []
          });

          // Mark as connected in DB
          if (participant.status !== 'connected') {
            participant.status = 'connected';
            await doc.save();
          }
        } else {
          // CASE B: Ad-hoc Guest Room
          if (!rooms[roomId].ownerId) {
            if (rooms[roomId].users.length === 0) rooms[roomId].ownerId = joiningUserId;
          }

          const isCreator = joiningUserId === rooms[roomId].ownerId;
          const role = isCreator ? 'creator' : (user.role || 'participant').toLowerCase();

          if (!rooms[roomId].users.find(u => u.socketId === socket.id)) {
            rooms[roomId].users.push({ id: joiningUserId, name: user.name, role, isCreator, socketId: socket.id });
          }

          const list = rooms[roomId].users.map(u => ({
            userId: null,
            guestId: u.id,
            name: u.name,
            role: u.role,
            isCreator: u.isCreator,
            isOnline: true,
            status: 'connected'
          }));

          io.to(roomId).emit('room-users', list);
          socket.emit('full-state', {
            content: rooms[roomId].content,
            version: rooms[roomId].version,
            title: rooms[roomId].title,
            ownerId: rooms[roomId].ownerId
          });
        }
      } catch (err) {
        console.error('Join room error:', err);
      }
    });

    socket.on('update-participant-role', async ({ roomId, targetUserId, targetGuestId, newRole, requesterId }) => {
      try {
        const doc = await Document.findById(roomId);
        const reqStr = String(requesterId);
        
        if (doc) {
          const requester = doc.participants.find(p => 
            (p.userId && String(p.userId) === reqStr) || 
            (p.guestId && String(p.guestId) === reqStr)
          );

          if (!requester || (requester.role !== 'creator' && requester.role !== 'interviewer')) {
            return socket.emit('error', { msg: 'Insufficient permissions to update roles' });
          }

          const participant = doc.participants.find(p => 
            (targetUserId && String(p.userId) === String(targetUserId)) || 
            (targetGuestId && String(p.guestId) === String(targetGuestId))
          );
          
          if (participant && participant.role !== 'creator') {
            participant.role = newRole;
            await doc.save();
            const onlineIds = new Set(rooms[roomId]?.users.map(u => String(u.id)) || []);
            const list = doc.participants.map(p => ({
              userId: p.userId, guestId: p.guestId, name: p.name, role: p.role,
              isOnline: onlineIds.has(String(p.userId || p.guestId)),
              status: onlineIds.has(String(p.userId || p.guestId)) ? 'connected' : 'disconnected'
            }));
            io.to(roomId).emit('room-users', list);
          }
        }
      } catch (err) {
        console.error('Update role error:', err);
      }
    });

    socket.on('kick-participant', async ({ roomId, targetUserId, targetGuestId, requesterId }) => {
        try {
            const doc = await Document.findById(roomId);
            const reqStr = String(requesterId);

            if (doc) {
                const requester = doc.participants.find(p => 
                    (p.userId && String(p.userId) === reqStr) || 
                    (p.guestId && String(p.guestId) === reqStr)
                );

                if (!requester || (requester.role !== 'creator' && requester.role !== 'interviewer')) {
                    return socket.emit('error', { msg: 'Insufficient permissions to kick users' });
                }

                const participantIndex = doc.participants.findIndex(p => 
                    (targetUserId && String(p.userId) === String(targetUserId)) || 
                    (targetGuestId && String(p.guestId) === String(targetGuestId))
                );

                if (participantIndex !== -1) {
                    const participant = doc.participants[participantIndex];
                    if (participant.role === 'creator') return; // Cannot kick creator

                    // Remove from DB
                    doc.participants.splice(participantIndex, 1);
                    await doc.save();

                    // Find socket to kick
                    if (rooms[roomId]) {
                        const targetUser = rooms[roomId].users.find(u => 
                            String(u.id) === String(targetUserId || targetGuestId)
                        );
                        
                        if (targetUser) {
                            io.to(targetUser.socketId).emit('user-kicked', { roomId });
                            // Force socket leave handled by client redirect, but we can also force disconnect/leave here if needed
                            // For now, let client handle the UI redirect
                        }
                    }

                    // Broadcast update
                    const onlineIds = new Set(rooms[roomId]?.users.map(u => String(u.id)) || []);
                    const list = doc.participants.map(p => ({
                        userId: p.userId, guestId: p.guestId, name: p.name, role: p.role,
                        isOnline: onlineIds.has(String(p.userId || p.guestId)),
                        status: onlineIds.has(String(p.userId || p.guestId)) ? 'connected' : 'disconnected'
                    }));
                    io.to(roomId).emit('room-users', list);
                }
            }
        } catch (err) {
            console.error('Kick participant error:', err);
        }
    });

    // ISSUE 2: EDITOR SYNC
    socket.on('discussion-change', async ({ roomId, content, userId }) => {
      console.log(`[Discussion] Change in ${roomId} by ${userId}`);
      if (rooms[roomId]) {
         rooms[roomId].discussionContent = content;
         socket.to(roomId).emit('discussion-update', { content, userId });
         // Debounce save (simplified)
         await Document.findByIdAndUpdate(roomId, { discussionContent: content }).catch(console.error);
      } else {
          console.error(`[Discussion] Room ${roomId} not found in memory!`);
      }
    });

    socket.on('code-change', async ({ roomId, code, language, userId }) => {
      console.log(`[Code] Change in ${roomId} by ${userId}`);
      if (rooms[roomId]) {
         rooms[roomId].code = { source: code, language };
         socket.to(roomId).emit('code-update', { code, language, userId });
         await Document.findByIdAndUpdate(roomId, { 
             code: { source: code, language } 
         }).catch(console.error);
      } else {
          console.error(`[Code] Room ${roomId} not found in memory!`);
      }
    });

    socket.on('request-sync', async ({ roomId }) => {
      if (rooms[roomId]) {
        try {
            const d = await Document.findById(roomId);
            if (!d) return;

            // ... Existing logic for timer sync ...
            const getSyncedTimer = (timer) => {
                if (timer && timer.isRunning && timer.lastUpdatedAt) {
                    const now = new Date();
                    const elapsed = Math.floor((now - new Date(timer.lastUpdatedAt)) / 1000);
                    return { ...timer, remaining: Math.max(0, timer.remaining - elapsed) };
                }
                return timer;
            };

           socket.emit('full-state', {
            discussionContent: d.discussionContent,
            code: d.code,
            title: d.title,
            ownerId: String(d.owner),
            problemStatement: d.problemStatement,
            timer: getSyncedTimer(d.timer.toObject ? d.timer.toObject() : d.timer),
            chat: d.chat,
            notes: d.notes // Filter logic is UI side or complex, kept simple here to avoid regression
          });

        } catch(e) { console.error(e); }
      }
    });

    socket.on('title-change', async ({ roomId, title }) => {
      if (rooms[roomId]) {
        rooms[roomId].title = title;
        socket.to(roomId).emit('title-update', { title });
        await Document.findByIdAndUpdate(roomId, { title, updatedAt: new Date() }).catch(() => {});
      }
    });

    socket.on('update-problem', async ({ roomId, problemStatement, requesterId }) => {
      const doc = await Document.findById(roomId);
      if (doc) {
        const participant = doc.participants.find(p => 
          (p.userId && String(p.userId) === String(requesterId)) || 
          (p.guestId && String(p.guestId) === String(requesterId))
        );
        if (participant && (participant.role === 'creator' || participant.role === 'interviewer')) {
          doc.problemStatement = problemStatement;
          await doc.save();
          io.to(roomId).emit('problem-update', { problemStatement });
        }
      }
    });

    socket.on('timer-control', async ({ roomId, action, duration, requesterId }) => {
      const doc = await Document.findById(roomId);
      if (doc) {
        const participant = doc.participants.find(p => 
          (p.userId && String(p.userId) === String(requesterId)) || 
          (p.guestId && String(p.guestId) === String(requesterId))
        );
        if (participant && (participant.role === 'creator' || participant.role === 'interviewer')) {
          const now = new Date();

          if (action === 'start') {
            // CASE 1: SET & START (new timer with duration)
            if (typeof duration === 'number' && duration > 0) {
              doc.timer.duration = duration;
              doc.timer.remaining = duration;
              doc.timer.isRunning = true;
              doc.timer.lastUpdatedAt = now;
            }
            // CASE 2: RESUME (no duration, continue from paused state)
            else {
              doc.timer.isRunning = true;
              doc.timer.lastUpdatedAt = now;
              // DO NOT modify remaining or duration
            }
          } 
          else if (action === 'pause') {
            // Calculate elapsed time since last update
            if (doc.timer.isRunning && doc.timer.lastUpdatedAt) {
              const elapsed = Math.floor((now - new Date(doc.timer.lastUpdatedAt)) / 1000);
              doc.timer.remaining = Math.max(0, doc.timer.remaining - elapsed);
            }
            doc.timer.isRunning = false;
            doc.timer.lastUpdatedAt = now;
            // DO NOT modify duration
          } 
          else if (action === 'reset') {
            doc.timer.remaining = doc.timer.duration;
            doc.timer.isRunning = false;
            doc.timer.lastUpdatedAt = now;
          }

          await doc.save();
          
          // Convert to plain object to ensure correct serialization
          const timerUpdate = {
            duration: doc.timer.duration,
            remaining: doc.timer.remaining,
            isRunning: doc.timer.isRunning,
            lastUpdatedAt: doc.timer.lastUpdatedAt
          };
          io.to(roomId).emit('timer-update', timerUpdate);
        }
      }
    });

    socket.on('send-chat', async ({ roomId, message, senderId, senderName }) => {
      const doc = await Document.findById(roomId);
      if (doc) {
        const chatEntry = { senderId, senderName, message, timestamp: new Date() };
        doc.chat.push(chatEntry);
        await doc.save();
        io.to(roomId).emit('chat-message', chatEntry);
      }
    });

    socket.on('add-note', async ({ roomId, text, requesterId }) => {
        try {
            const document = await Document.findById(roomId);
            if (!document) return;

            const requester = document.participants.find(p => 
                p.userId.toString() === requesterId || p.userId === requesterId
            );
            if (!requester) return;

            const newNote = {
                id: Date.now().toString(),
                text,
                timestamp: new Date()
            };

            if (!requester.privateNotes) requester.privateNotes = [];
            requester.privateNotes.push(newNote);

            await document.save();
            socket.emit('notes-updated', requester.privateNotes);
        } catch (error) {
            console.error('Error adding note:', error);
        }
    });

    // Delete Private Note Handler
    socket.on('delete-note', async ({ roomId, noteId, requesterId }) => {
        try {
            const document = await Document.findById(roomId);
            if (!document) return;

            const requester = document.participants.find(p => 
                p.userId.toString() === requesterId || p.userId === requesterId
            );
            if (!requester) return;

            if (!requester.privateNotes) requester.privateNotes = [];
            
            // Filter out the note with the matching ID
            requester.privateNotes = requester.privateNotes.filter((note, index) => {
                // Support both ID-based and index-based deletion
                return note.id !== noteId && index.toString() !== noteId.toString();
            });

            await document.save();
            socket.emit('notes-updated', requester.privateNotes);
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    });

    socket.on('leave-room', ({ roomId, userId }) => {
      handleUserLeave(socket, roomId, userId);
    });

    socket.on('disconnect', () => {
      for (const roomId in rooms) {
        const user = rooms[roomId].users.find(u => u.socketId === socket.id);
        if (user) {
          handleUserLeave(socket, roomId, user.userId || user.guestId || user.id);
        }
      }
    });

    // Support typing indicators
    socket.on('user-typing', ({ roomId, username }) => {
      socket.to(roomId).emit('user-typing', { username });
    });

    socket.on('user-stopped-typing', ({ roomId, username }) => {
      socket.to(roomId).emit('user-stopped-typing', { username });
    });

    async function handleUserLeave(socket, roomId, userId) {
      if (rooms[roomId]) {
        rooms[roomId].users = rooms[roomId].users.filter(u => u.socketId !== socket.id);
        socket.leave(roomId);

        try {
          const doc = await Document.findById(roomId);
          if (doc) {
            const onlineIds = new Set(rooms[roomId].users.map(u => String(u.id)));
            const list = doc.participants.map(p => ({
              userId: p.userId,
              guestId: p.guestId,
              name: p.name || 'Anonymous',
              role: p.role,
              isOnline: onlineIds.has(String(p.userId || p.guestId)),
              status: onlineIds.has(String(p.userId || p.guestId)) ? 'connected' : 'disconnected'
            }));
            
            // Persist status in DB for the leaving user
            const leavingParticipant = doc.participants.find(p => 
              (p.userId && String(p.userId) === String(userId)) || 
              (p.guestId && String(p.guestId) === String(userId))
            );
            if (leavingParticipant) {
              leavingParticipant.status = 'disconnected';
              await doc.save();
            }

            io.to(roomId).emit('room-users', list);
          }
        } catch (err) {
          // Silent fail on leave sync
        }
      }
    }
  });
};

module.exports = setupSocketHandlers;
