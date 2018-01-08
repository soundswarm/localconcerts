import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Listen from './Listen';
import registerServiceWorker from './registerServiceWorker';
// import {Router, Route, Redirect} from 'react-router';
import { Router } from 'react-router';
import {  BrowserRouter,  Route} from 'react-router-dom';
ReactDOM.render(
  <BrowserRouter>
    <div className='mainContainer'>
      <Route exact path="/" component={App} />
      <Route path="/listen" component={Listen} />
    </div>
  </BrowserRouter>,
  document.getElementById('root'),
);
registerServiceWorker();
