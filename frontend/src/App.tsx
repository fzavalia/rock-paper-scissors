import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import io from "socket.io-client";
import CreateLobby from "./views/CreateLobby";

export const socket = io("http://localhost:8080");

const App = () => (
  <Router>
    <Switch>
      <Route path="/lobbies/:id" render={() => <div>Lobby</div>}></Route>
      <Route path="/games/:id" render={() => <div>Game</div>}></Route>
      <Route component={CreateLobby}></Route>
    </Switch>
  </Router>
);

export default App;
