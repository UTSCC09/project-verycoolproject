import {React} from "react";
import { v1 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";

const CreateRoom = (props) => {
    let navigator = useNavigate();
    function create() {
        const id = uuid();
        navigator(`/room/${id}`);
    }

    return (
        <button onClick={create}>Create room</button>
    );
};

export default CreateRoom;