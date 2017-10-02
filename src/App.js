import React, {Component} from 'react';
import './App.css';
// import {Button} from 'react-bootstrap';
// import {Text} from 'react-primitives';
import styled from 'styled-components/primitives';

const View = styled.View`
background-color: black;
background-size: cover;
width: 100%;
padding-top: 15px;
height: 100%;`;

const Text = styled.Text`
color: white;
font-family: 'Montserrat';
text-align: center;
`;

const Title = Text.extend`
font-size: 18px;
font-weight: bold;
`;

const SubTitle = Text.extend`
margin-bottom: 30px;
font-size: 14px;
`;

const Button = styled.Touchable({
})
const ButtonTxt = styled.Text`
  color: #1DB954;
  border-color: #1DB954;
  border-style: solid;
  border-width: 1px;
  padding: 8px;
  width: 100%;
  max-width: 100px;
  border-radius: 4px;
  text-align: center;
  margin: auto;
`

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
      <View>
        <View className="title">
          <Title>LOCAL</Title>
          <View>
            <Title>CONCERTS</Title>
          </View>
        </View>
        <View className="subtitle">
          <Text>
            Connect to Spotify to listen to upcoming concerts in your area
          </Text>
        </View>
        <Button onClick={this.connectSpotify}>
          <ButtonTxt>Connect to Spotify</ButtonTxt>
        </Button>
      </View>
    );
  }
}

export default App;
