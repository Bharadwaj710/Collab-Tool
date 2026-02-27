import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

export const useSocket = (roomId, user) => {
    const [socket, setSocket] = useState(null);
    const [status, setStatus] = useState('connecting');
    const socketRef = useRef(null);
    const userId = user?._id || user?.id;
    const username = user?.username;
    const userRole = user?.role;

    useEffect(() => {
        if (!roomId || !userId) return;

        const s = io(API_BASE_URL, {
            query: { roomId, userId },
            transports: ['websocket', 'polling']
        });

        socketRef.current = s;
        setSocket(s);

        s.on('connect', () => {
            setStatus('connected');
            // Emit join-room with consistent user structure
            console.log(`[Frontend] Joining room: ${roomId} as ${username}`);
            s.emit('join-room', {
                roomId,
                user: {
                    id: userId,
                    name: username,
                    role: userRole
                }
            });
        });

        s.on('disconnect', () => setStatus('disconnected'));
        s.on('connect_error', () => setStatus('error'));

        return () => {
            if (s) {
                s.disconnect();
            }
        };
        // Only reconnect if room or user identity fields change
    }, [roomId, userId, username, userRole]); 

    return { socket, status };
};
