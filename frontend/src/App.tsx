import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import io from "socket.io-client";
import CreateLobby from "./views/CreateLobby";
import Lobby from "./views/Lobby";

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

const Game = (props: { id: string }) => {
  const [game, setGame] = useState<any>(undefined);

  useEffect(() => {
    socket.emit("find-game", props.id);
  }, [props.id]);

  useEffect(() => {
    const onFoundGame = (data: any) => setGame(data.game);
    socket.on("found-game", onFoundGame);
    return () => {
      socket.off("found-game", onFoundGame);
    };
  });

  if (!game) {
    return null;
  }

  return <div style={{ padding: "1rem" }}>foo</div>;
};

export default App;
