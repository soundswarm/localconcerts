import React, {Component} from 'react';
import {Button} from 'react-bootstrap';
// import SpotifyWebApi from 'spotify-web-api-node';
var SpotifyWebApi = require('spotify-web-api-node');
// let spotifyAuthUrl = 'https://accounts.spotify.com/authorize?client_id=5558527c701b4eaaa340858ec6cd8cb8&response_type=token&state=123&redirect_uri=';
// spotifyAuthUrl += window.location.href + 'listen';
// console.log('SPORITYAUTHURL', spotifyAuthUrl);
class App extends Component {
  componentDidMount() {
    window.addEventListener('message', function(e) {
      const message = e.data;
      console.log('message,', message);
    });
    console.log('tp', this.props.location)
  }
  connectSpotify() {
    var spotifyApi = new SpotifyWebApi({
      clientId: '5558527c701b4eaaa340858ec6cd8cb8',
      redirectUri: 'http%3A%2F%2Flocalhost%3A3000%2Flisten',
      response_type: 'token',
    });
// "AQAGqEtP__PCd1gNB5yZF6iVVM4KQf2VgmzlBbwU2WrGqgfrQxZHOjPK1FEVeQQYEWMZlZEZ2bhrww14bLrwM6dulJ5xDMiWFb88ubKFFiZsf30M9FddjHZIY4-HsWfF5w9F__-NiDJuABO29lhZ0MIPu3kQC2IpYgFhKiQPy_-yJmGIcUvjiG1YfRQt8qaEySFavbYVlx-fvu5v-4DEkAGbQw"
    // var scopes = [ 'user-read-email'];
    // var state = 'some-state-of-my-choice';
    // var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    // console.log('AUTHORIZEURL', authorizeURL);
    // window.location = authorizeURL;

    // const OAuth = window.OAuth;
    // OAuth.initialize('hPtKTa_GQdn9yfGJA4GYZzakU5s');
    // OAuth.redirect('spotify', window.location.href + 'listen');
    // const analytics = window.analytics;
    // analytics.track('connectToSpotify', {});
    // let spotifyAuthUrl = 'https://accounts.spotify.com/authorize?client_id=5558527c701b4eaaa340858ec6cd8cb8&redirect_uri=http:%2F%2Flocalhost:3000%2F#%2Flisten&scope=user-read-private%20user-read-email&response_type=token&state=123'
    // let spotifyAuthUrl = 'https://accounts.spotify.com/authorize?client_id=5558527c701b4eaaa340858ec6cd8cb8&redirect_uri=localhost:3000%2F#%2Flisten&response_type=token&state=123'

    // let spotifyAuthUrl='https://accounts.spotify.com/authorize?client_id=5fe01282e94241328a84e7c5cc169164&redirect_uri=http:%2F%2Fexample.com%2Fcallback&scope=user-read-private%20user-read-email&response_type=token&state=123'
    let spotifyAuthUrl = 'https://accounts.spotify.com/authorize?client_id=5558527c701b4eaaa340858ec6cd8cb8&response_type=token&state=123&redirect_uri=';
    spotifyAuthUrl += 'http://localhost:3000/listen'
    // spotifyAuthUrl += 'http:%2F%2Flocalhost:3000%2F#%2Flisten';
    // console.log('SPORITYAUTHURL', spotifyAuthUrl)
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
