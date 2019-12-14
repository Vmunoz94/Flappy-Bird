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
    const context = canvas.getContext("2d");
    
    // clear screen
    context.clearRect(0, 0, canvas.width, canvas.height);

    this.drawPipes(context);
    this.drawBirds(context);
  }

  drawBirds = (context) => {
    // loop through all players and draw each bird
    this.props.players.forEach((bird) => {
      context.beginPath();
      context.arc(
        bird.xPosition,
        bird.yPosition,
        bird.radius,
        0,
        Math.PI * 2);
      context.fillStyle = bird.color;
      context.fill();
    });
  };

  drawPipes = (context) => {
    // loop through all pipes and draw 
    this.props.pipes.forEach((pipe) => {
      context.fillStyle = pipe.color;
      context.fillRect(pipe.xPosition, pipe.yPosition, pipe.width, pipe.height);
    });
  };

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