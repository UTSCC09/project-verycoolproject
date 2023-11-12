const socket = io('/')
const myPeer = new Peer();
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
const videos = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
}).then(stream => {
    addVideoStream(myVideo, stream)

    // Want to answer any "calls" with our video stream
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })
    // Want to create a "call" with any new users
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]){
        peers[userId].close()
    }
    if (videos[userId]){
        videos[userId].close()
    }
})

myPeer.on('open', id =>{
    socket.emit('join-room', ROOM_ID, id)
})

// Connects the video to the stream and adds it to the videoGrid
function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

// Sends the userId the stream using myPeer
function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove();
    })

    peers[userId] = call
    videos[userId] = video
}