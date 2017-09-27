import React, {Component} from 'react';
import './App.css';
import {Button} from 'react-bootstrap';
import {View, Text} from 'react-primitives';
import styled from 'styled-components/primitives';

class App extends Component {
  componentDidMount() {
    window.addEventListener('message', function(e) {
      const message = e.data;
      console.log('MESSAGE', message);
    });
  }
  connectSpotify() {
    const OAuth = window.OAuth;
    OAuth.initialize('hPtKTa_GQdn9yfGJA4GYZzakU5s');
    OAuth.redirect('spotify', window.location.href + 'listen');
  }
  render() {
    return (
      <View className="app">
        <View className="title">
          <Text>LOCAL</Text>
          <View>
            <Text>CONCERTS</Text>
          </View>
        </View>
        <View className="subtitle">
          <Text>
            Connect to Spotify to listen to upcoming concerts in your area
          </Text>
        </View>
        <Button onClick={this.connectSpotify}>
          <Text>Connect to Spotify</Text>
        </Button>
      </View>
    );
  }
}

export default App;
