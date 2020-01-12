import React, { useEffect, Component, useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import io from "socket.io-client";
import { SnackbarProvider } from "notistack";
import CreateLobby from "./views/CreateLobby";
import Lobby from "./views/Lobby";
import Game from "./views/Game";
import ErrorNotification from "./components/ErrorNotification";
import { Typography } from "@material-ui/core";

export const socket = io(process.env.REACT_APP_SOCKET_HOST || "");

const App = () => {
  const [connected, setConected] = useState(false);

  useEffect(() => {
    const onConnection = () => setConected(true);
    socket.on("connect", onConnection);
    return () => {
      socket.off("connect", onConnection);
    };
  });

  if (!connected) {
    return null;
  }

  return (
    <SnackbarProvider maxSnack={3}>
      <ErrorNotification>
        <div
          style={{
            display: "flex",
            justifyContent: "center"
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 400, width: "100%", margin: "1rem" }}>
            <Typography
              style={{
                color: "white",
                width: "100%",
                textShadow: "0px 0px 5px rgba(0, 0, 0, 0.14)",
                marginBottom: "2rem",
                marginTop: "1rem"
              }}
              variant="h5"
              gutterBottom
            >
              <b>Rock, Paper & Scissors Online!</b>
            </Typography>
            <div
              style={{
                boxSizing: "border-box",
                padding: "1rem",
                width: "100%",
                backgroundColor: "white",
                borderRadius: "1rem",
                boxShadow: "0px 0px 20px 10px rgba(0,0,0,0.14)"
              }}
            >
              <Router>
                <Switch>
                  <Route path="/lobbies/:id" render={props => <Lobby id={props.match.params.id} />}></Route>
                  <Route path="/games/:id" render={props => <Game id={props.match.params.id} />}></Route>
                  <Route component={CreateLobby}></Route>
                </Switch>
              </Router>
            </div>
          </div>
        </div>
      </ErrorNotification>
    </SnackbarProvider>
  );
};

export default App;
