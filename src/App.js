import React, {Component} from 'react';
import {Button} from 'react-bootstrap';
let sporityauthurl = 'https://accounts.spotify.com/authorize?client_id=5558527c701b4eaaa340858ec6cd8cb8&response_type=token&state=123&redirect_uri=';
sporityauthurl += window.location.href + 'listen';
console.log('SPORITYAUTHURL', sporityauthurl);
class App extends Component {
  componentDidMount() {
    window.addEventListener('message', function(e) {
      const message = e.data;
      console.log('message,', message);
    });
  }
  connectSpotify() {
    const OAuth = window.OAuth;
    OAuth.initialize('hPtKTa_GQdn9yfGJA4GYZzakU5s');
    OAuth.redirect('spotify', window.location.href + 'listen');
    const analytics = window.analytics;
    analytics.track('connectToSpotify', {});
    // let sporityauthurl = 'https://accounts.spotify.com/authorize?client_id=5558527c701b4eaaa340858ec6cd8cb8&response_type=token&state=123&redirect_uri=';
    // sporityauthurl += 'http:%2F%2Flocalhost:3000%2F#%2Flisten';
    // console.log('SPORITYAUTHURL', sporityauthurl)
    // window.location = sporityauthurl
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
