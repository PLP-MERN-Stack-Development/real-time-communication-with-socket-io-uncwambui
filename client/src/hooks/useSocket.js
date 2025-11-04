import { useEffect } from 'react';
import socket from '../socket/socket';

export const useSocket = (onMessage) => {
  useEffect(() => {
    socket.on('receive_message', onMessage);
    return () => socket.off('receive_message');
  }, [onMessage]);
};
