// WebSocketDemo.js
import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

function WebSocketDemo() {
  const [message, setMessage] = useState('');
  const [client, setClient] = useState(null);

  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to WebSocket');
        stompClient.subscribe('/topic/pong', (msg) => {
          const res = JSON.parse(msg.body);
          setMessage(res.content);
        });
      },
    });
    stompClient.activate();
    setClient(stompClient);
  }, []);

  const sendPing = () => {
    if (client && client.connected) {
      client.publish({
        destination: '/app/ping',
        body: JSON.stringify({ content: 'Ping from React' }),
      });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>WebSocket Ping-Pong Demo</h2>
      <button onClick={sendPing}>Send Ping</button>
      <p>Server Response: {message}</p>
    </div>
  );
}

export default WebSocketDemo;
