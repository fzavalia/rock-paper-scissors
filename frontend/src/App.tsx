import React, { useEffect, Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import io from "socket.io-client";
import { SnackbarProvider, withSnackbar } from "notistack";
import CreateLobby from "./views/CreateLobby";
import Lobby from "./views/Lobby";
import Game from "./views/Game";
import ErrorNotification from "./components/ErrorNotification";

export const socket = io(process.env.REACT_APP_SOCKET_HOST || "");

const App = () => {
  return (
    <SnackbarProvider maxSnack={3}>
      <ErrorNotification>
        <Router>
          <Switch>
            <Route path="/lobbies/:id" render={props => <Lobby id={props.match.params.id} />}></Route>
            <Route path="/games/:id" render={props => <Game id={props.match.params.id} />}></Route>
            <Route component={CreateLobby}></Route>
          </Switch>
        </Router>
      </ErrorNotification>
    </SnackbarProvider>
  );
};

export default App;
