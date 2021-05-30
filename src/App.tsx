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
      classNames: ['rock', 'paper', 'scissors'],
      projectDir: '/Users/roman/Projects/kaggle/frtgnn-rock-paper-scissor/data/webcam/',
      projectPrefix: 'glu_',
    }

    this.getClassIndices(this.state.projectDir)
  }

  componentDidMount() {
    this.mountCameraStream(this.camera.current)
  }

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
      }).catch((error) => {
        console.log("Something went wrong: " + error);
      })
  }

  getClassIndices = (projectDir) => {
    const { classNames } = this.state

    classNames.forEach(className => {
      console.log(className)

      fs.readdir(`${projectDir}${className}`, (err, files) => {
        console.log(files)
        console.log(files.lastItem)
        console.log(files.lastItem.match(/\d+/g)[0])
        const lastSampleIndex = parseInt(files.lastItem.match(/\d+/g)[0]) + 1 // todo: handle no items/no numbers cases

        this.setState(prevState => ({
          'indices': {
            ...prevState.indices,
            [className]: lastSampleIndex,
          },
          'classStats': {
            ...prevState.classStats,
            [className]: files.length,
          }
        }))
      })
    });
  }

  selectProjectDir = () => {
    const path = dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    console.log('directories selected', path)
  }

  takePhoto = () => {
    const { className, classStats, projectDir, projectPrefix, indices } = this.state

    console.log(indices)
    console.log(classStats)

    const sampleIdx = indices[className]
    const numClassSamples = classStats[className]

    const cameraElement = this.camera.current
    const canvasElement = this.canvas.current

    canvasElement.getContext('2d').drawImage(cameraElement, 0, 0, 300, 300);

    const photoData = canvasElement.toDataURL('image/png').replace(/^data:image\/(png|jpg|jpeg);base64,/, '');

    const filePath = `${projectDir}${className}/${projectPrefix}${sampleIdx}.png`

    fs.writeFile(filePath, photoData, 'base64', (err) => {
      if (err) {
        alert(`There was a problem saving the photo: ${err.message}`);
      }

      console.log(`${filePath} has been created ✅`)

      this.setState(prevState => ({
        'indices': {
          ...prevState.indices,
          [className]: sampleIdx + 1,
        },
        'classStats': {
          ...prevState.classStats,
          [className]: numClassSamples + 1,
        }
      }))
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
        <div>
          <div>
            <input type="text" placeholder={this.state.projectDir} id="actual-file" disabled="disabled"/>
            <input type="button" onClick={() => this.selectProjectDir()} value="Choose a file" id="select-file"/>
          </div>
          <div>
            <select value={this.state.className} onChange={(event) => this.setState({className: event.target.value})}>
              {this.state.classNames.map((className) => <option key={className} value={className}>{className}</option>)}
            </select>
          </div>
          <button onClick={this.takePhoto}>Capture</button>
        </div>
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
