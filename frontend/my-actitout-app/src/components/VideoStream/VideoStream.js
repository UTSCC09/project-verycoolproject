import React, { useRef, useEffect, useState } from 'react';
import SimplePeer from 'simple-peer';
import io from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_BACKEND);

export function VideoStream(props) {

  const { roomId } = props;
  const [peers, setPeers] = useState(null);
  const videoRef = useRef(null);
  const userStreamRef = useRef(null);

  useEffect(() => {
    const peer = new SimplePeer({ initiator: true, trickle: false });

    // Request user's video stream
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    }).then(userStream => {
      // Display the user's video stream in a video element
      userStreamRef.current = userStream;
      if (videoRef.current) {
        videoRef.current.srcObject = userStreamRef.current;
      }
    }).catch(error => {
      console.error('Error accessing user media:', error);
    });

    peer.on('signal', (data) => {
      socket.emit('offer', data);
    });

    socket.on('answer', (data) => {
      peer.signal(data);
    });

    socket.on('new-peer', (data) => {
      const newPeer = new SimplePeer({ trickle: false });
      newPeer.on('signal', (signal) => {
        socket.emit('offer', signal);
      });

      newPeer.signal(data.signal);

      setPeers((prevPeers) => [...prevPeers, newPeer]);
    });

    socket.emit('join-room', roomId); // Replace with your room ID

    return () => {
      peer.destroy();
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <video autoPlay playsInline muted ref={videoRef} />
    </div>
  );
}
