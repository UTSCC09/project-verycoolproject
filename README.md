[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/KRLE_tfD)

# Project Title: ActItOut/VideoCharade

## Team Members:
- Pritish Panda
- Roger Zhao
- Darren Trieu

## Description of the Web Application:
ActItOut is an online web application that makes Charades online and accessible to anyone from anywhere. Players will act out words or phrases using live video, and everyone else will try to guess the word in the live chat. The platform will support drop-in multiplayer, allowing users to join games in progress, live chat, and the ability to create their own rooms and word sets.

## Key Features for the Beta Version:

- Real-time video streaming and chat
- Creating and joining single game room
- Basic game rules and mechanics
- scorekeeping

## Additional Features for the Final Version:
- Multiple Game Rooms with link codes for access
- Mobile sites for iOS and Android
- Add custom words
- Security

## Technology Stack:
- MERN Stack (MongoDB, Express, React, Node)
- Real-time Communication: WebRTC
- Video Streaming: WebSockets
- Version Control: GitHub
- Project Management: Jira

## Top 5 Technical Challenges:
1. **Real-time Video Streaming:** Implementing live video streaming between multiple users

2. **Live-Chat**:  Developing a live-chat system for users to message each other in, seeing live feedback from other users as well. This live-chat would be implemented for each "room", and all users in the room can access it.

3. **Security**: Ensuring the security of users, as they will be live connected in the "room", as well as security for live-videos. 

4. **Cross-Platform Compatibility:** Ensuring the app works across both mobile (iOS and Android) as well as desktop.

5. **Multiple Rooms**: Creating a "room" system for various different games to occur at the same time. Each room are drop-in, available to those with the access code. The system should be able to support several rooms with users.
