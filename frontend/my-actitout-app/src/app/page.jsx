"use client";
import { useEffect, useState, useRef } from "react";
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { sanitize } from "isomorphic-dompurify";
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from "react-redux";
import { selectProperty } from '../selectors/useSelector';
import { setUser, set_username, set_userid } from "../store/User/userSlice";
import { Logo } from "../components/"
import { v1 } from "uuid"


import { getRandomRoom, createRoom, createUser, addPlayerToRoom, getRoomById, getUsername, deleteUser } from "../api/api.mjs"


const Main = () => {
  const [avatarSvg, setAvatarSvg] = useState("");
  const username = useSelector(selectProperty('username'));

  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState("");
  const { push } = useRouter();


  const searchParams = useSearchParams();
  const room_id = searchParams.get('id');

  const roomCodeInput = useRef(null);



  useEffect(() => {
    set_username(document.cookie)
  }, [])

  useEffect(() => {
    setAvatarSvg(
      createAvatar(adventurer, {
        seed: username,
      })
    );
  }, [username]);

  const playGame = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {

      const userId = await createUser(username);
      console.log(document.cookie);
      dispatch(set_userid(userId))

      let roomData;
      //check if user has passed a room id  to join
      if (room_id !== null) {
        roomData = await getRoomById(room_id);
      }
      else {
        //  randomly finds a room from database and redirect to /lobby/roomid
        roomData = await getRandomRoom();

      }

      // Check if the room exists
      if (roomData) {
        // Redirect to the existing room
        const { _id, players } = roomData;

        if (players.length >= 8) {
          setLoading(false);
          setPopup("Room is Full!")
          return;
        }

        addPlayerToRoom(_id, userId)
          .then(() => {
            push(`lobby/${_id}`);
          })
          .catch((error) => {
            // Your code to handle any errors that occurred during the addition
            console.error(error);
          });
      }
      else {
        setPopup("No rooms are Available! Create one :)")
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }

  };

  const createGame = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const userId = await createUser(username);
      console.log(userId)
      dispatch(set_userid(userId))

      //create a room wiht owner id
      const roomData = await createRoom(userId);
      const { roomId } = roomData
      setLoading(false);
      push(`lobby/${roomId}`);

    } catch (err) {
      // console.error(err);
      setLoading(false);
      console.error(err);
      setPopup("No rooms are Available!")
    }
  };


  return (
    <div className="h-full dead-center">
      {loading ? (
        <div className="loader"></div>
      ) : popup !== "" ? (
        <div>
          <div className="blur"></div>
          <div className="popup-container">
            <h2>{popup}</h2>
            {popup && (
              <button
                onClick={() => setPopup("")}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold my-5 py- px-4 rounded"
              >
                Ok
              </button>
              // <button onClick={() => setPopup("")}>Ok</button>
            )}
          </div>
        </div>
      ) : (
        <div className=" flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <Logo />
          <div className="bg-blue-300 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="p-3 rounded-lg space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                  Hello {username}
                </label>
                <div className="mt-2">
                  <input
                    id="username"
                    name="username"
                    type="name"
                    value={username}
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    onChange={(e) =>
                      dispatch(set_username(e.target.value))
                    }
                  />
                </div>
                <div className="my-2 flex justify-center w-full">
                  <div
                    className="h-40 w-40"
                    dangerouslySetInnerHTML={{ __html: sanitize(avatarSvg) }}
                  ></div>
                </div>
              </div>


              <div>
                <button
                  className="block bg-green-500 hover:bg-green-600 w-full text-white rounded h-10 mt-4 mb-1"
                  onClick={playGame}
                >
                  Play
                </button>
                <button
                  className="block bg-green-500 hover:bg-green-600 w-full text-white rounded h-10 mt-4 mb-1"
                  onClick={createGame}
                >
                  Create A Game
                </button>
              </div>


            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Main;



