import { io } from "socket.io-client"
import { getParticipantId, getRoomId, setParticipantId } from "./session"

const socket = io("http://localhost:3333")

socket.on("connect", () => {
    console.log("connected")
})

socket.on("disconnect", () => {
    console.log("disconnected")
    const room_id = getRoomId()
    const participant_id = getParticipantId()
    
    if (room_id && participant_id) {
        socket.emit("leave", { room_id, participant_id })
    }
})

socket.on("reconnect", () => {
    console.log("reconnected")
    socket.emit("join", { room_id: getRoomId(), participant_id: getParticipantId() })
})

export default socket