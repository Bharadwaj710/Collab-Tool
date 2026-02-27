import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

export const useSocket = (roomId, user) => {
    const [socket, setSocket] = useState(null);
    const [status, setStatus] = useState('connecting');
    const socketRef = useRef(null);

    useEffect(() => {
        if (!roomId || !user) return;

        const s = io(API_BASE_URL, {
            query: { roomId, userId: user._id || user.id },
            transports: ['websocket', 'polling']
        });

        socketRef.current = s;
        setSocket(s);

        s.on('connect', () => {
            setStatus('connected');
            // Emit join-room with consistent user structure
            console.log(`[Frontend] Joining room: ${roomId} as ${user.username}`);
            s.emit('join-room', {
                roomId,
                user: {
                    id: user._id || user.id,
                    name: user.username,
                    role: user.role
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
        // Only reconnect if roomId changes or user ID changes
    }, [roomId, user?._id, user?.id]); 

    return { socket, status };
};
