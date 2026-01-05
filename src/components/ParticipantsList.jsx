import React from 'react';

const ParticipantsList = ({ participants, currentUser, socket, roomId, typingUsers }) => {
    return (
        <div className="space-y-2">
            {participants.map((participant, index) => {
                const pId = participant.userId || participant.guestId;
                const isMe = String(pId) === String(currentUser?._id || currentUser?.id);
                const role = participant.role;
                const isOnline = participant.isOnline;
                const name = participant.name || 'Anonymous';
                
                const status = participant.status || (isOnline ? 'connected' : 'disconnected');
                
                let borderColorClass = 'border-l-gray-700'; 
                let badgeColorClass = 'bg-gray-800 text-jb-muted border border-gray-700';
                let badgeLabel = role;

                if (status === 'disconnected') {
                    borderColorClass = 'border-l-gray-800';
                    badgeColorClass = 'bg-gray-900/50 text-gray-600 border border-gray-800';
                    badgeLabel = 'OFFLINE';
                } else {
                    if (role === 'creator') {
                        borderColorClass = 'border-l-jb-accent';
                        badgeColorClass = 'bg-jb-accent/10 text-jb-accent border border-jb-accent/20';
                        badgeLabel = 'CREATOR';
                    } else if (role === 'interviewer') {
                        borderColorClass = 'border-l-jb-secondary';
                        badgeColorClass = 'bg-jb-secondary/10 text-jb-secondary border border-jb-secondary/20';
                        badgeLabel = 'INTERVIEWER';
                    } else if (role === 'candidate') {
                        borderColorClass = 'border-l-jb-violet';
                        badgeColorClass = 'bg-jb-violet/10 text-jb-violet border border-jb-violet/20';
                        badgeLabel = 'CANDIDATE';
                    }
                }

                const myParticipant = participants.find(p => String(p.userId || p.guestId) === String(currentUser?._id || currentUser?.id));
                const amIPrivilegedToChangeRoles = myParticipant && (myParticipant.role === 'creator' || myParticipant.role === 'interviewer');

                return (
                    <div 
                        key={index} 
                        className={`
                            relative bg-gray-800/40 rounded-lg p-3 flex flex-col gap-2 
                            border-l-4 ${borderColorClass} 
                            ${status === 'connected' ? 'opacity-100' : 'opacity-60'}
                            hover:bg-gray-800 transition-colors duration-200
                        `}
                    >
                        <div className="flex justify-between items-center">
                            <div className={`text-sm text-gray-200 truncate max-w-[120px] ${isMe ? 'font-bold' : ''}`}>
                                {name} {isMe ? '(Me)' : ''}
                                {role === 'creator' && <span title="Creator" className="ml-1">👑</span>}
                            </div>
                            
                            {amIPrivilegedToChangeRoles && !isMe && role !== 'creator' && status === 'connected' ? (
                                <div className="flex items-center gap-2">
                                    <select 
                                        className="bg-gray-900 border border-gray-600 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                                        value={role}
                                        onChange={(e) => {
                                            const newRole = e.target.value;
                                            socket.emit('update-participant-role', {
                                                roomId: roomId,
                                                targetUserId: participant.userId,
                                                targetGuestId: participant.guestId,
                                                newRole: newRole,
                                                requesterId: currentUser._id || currentUser.id
                                            });
                                        }}
                                    >
                                        <option value="participant">Participant</option>
                                        <option value="interviewer">Interviewer</option>
                                        <option value="candidate">Candidate</option>
                                    </select>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Are you sure you want to remove ${name}?`)) {
                                                socket.emit('kick-participant', {
                                                    roomId,
                                                    targetUserId: participant.userId,
                                                    targetGuestId: participant.guestId,
                                                    requesterId: currentUser._id || currentUser.id
                                                });
                                            }
                                        }}
                                        className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition-colors"
                                        title="Remove User"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <span className={`
                                    text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded shadow-sm
                                    ${badgeColorClass}
                                `}>
                                    {badgeLabel}
                                </span>
                            )}
                        </div>
                        {typingUsers.has(name) && (
                            <div className="text-[10px] text-jb-secondary italic animate-pulse flex items-center gap-1 mt-1">
                                <span className="w-1 h-1 rounded-full bg-jb-secondary"></span>
                                typing...
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ParticipantsList;
