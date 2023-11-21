import { React } from "react";
import { v1 as uuid } from "uuid";
import { useRouter } from 'next/navigation';


const CreateRoom = (props) => {
    const { push } = useRouter();
    function create() {
        const id = uuid();
        push(`/room/${id}`);
    }

    return (
        <button onClick={create}>Create room</button>
    );
};

export default CreateRoom;