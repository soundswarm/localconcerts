import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Callback from './Callback'
import Home from './Home'
import registerServiceWorker from './registerServiceWorker';
import {Router, Route, Redirect} from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';
const history = createBrowserHistory();
ReactDOM.render(
  <Router history={history}>
  <div>
    <Route exact path="/" component={App}/>

    // <Route path="/home" component={Home}/>
    <Route path="/callback" component={Callback}/>
    </div>
  </Router>,
  document.getElementById('root'),
);
registerServiceWorker();
