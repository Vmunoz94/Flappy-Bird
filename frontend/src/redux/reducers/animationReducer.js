const INITIAL_STATE = {
  players: [],
  player: {
    id: null,
  },
  pipes: [],
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
    case "SET_PIPES": {
      return {
        ...state,
        pipes: action.pipes
      };
    }
    default:
      return state;
  };
};

export default animationReducer;
