import React, {Component} from 'react';
import {Button} from 'react-bootstrap';
import HowItWorks from './howItWorks';
const analytics = window.analytics;

class App extends Component {
  componentDidMount() {
    window.addEventListener('message', function(e) {
      const message = e.data;
      console.log('message,', message);
    });
  }
  connectSpotify = () => {
    analytics.track('connect button clicked');
    let spotifyAuthUrl = 'https://accounts.spotify.com/authorize?client_id=5558527c701b4eaaa340858ec6cd8cb8&response_type=token&state=123';
    spotifyAuthUrl += `&scope=${encodeURIComponent('playlist-modify-public user-top-read user-read-currently-playing')}`;
    spotifyAuthUrl += `&redirect_uri=${window.location.origin}/listen`;
    window.location = spotifyAuthUrl;
  };

  render() {
    return (
      <div className="landingApp">
        <div className="mainSection">
          <div className="title">
            SEE
            <div>
              musIQ
            </div>
          </div>
          <div className="subtitle">
            Connect to create a Spotify playlist of your favorite artists who are playing concerts near you
          </div>
          <Button onClick={this.connectSpotify}>Connect with Spotify</Button>
        </div>
        {/* <HowItWorks/> */}
      </div>
    );
  }
}

export default App;
