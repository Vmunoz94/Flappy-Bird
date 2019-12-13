import React, { Component } from 'react';
import { connect } from "react-redux";
import Canvas from './canvas';

// import redux actions
import {
  setPlayerId,
  setPlayerLocations,
} from '../redux/actions/animationActions';

const webSocket = new WebSocket('ws://localhost:4000');
let PLAYERS = [];
let ID = null;

/* 
  HANDLE WEBSOCKET CONNECTION
*/
webSocket.onopen = () => {
  console.log('websocket connection established');
};
webSocket.onclose = () => {
  console.log('websocket connection closed');
};
webSocket.onerror = (e) => {
  console.log('websocket connection error', e);
};
webSocket.onmessage = (message) => {
  let data = JSON.parse(message.data)

  switch (data.type) {
    case 'clientConnected':{
      ID = data.action.id;
      const start = {
        type: 'startGame',
        action: ID,
      }
      webSocket.send(JSON.stringify(start));
      break;
    }
    case 'players':{
      PLAYERS = data.action.players;
      break;
    }
    default:
      console.log(data.type)
      console.log(data.action);
  };
};

class Animation extends Component{
  constructor(props) {
    super(props);
    this.updateAnimationState = this.updateAnimationState.bind(this)
  }

  componentDidMount() {
    this.rAF = requestAnimationFrame(this.updateAnimationState);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.rAF)
  }

  updateAnimationState() {
    // update player id && player locations
    this.props.setPlayerId(ID);
    this.props.setPlayerLocations(PLAYERS);
    this.rAF = requestAnimationFrame(this.updateAnimationState);
  }

  flap = (e) => {
    // when space bar is pressed -> flap bird and send to server
    if (e.keyCode === 32){
      let flap = {
        type: 'playerFlap',
        action: this.props.player.id,
      }
      webSocket.send(JSON.stringify(flap))
    }
  }

  render(){
    return (
      <div onKeyDown={this.flap} tabIndex="0">
        <Canvas 
          players={this.props.players} //pass all players to canvas to draw
        />
      </div>
    )
  }
}

/*
  REDUX
*/
const mapStateToProps = state => {
  return {
    players: state.animationReducer.players,
    player: state.animationReducer.player,
  };
};
const mapDispatchToProps = {
  setPlayerId,
  setPlayerLocations,
};

export default connect(mapStateToProps, mapDispatchToProps)(Animation);