import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (user?.token && !socket) {
    socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: user.token },
    });
  }
  
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};