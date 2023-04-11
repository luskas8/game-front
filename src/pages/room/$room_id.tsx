
import { useParams } from "react-router-dom"
import socket from "../../services/socket";
import { FormEvent } from "react";

type RoomParams = {
    room_id: string;
}

export default function Room() {
    const { room_id } = useParams<RoomParams>()

    socket.on("connect", () => {
        console.log("connected")
    })

    socket.emit("join", { room_id, participant_id: getParticipantId() })

    socket.on("participant_id", (data: { participant_id: string }) => {
        localStorage.setItem('game-participant_id', JSON.stringify(data.participant_id))
    })

    socket.on("disconnect", () => {
        console.log("disconnected")
        socket.emit("leave", { room_id, participant_id: getParticipantId() })
    })

    socket.on("reconnect", () => {
        console.log("reconnected")
        socket.emit("join", { room_id, participant_id: getParticipantId() })
    })

    socket.on("message_room", (data: { message: string, owner: string }) => {
        console.log(data)
    })

    function handleSubmit(event: FormEvent) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget as HTMLFormElement)
        let data: { [key:string]: string } = {}
        formData.forEach((value, key) => {
        data[key] = value.toString().trim() as string
        })

        socket.emit("message", { room_id, owner: getParticipantId(), message: data["message"] })
    }
    
    function getParticipantId() {
        const participant_id = localStorage.getItem('game-participant_id')
        if (!participant_id) {
            return null
        }
        return JSON.parse(participant_id)
    }
    return (
        <div className="flex flex-col max-h-screen overflow-hidden">
            <span>Room id: {room_id}</span>
            <span>Participant id: {getParticipantId()}</span>

            <div className="w-full h-screen overflow-hidden">
                <div className="w-full h-full overflow-y-scroll">
                </div>
            </div>
            <form onSubmit={handleSubmit} className="w-full flex justify-center items-center bg-gray-200">
                <label className="w-full h-full px-2 py-4 focus-within:outline-2 focus-within:outline-emerald-300 focus-within:outline" htmlFor="message">
                    <input className="w-full h-full bg-transparent border-none outline-none" type="text" name="message" id="message" />
                </label>
                <button className="bg-emerald-400 p-4" type="submit">
                    Send
                </button>
            </form>
        </div>
    )
}