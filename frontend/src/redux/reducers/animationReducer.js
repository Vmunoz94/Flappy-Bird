const INITIAL_STATE = {
  players: [],
  player: {
    id: null,
  }
};

const animationReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case "SET_PLAYERS": {
      return {
        ...state,
        players: action.players
      };
    }
    case "SET_PLAYER_ID": {
      return {
        ...state,
        player: {
          ...state.player,
          id: action.id
        }
      };
    }
    default:
      return state;
  }
};

export default animationReducer;
