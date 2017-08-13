import React, {Component} from 'react';
import './App.css';
const OAuth = window.OAuth;
const axios = window.axios;
console.log('ww', window.location)
class App extends Component {
  componentDidMount() {
    OAuth.initialize('hPtKTa_GQdn9yfGJA4GYZzakU5s');
    OAuth.redirect('spotify', window.location.origin+'/callback');
  }
  render() {
    return (
      <div>

      </div>
    );
  }
}

export default App;
