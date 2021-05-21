import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
const fs = require('fs');

import './App.global.css';

class Hello extends React.Component {

  constructor(props) {
    super(props);

    this.camera = React.createRef();
    this.canvas = React.createRef();

    this.state = {
      cameraStreamMounted: false,
      className: 'rock',
      sampleIdx: 116,
    }
  }

  componentDidMount() {
    this.mountCameraStream(this.camera.current)
  }

  // mount camera video stream to video element
  mountCameraStream = (cameraElement) => {
    cameraElement.msHorizontalMirror = true;

    if (!navigator.mediaDevices.getUserMedia) {
      console.log('No camera?')
      return
    }

    navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 }, audio: false })
      .then((stream) => {
        cameraElement.srcObject = stream;

        this.setState({
          cameraStreamMounted: true,
        })
      })
      .catch((error) => {
        console.log("Something went wrong: " + error);
      })
  }

  takePhoto = () => {
    const sampleIdx = this.state.sampleIdx
    const className = this.state.className

    const cameraElement = this.camera.current
    const canvasElement = this.canvas.current

    canvasElement.getContext('2d').drawImage(cameraElement, 0, 0, 300, 300);

    const photoData = canvasElement.toDataURL('image/png').replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
    const filePath = `/Users/roman/Projects/kaggle/frtgnn-rock-paper-scissor/data/webcam/${className}/glu_${sampleIdx}.png`
    //const filePath = `/Users/roman/Projects/kaggle/frtgnn-rock-paper-scissor/data/noise/glu_${sampleIdx}.png`

    fs.writeFile(filePath, photoData, 'base64', (err) => {
      if (err) {
        alert(`There was a problem saving the photo: ${err.message}`);
      }

      this.setState({sampleIdx: sampleIdx + 1})
    });

  }

  render() {
    return (
      <div>
        <h1>Campy</h1>
        <div className="Hello">
          <canvas ref={this.canvas} width="300" height="300" style={{'display': 'none'}}></canvas>
          <video ref={this.camera} playsInline={true} autoPlay={true}></video>
        </div>
        <select value={this.state.className} onChange={(event) => this.setState({className: event.target.value})}>
          <option value="rock">Rock</option>
          <option value="paper">Paper</option>
          <option value="scissors">Scissors</option>
        </select>
        <button onClick={this.takePhoto}>Capture</button>
      </div>
    );
  }
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}
