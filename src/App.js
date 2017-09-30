import React, {Component} from 'react';
import './App.css';
import {Button} from 'react-bootstrap';

class App extends Component {
  componentDidMount() {
    window.addEventListener('message', function(e) {
      const message = e.data;
      console.log('message,', message)
    });
  }
  connectSpotify() {
    const OAuth = window.OAuth;
    OAuth.initialize('hPtKTa_GQdn9yfGJA4GYZzakU5s');
    OAuth.redirect('spotify', window.location.href + 'listen');
  }
  render() {
    return (
      <div className="app">
        <div className="title">
          LOCAL
          <div>
            CONCERTS
          </div>
        </div>
        <div className="subtitle">
          Connect to Spotify to listen to upcoming concerts in your area
        </div>
        <Button onClick={this.connectSpotify}>Connect to Spotify</Button>
      </div>
    );
  }
}

export default App;
