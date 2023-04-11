import { FormEvent, useState } from "react"
import api from "../services/api"
import { Navigate } from "react-router-dom"

interface Room {
  id: string
  name: string
  owner: string
}

interface Participant {
  id: string
  scocket: unknown
}

interface Response {
  message: string
  room: Room
  participant: Participant
}

function Homepage() {
  const [error, updateError] = useState<string | null>(null)
  const [room, updateRoom] = useState<Room | null>(null)

  async function execute(data: { [key:string]: string }) {
    console.log("request", data)

    const response = await api.post('/room', data).catch(error => {
      return error.response
    })

    if (response.status !== 201) {
      updateRoom(room => null)
      updateError(error => {
        return response.data.message
      })
    }

    updateData(response.data as Response)

    updateRoom(room => {
      return response.data.room
    })
  }

  function updateData(data: Response) {
    localStorage.setItem('game-room_id', JSON.stringify(data.room.id))
    localStorage.setItem('game-participant_id', JSON.stringify(data.participant.id))
  }


  function handleSubmit(event: FormEvent) {
    updateError(error => null)
    event.preventDefault()
    const formData = new FormData(event.currentTarget as HTMLFormElement)
    let data: { [key:string]: string } = {}
    formData.forEach((value, key) => {
      data[key] = value as string
    })

    if (!!data['room_name']) {
      execute(data)
    }
  }

  return (
    <div className="Homepage">
      {room && <Navigate to={`/room/${room.id}`} />}
      <main className="w-full h-screen text-black">
        <form onSubmit={handleSubmit} className="w-full h-full flex flex-col gap-1 justify-center items-center text-slate-700">
          <label className="flex flex-col items-center text-black" htmlFor="room_name">
            <input className="p-2 border rounded-sm" placeholder="Enter room name" id="room_name" type="text" name="room_name"/>
            {error && <span className="text-red-500">{error}</span>}
          </label>

          <button className="bg-emerald-500 text-white rounded-sm p-2 w-[200px] hover:bg-emerald-700">
            Create room
          </button>
        </form>
      </main>
    </div>
  )
}

export default Homepage
