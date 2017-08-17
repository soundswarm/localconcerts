import React, {Component} from 'react';
import './App.css';
const OAuth = window.OAuth;
class App extends Component {
  componentDidMount() {
    OAuth.initialize('hPtKTa_GQdn9yfGJA4GYZzakU5s');
    OAuth.redirect('spotify', window.location.href + 'listen');
    window.addEventListener('message', function(e) {
      const message = e.data;
      console.log('MESSAGE', message)
    });
  }
  render() {
    return <div />;
  }
}

export default App;
