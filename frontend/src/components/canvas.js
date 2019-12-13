import React, { Component } from "react";

class Canvas extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }

  componentDidUpdate() {
    this.draw();
  }

  draw = () => {
    const canvas = this.canvasRef.current;
    const contex = canvas.getContext("2d");
    
    // clear screen
    contex.clearRect(0, 0, canvas.width, canvas.height);

    // loop through all players and draw each bird
    this.props.players.forEach((bird) => {
      contex.beginPath();
      contex.arc(
        bird.xPosition,
        bird.yPosition,
        bird.radius,
        0,
        Math.PI * 2);
      contex.fillStyle = bird.color;
      contex.fill();
    })
  }

  render() {
    return (
      <div>
        <canvas 
          ref={this.canvasRef} 
          width = {window.innerWidth} 
          height={window.innerHeight} 
        />
      </div>
    )
  }
}

export default Canvas