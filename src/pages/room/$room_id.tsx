
import { useParams, LoaderFunctionArgs, useLoaderData } from "react-router-dom"
import socket from "../../services/socket";
import { FormEvent, useState } from "react";
import { getParticipantId, setParticipantId, setRoomId } from "../../services/session";

type RoomParams = {
    room_id: string;
}

export default function Room() {
    const { room_id } = useLoaderData() as RoomParams
    const [timer, updateTimer] = useState<number>(30)
    const [output, setOutput] = useState<string | null>(null)

    socket.on("message_room", (data: { message: string, owner: string }) => {
        updateOutput(data)
    })

    socket.on("participant_id", (data: { participant_id: string }) => {
        setParticipantId(data.participant_id)
    })

    socket.on('start', () => {
        console.log("start")
        startTimer()
    })

    function handleSubmit(event: FormEvent) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget as HTMLFormElement)
        let data: { [key:string]: string } = {}
        formData.forEach((value, key) => {
        data[key] = value.toString().trim() as string
        })

        console.log("send message")
        socket.emit("message", { room_id, owner: getParticipantId(), message: data["message"] })
    }

    function updateOutput(data: any) {
        setOutput(_ => {
            return JSON.stringify(data, null, 2)
        })
    }

    function startTimer() {
        let time = 30
        const interval = setInterval(() => {
            time--
            updateTimer(_ => time)
            if (time === 0) {
                clearInterval(interval)
            }
        }, 1000)
    }

    return (
        <div className="flex flex-col max-h-screen overflow-hidden">
            <span>Room id: {room_id}</span>
            <span>Participant id: {getParticipantId()}</span>
            <span className="text-lg text-slate-700">{timer}</span>

            <div className="w-full h-screen overflow-hidden">
                {output && (
                    <pre className="text-sm bg-zinc-800 text-zinc-100 p-6 rounded-lg">
                    {output}
                </pre>
                )}
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

export async function loader({ params }: LoaderFunctionArgs): Promise<{}> {
    const { room_id } = params as { room_id: string }

    setRoomId(room_id)
    socket.emit("join", { room_id, participant_id: getParticipantId() })

    return { room_id }
}