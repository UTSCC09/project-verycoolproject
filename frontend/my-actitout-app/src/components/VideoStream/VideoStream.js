import "./VideoStream.css"
import io from 'socket.io-client';
export function VideoStream(props){
    const socketInstance = io('http://localhost:9000');
    const [socket, setSocket] = useState(null);
    setSocket(socketInstance);

    return(
        <div id="video-box"></div>
    )
}