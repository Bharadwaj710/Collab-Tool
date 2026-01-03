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
            if (isCreator && joiningUserId.length === 24) {
               try {
                  const creatorUser = await User.findById(joiningUserId);
                  if (creatorUser && creatorUser.username) {
                      name = creatorUser.username;
                  }
               } catch (e) { console.error('Error fetching creator name:', e); }
            }

            participant = {
              userId: joiningUserId.length === 24 ? joiningUserId : null,
              guestId: joiningUserId.length !== 24 ? joiningUserId : null,
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
            isOnline: onlineIds.has(String(p.userId || p.guestId))
          }));

          io.to(roomId).emit('room-users', list);
          
          if (!rooms[roomId].ownerId && doc.owner) rooms[roomId].ownerId = String(doc.owner);
          if (doc.content && rooms[roomId].version === 0) {
            rooms[roomId].content = typeof doc.content === 'string' ? doc.content : JSON.stringify(doc.content);
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
            content: rooms[roomId].content,
            version: rooms[roomId].version,
            title: rooms[roomId].title,
            ownerId: String(doc.owner),
            problemStatement: doc.problemStatement,
            timer: getSyncedTimer(doc.timer.toObject ? doc.timer.toObject() : doc.timer),
            chat: doc.chat,
            // Only send notes to interviewers/creator
            notes: (participant.role === 'creator' || participant.role === 'interviewer') ? doc.notes : []
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
            isOnline: true
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
          if (String(doc.createdBy) !== reqStr) {
            return socket.emit('error', { msg: 'Only the creator can update roles' });
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
              isOnline: onlineIds.has(String(p.userId || p.guestId))
            }));
            io.to(roomId).emit('room-users', list);
          }
        } else if (rooms[roomId]) {
          if (String(rooms[roomId].ownerId) === reqStr) {
            const targetId = String(targetUserId || targetGuestId);
            const user = rooms[roomId].users.find(u => String(u.id) === targetId);
            if (user && user.role !== 'creator') {
              user.role = newRole;
              const list = rooms[roomId].users.map(u => ({
                guestId: u.id, name: u.name, role: u.role, isCreator: u.role === 'creator', isOnline: true
              }));
              io.to(roomId).emit('room-users', list);
            }
          }
        }
      } catch (err) {
        console.error('Update role error:', err);
      }
    });

    // ISSUE 2: EDITOR SYNC
    socket.on('editor-change', ({ roomId, content, version, senderId }) => {
      if (rooms[roomId]) {
        // Last-write-wins: Accept if version is same or higher
        if (version >= rooms[roomId].version) {
          rooms[roomId].content = content;
          rooms[roomId].version = version;

          // Broadcast to OTHERS
          socket.to(roomId).emit('editor-update', {
            content,
            version,
            senderId
          });

          // Debounced DB persistence (Optional/Background)
          Document.findByIdAndUpdate(roomId, { content, updatedAt: new Date() }).catch(() => {});
        }
      }
    });

    socket.on('request-sync', async ({ roomId }) => {
      if (rooms[roomId]) {
        // Fetch latest doc for timer
        const d = await Document.findById(roomId);
        let currentTimer = rooms[roomId].timer; // fallback
        if (d) {
             const getSyncedTimer = (timer) => {
                if (timer && timer.isRunning && timer.lastUpdatedAt) {
                    const now = new Date();
                    const elapsed = Math.floor((now - new Date(timer.lastUpdatedAt)) / 1000);
                    return { ...timer, remaining: Math.max(0, timer.remaining - elapsed) };
                }
                return timer;
            };
            currentTimer = getSyncedTimer(d.timer.toObject ? d.timer.toObject() : d.timer);
        }

        socket.emit('full-state', {
          content: rooms[roomId].content,
          version: rooms[roomId].version,
          title: rooms[roomId].title,
          timer: currentTimer
        });
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
      const doc = await Document.findById(roomId);
      if (doc) {
        const participant = doc.participants.find(p => 
          (p.userId && String(p.userId) === String(requesterId)) || 
          (p.guestId && String(p.guestId) === String(requesterId))
        );
        if (participant && (participant.role === 'creator' || participant.role === 'interviewer')) {
          const noteEntry = { authorId: requesterId, text, timestamp: new Date() };
          doc.notes.push(noteEntry);
          await doc.save();
          // Emit only to interviewers/creator
          rooms[roomId].users.forEach(u => {
            const p = doc.participants.find(dp => (dp.userId && String(dp.userId) === String(u.id)) || (dp.guestId && String(dp.guestId) === String(u.id)));
            if (p && (p.role === 'creator' || p.role === 'interviewer')) {
              io.to(u.socketId).emit('note-added', noteEntry);
            }
          });
        }
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
