import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Listen from './Listen';
import registerServiceWorker from './registerServiceWorker';
// import {Router, Route, Redirect} from 'react-router';
import {  HashRouter,  Route,  Redirect} from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';
const history = createBrowserHistory();
ReactDOM.render(
  <HashRouter>
    <div>
      <Route exact path="/" component={App} />
      <Route path="/listen" component={Listen} />
    </div>
  </HashRouter>,
  document.getElementById('root'),
);
registerServiceWorker();
