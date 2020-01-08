import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import io from "socket.io-client";
import CreateLobby from "./views/CreateLobby";
import Lobby from "./views/Lobby";
import Game from "./views/Game";

export const socket = io("http://localhost:8080");

const App = () => (
  <Router>
    <Switch>
      <Route path="/lobbies/:id" render={props => <Lobby id={props.match.params.id} />}></Route>
      <Route path="/games/:id" render={props => <Game id={props.match.params.id} />}></Route>
      <Route component={CreateLobby}></Route>
    </Switch>
  </Router>
);

export default App;
