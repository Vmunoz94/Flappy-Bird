export const setPlayerId = id => {
  return {
    type: "SET_PLAYER_ID",
    id,
  };
};

export const setPlayerLocations = players => {
  return {
    type: "SET_PLAYERS",
    players,
  };
};