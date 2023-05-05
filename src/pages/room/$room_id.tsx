
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom"
import socket from "../../services/socket";
import { FormEvent, useEffect, useState } from "react";
import { getParticipantId, setParticipantId, setRoomId } from "../../services/session";
import api from "../../services/api";

type Character = {
    name: string;
    favoritePlaceId: string;
}

interface AvailableCharacters extends Character {
    inUse: boolean;
}

type RoomParams = {
    room_id: string;
    participant_id: string;
    characters: AvailableCharacters[];
}

export default function Room() {
    const { room_id, participant_id, characters } = useLoaderData() as RoomParams
    const [timer, updateTimer] = useState<number>(30)
    const [character, updateCharacter] = useState<Character | null>(null)
    const [availableCharacters, updateAvailableCharacters] = useState<AvailableCharacters[]>(characters || [])

    socket.on("participant_id", (data: { participant_id: string }) => {
        setParticipantId(data.participant_id)
    })

    socket.on('start', () => {
        console.log("start")
        startTimer()
    })

    socket.on('end', () => {
        console.log("end")
    })

    socket.on("your_character", (data: { player: Character }) => {
        console.log("your_character", data.player.name)
        updateCharacter(_ => data.player)

    })

    socket.on("available_characters", (data: { characters: AvailableCharacters[], sender?: string }) => {
        console.log("available_characters", data.characters)
        
        // if (data.sender === participant_id) return
        updateAvailableCharacters(_ => data.characters)
    })

    function handleCharacter(event: React.ChangeEvent<HTMLSelectElement>) {
        const characterName = event.target.value

        const character = availableCharacters.find(character => character.name === characterName)
        if (!character) return

        updateCharacter(_ => character)
        socket.emit("choose_character", { room_id, participant_id, character: characterName })
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget as HTMLFormElement)
        let data: { [key:string]: string } = {}
        formData.forEach((value, key) => {
            data[key] = value.toString().trim() as string
        })
        
        if (data["character"] === "none") {
            console.log("select a character")
            return
        }

        console.log("send message")
        socket.emit("message", { room_id, owner: getParticipantId(), message: data["message"] })
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

    useEffect(() => {
        socket.emit("character", { room_id, participant_id: participant_id })
    }, [])

    if (!characters) {
        return "Characters not set"
    }

    return (
        <div className="flex flex-col max-h-screen overflow-hidden">
            <span>Room id: {room_id}</span>
            <span>Participant id: {participant_id}</span>
            <span className="text-lg text-slate-700">{timer}</span>

            <form onSubmit={handleSubmit} className="w-full flex justify-center items-center py-6 bg-gray-200">
                <div className="flex flex-col gap-4">
                    <select onChange={handleCharacter} value={character?.name || "none"} id="character" name="character">
                        <option value="none">Selecione</option>
                        {availableCharacters.map(character => {
                            return (
                                <option disabled={character.inUse} key={`character-${character.favoritePlaceId}`} value={character.name}>{character.name}</option>
                            )
                        })
                        }
                    </select>
                    <button className="bg-emerald-400 rounded-sm p-4" type="submit">
                        Send
                    </button>
                </div>
            </form>
        </div>
    )
}

export async function loader({ params }: LoaderFunctionArgs): Promise<{}> {
    const { room_id } = params as { room_id: string }
    const participant_id = getParticipantId()

    const response = await api.get(`/characters/${room_id}`).catch(error => {
        return error.response
    })

    setRoomId(room_id)
    socket.emit("join", { room_id, participant_id })

    return { room_id, participant_id, characters: response.data.characters }
}