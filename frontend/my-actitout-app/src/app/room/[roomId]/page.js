"use client"
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { Peer } from "peerjs";
import styled from "styled-components";

const Container = styled.div`
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    width: 100%;
`;

const VideoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
`;

const RoomCodeSection = styled.div`
    background-color: #3498db;
    padding: 10px 20px;
    border-radius: 5px;
    margin-bottom: 20px;
`;

const ConnectButton = styled.button`
    padding: 10px 20px;
    font-size: 18px;
    background-color: #3498db;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #2980b9;
    }
`;

// For some reason room is rendered twice so connections and id get overwritten(?)
const Room = (params) => {

    const { roomId } = params.params;

    const [showButton, setShowButton] = useState(true);
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const myVideo = useRef();
    const videoGrid = useRef(null);
    const peersRef = useRef([]);
    const myPeer = useRef();
    const connectToRoomBtn = useRef();

    function addVideoStream(video, stream) {
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
        videoGrid.current.appendChild(video);
    }

    function connectToNewUser(userId, stream) {
        const call = myPeer.current.call(userId, stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
        call.on('close', () => {
            video.remove();
        });
        peers[userId] = call;
    }

    // Solution: Set up connections after pushing a button so they won't be overwritten
    const handleConnectToRoom = async () => {
        setShowButton(false);

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        myVideo.current = document.createElement('video');
        addVideoStream(myVideo.current, stream);

        myPeer.current = new Peer();
        myPeer.current.on('call', call => {
            call.answer(stream);
            const video = document.createElement('video');
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream);
            });
        });

        socketRef.current = io.connect(process.env.NEXT_PUBLIC_BACKEND);
        socketRef.current.on('user-connected', userId => {
            connectToNewUser(userId, stream);
        });

        socketRef.current.on('user-disconnected', userId => {
            if (peers[userId]) {
                peers[userId].close();
                delete peers[userId];
            }
        });

        myPeer.current.on('open', id => {
            socketRef.current.emit('join-room', roomId, id);
        });
    };

    return (
        <Container>
            <RoomCodeSection>
                <h2 style={{ color: "#fff" }}>Room Code: <strong>{roomId}</strong></h2>
            </RoomCodeSection>
            {showButton && (
                <ConnectButton ref={connectToRoomBtn} onClick={handleConnectToRoom}>
                    Connect To Room
                </ConnectButton>
            )}
            <VideoGrid ref={videoGrid}>

            </VideoGrid>
        </Container>
    );
};

export default Room;
