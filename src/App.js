import React, {Component} from 'react';
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
    const analytics = window.analytics;
    analytics.track('connectToSpotify', {})
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
