export function setParticipantId(participant_id: string): void {
    localStorage.setItem('game-participant_id', JSON.stringify(participant_id))
}

export function getParticipantId(): string | null {
    const participant_id = localStorage.getItem('game-participant_id')
    if (!participant_id) {
        return null
    }
    return JSON.parse(participant_id)
}

export function setRoomId(room_id: string): void {
    localStorage.setItem('game-room_id', JSON.stringify(room_id))
}

export function getRoomId(): string | null {
    const room_id = localStorage.getItem('game-room_id')
    if (!room_id) {
        return null
    }
    return JSON.parse(room_id)
}