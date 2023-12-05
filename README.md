
# Act It Out

## Project URL

[https://actitout.online](https://actitout.online)

## Project Video URL 

https://www.youtube.com/watch?v=RjXqLJg1P7E&ab_channel=DarrenTrieu

## Project Description

ActItOut is an online web application that makes Charades online and accessible to anyone from anywhere. 
* Players can create their own room and share a link with their friends to play along with them in the same room.
* Within a room, the room admin (usually room creator unless they leave) can modify game settings such as act time, number of rounds, etc. Only the room admin is able to do this. Room admin can also kick players from a room.
* Once the game is started, each player will take turns acting out the word displayed to them when it is their turn using live video from their device. All other players will be able to see the video stream, and can try to guess the word via the live chat. If a player guesses the word correctly, all other players will be notified, but can keep guessing until the time runs out, at which point another player's turn to act will start.
* When a turn ends, scores are tabulated based on how much time was left, and will update for all players so they can see their ranking.
* When the game ends, the leaderboard is shown, and players can navigate back to the home screen.

## Development

**Task:** Leaving deployment aside, explain how the app is built. Please describe the overall code design and be specific about the programming languages, framework, libraries and third-party api that you have used. 

* The application was built using the MERN stack.
* We used Next.js to create the React app. For the frontend, outside of using React, we learned and used Tailwind for the UI, and React Redux to help us manage the game state. One of our biggest issues was maintaining a synchronized game state between all players in a room between different pages, so React Redux allows us to easily maintain a copy of the game for each client.
* On a similar note, in order for us to keep each client game synchronized, we used a mix of a REST api, as well as Socket.io. For the REST api, we used Express.js and [Mongoose](https://mongoosejs.com) as we used MongoDB for our database.
* The bulk of our backend and what keeps games actually synchronized as they play lies in the Socket.io components, which will be elaborated on in challenges. [Socket.io](https://www.npmjs.com/package/socket.io) was used for server side and [socket.io-client](https://www.npmjs.com/package/socket.io-client) was used for client side. We use various event names between client and server, which essentially created a CRUD application using sockets.
* In the UI, The [Dicebear](https://www.npmjs.com/package/@dicebear/core) library was used for the random avatar generation, and [DOMpurify](https://www.npmjs.com/package/isomorphic-dompurify) to sanitize the HTML for the avatars.
* [PeerJS](https://peerjs.com) was used as our WebRTC api to connect video streams together
* We decided not to add any authentication or cookies/sessions. Although we were originally going to, we realized it does not add anything meaningful to our project's functionality since we don't use accounts and all players are temporary.

* For a more technical breakdown of what happens step by step, when a client creates a new room, room data and the user is added to the database. As new players join the room, they are also added to the DB. When the admin clicks start game, all users in the room are navigated to the game room and all retrieve a copy of the game data from the database. Using sockets the game data is synchronized for each client as the game progresses. The database is also maintained properly, so if a new user joins with the link midgame, they will be able to seamlessly join in mid-round with an accurate timer. When the game ends, a leaderboard is displayed, and the room is closed and all players are sent back to the home screen.

## Deployment

## Overview

This deployment report outlines the steps and configurations involved in deploying the Actitout Game App on a production server using Docker and Nginx for reverse proxy and SSL termination. The deployment process includes setting up a virtual machine on Google Cloud Platform (GCP), configuring domain settings on GoDaddy, and utilizing Nginx as a reverse proxy with automated SSL certificate management via Let's Encrypt.

## Deployment Steps

### Step 1: Virtual Machine Setup on GCP

1.1 Start a virtual machine on Google Cloud Platform (GCP) with the required specifications.

### Step 2: Domain Configuration on GoDaddy

2.1 Purchase the domain 'actitout.online' from GoDaddy.

2.2 Add DNS entries for the primary domain and subdomain:

   - A record for '@' pointing to the VM external IP (e.g., 34.130.74.56).
   - A record for 'backend' pointing to the same VM external IP.

### Step 3: Docker Image Building and Uploading

3.1 Build the frontend Docker image using the provided `frontend.dockerfile`:

```bash
docker build -t frontend -f frontend.dockerfile .
```

3.2 Upload the frontend image to the production server:

```bash
docker save frontend | bzip2 | pv | ssh $SERVER docker load
```

3.3 Repeat the process for the backend Docker image:

```bash
docker build -t backend -f backend.dockerfile .
docker save backend | bzip2 | pv | ssh $SERVER docker load
```

### Step 4: Docker Compose and Environment File Transfer

4.1 Copy the `docker-compose.yml` and `.env` files to the production server:

```bash
scp docker-compose.yml $SERVER:.
scp .env $SERVER:.
```

### Step 5: Docker Compose Deployment

5.1 Stop all containers on the production server:

```bash
ssh $SERVER docker-compose down --remove-orphans
```

5.2 Remove dangling images:

```bash
ssh $SERVER docker images --filter "dangling=true" -q --no-trunc | xargs -r docker rmi
```

5.3 Restart all containers:

```bash
ssh $SERVER docker-compose up -d
```

### Step 6: Nginx Configuration

6.1 Utilize Nginx as a reverse proxy for handling redirection, HTTPS, and SSL termination.

### Step 7: Execution of Deployment Script

7.1 Run the deployment script (`deploy.sh`) to automate the deployment process:

```bash
./deploy.sh
```

Nginx is employed as a robust and efficient reverse proxy to manage incoming requests and route them to the appropriate services. The configuration is designed to handle redirection, enforce HTTPS for secure communication, and terminate SSL for encrypted connections.

1. Redirection:
The Nginx reverse proxy is configured to handle redirection seamlessly. This is achieved through the use of the jwilder/nginx-proxy image, which dynamically discovers containers and updates its configuration to route incoming requests based on specified environment variables.

2. HTTPS:
To ensure secure communication between clients and the Actitout Game App, Nginx is configured to enforce HTTPS. The combination of the nginx-proxy and nginx-proxy-acme services automates the acquisition and renewal of SSL certificates from Let's Encrypt.
The nginx-proxy-acme service is responsible for managing SSL certificates, and the relevant environment variable is set 

3. SSL Termination:
SSL termination occurs at the Nginx reverse proxy, where encrypted connections from clients are decrypted, and the traffic is forwarded to the backend services in an unencrypted form. This offloads the SSL/TLS decryption process from the backend services, enhancing overall performance and simplifying certificate management.
The SSL termination is facilitated by the SSL certificates obtained and managed by the nginx-proxy-acme service. These certificates are applied at the Nginx layer, allowing for secure communication between clients and the Actitout Game App.


The Actitout Game App has been successfully deployed on the production server with a secure and scalable Dockerized architecture. The combination of Docker, Nginx reverse proxy, and Let's Encrypt ensures efficient container management and automated SSL certificate renewal. The deployment script streamlines the deployment process, making it reproducible and reliable.

## Challenges

1. Live messaging using socket.io
Our initial challenge was learning how to use socket.io in order to create the live chat. Originally, we were planning on storing messages in the DB, however we quickly realized it was not very scalable, could add a lot of race conditions, and eventually we realized it was unnecessary because of how we decided to go about implementing rooms. Since rooms are temporary anyways, rather than saving to a DB messages are emitted to the server, and then the server directly emits the message to all clients in the room without touching the DB. When clients receive the signal for a new message, a new message element is created and appended to the chatbox component. We used this idea to expand the chatbox usage to also send messages to all users upon another user joining, another user leaving, and if anyone guesses the word correctly.

2. Live video streaming with on-demand switching
For video implementation, there were several steps to implement this. we experimented using simple-peer and PeerJS as the framework for WebRTC, where we eventually settled on PeerJS. We first decided to create a Group Video Chat, using this [video guide](https://www.youtube.com/watch?v=DvlyzDZDEq4&t=523s). This showed us how we can connect users peer-to-peer using sockets as a handshake requests, then play streams upon connection with other users. 
With this in place, the challenge came from implementing this to work with our game. Since the videos were simply appended to an HTML div, we had to find some way to store the videos and later play them on command depending who was the current player. This took several days to figure out, as there were complications on the lobby/game system, and when the PeerJS handshake sockets would be turned on compared to when the other game sockets would turn on. For this, we created separate sockets as the other sockets turned on in the lobby page, while we had to enable to video streaming during the game page. Our solution for managing video streams was to store the stream away in useState arrays, then when we call a function switchVideo(currentPlayerId), we make it take the stream from the array and create a video element to replace the current playing video. The other large struggle was figuring out how to allow users to join in midway and play videos, as the synchronization between users was difficult. The final step to this was storing the current player's id in the database, so when a user joins and tries to play a video from a "null" user (as they have not received data on who is the current player), they could request the current user's id and then set their video to that stream. There were also several other complications due to how React stores information, which required us to make several small changes along the way to ensure that the video call function worked smoothly

3. Game logic - including guessing mechanics, room management, score system, timer system, player system, and synchronization everything between clients and preventing race-conditions.
There were several challenges when implementing game logic that we did not foresee. These included cases where a user disconnected, how synchronization should work with between users, what data should be pulled from the database, and much more. A lot of the difficulty came down to the client server interactions, and maintaining a consistent state for each client in a room. 
For a example, for one issue we had trouble syncing the timers and round data when a new round would start, as each user had their timers set up on the client. This would also emit to the server multiple times each time the round ended for each client, as we used a "round-end" emit from client to server to ask the server to update the database and send back new round info like the new word. We worked around this by getting the time the game started, and saving to the database the time that the game should end at, and had the clients through the socket update the value in their copy of the game. We also solved the multiple emit issue by only allowing admin's emits to go through server-side, so that while everyone would send the "round-end" signal, only the admin's emit would be processed. However, another issue arose as if the currently playing user was disconnected, the clients would send the "round-end" signal to start a new round. However, since only the admin's emit was processed now, if the admin was the playing player and disconnected, all other emits would not work in time for the new admin to be set up, thus we had to also synchronize when the new admin would be set up and when the "round-end" emit would be sent. This was one specific problem we had out of many during the process of synchronizing the game logic and mechanics. 
Along with the socket CRUD methods, there is a REST api is used to post and get game and player details in our MongoDB database for games that are being actively played, and when the game ends everything related to that room is deleted from the database. The purpose of the database is 1) to keep track of player score and game details so that 2) it would allow the newly joined users with the link to frictionlessly join mid-game with all the correct game info. 

## Contributions

* Pritish Panda: frontend UI, deployment, various game logic components
* Roger Zhao: All chat features, frontend controllers/Redux state, various game logic components
* Darren Trieu: PeerJS integration, livestream switching, various game logic components

# One more thing? 
* There is an extra comment for a citation in the github version vs the deployed version. Otherwise, there is no difference. Our deployed version is the last 'merge branch main' from Roger

# References:
* Background image from Freepik
* Stackoverflow
* Online documentation for the libraries we used
