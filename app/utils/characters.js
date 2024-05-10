const updateParticipantBattleStatus = (deepCloneParticipants, participant, attr, value = 5) => {
    // Directly find and update the participant in deepCloneParticipants
    const participantIndex = deepCloneParticipants.findIndex(p => p.id === participant.id);
    if (attr === 'SPEED') {
        if (deepCloneParticipants[participantIndex].attributes.SPEED - value < 0) {
            deepCloneParticipants[participantIndex].attributes.SPEED = 0;
        } else if (deepCloneParticipants[participantIndex].attributes.SPEED === 0) {
            deepCloneParticipants[participantIndex].attributes.SPEED = participants[participantIndex].attributes.SPEED;
        } else {
            deepCloneParticipants[participantIndex].attributes.SPEED -= value;
        }
    } else if (attr === 'hp_battle') {
        deepCloneParticipants[participantIndex].attributes.hp_battle -= value;
    }
    
};

module.exports = {
    updateParticipantBattleStatus
};