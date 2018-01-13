import React, {Component} from 'react';
import {Button} from 'react-bootstrap';

class App extends Component {
  componentDidMount() {
    window.addEventListener('message', function(e) {
      const message = e.data;
      console.log('message,', message);
    });
  }
  connectSpotify=()=> {
    let spotifyAuthUrl = 'https://accounts.spotify.com/authorize?client_id=5558527c701b4eaaa340858ec6cd8cb8&response_type=token&state=123&redirect_uri=';
    spotifyAuthUrl += `${window.location.origin}/listen`
    window.location = spotifyAuthUrl
  }

  render() {
    return (
      <div className="landingApp">
        <div className="title">
          SEE
          <div>
            musIQ
          </div>
        </div>
        <div className="subtitle">
          Discover upcoming concerts near you by artists you'll love
        </div>
        <Button onClick={this.connectSpotify}>Connect with Spotify</Button>
      </div>
    );
  }
}

export default App;
