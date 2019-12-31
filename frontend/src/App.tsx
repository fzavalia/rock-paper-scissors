import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:8080");

const App = () => {
  return (
    <Router>
      <Switch>
        <Route
          path="/:id"
          render={props => <Lobby id={props.match.params.id} onError={() => props.history.push("/")} />}
        />
        <Route render={props => <CreateLobby onCreate={data => props.history.push(`/${data.lobby.id}`)} />} />
      </Switch>
    </Router>
  );
};

const Lobby = (props: { id: string; onError: () => void }) => {
  const [lobby, setLobby] = useState<any>(undefined);

  useEffect(() => {
    const onJoinedLobby = (data: any) => setLobby(data.lobby);
    const onCreatedGame = console.log;
    const onRuntimeError = props.onError;
    const onOpponentDisconnected = (data: any) => {
      setLobby({ ...lobby, playerIds: lobby.playerIds.filter((playerId: string) => playerId !== data.playerId) });
    };

    socket.emit("join-lobby", props.id);
    socket.on("joined-lobby", onJoinedLobby);
    socket.on("created-game", onJoinedLobby);
    socket.on("runtime-error", onRuntimeError);
    socket.on("opponent-disconnected", onOpponentDisconnected);

    return () => {
      socket.off("joined-lobby", onJoinedLobby);
      socket.off("created-game", onCreatedGame);
      socket.off("runtime-error", onRuntimeError);
      socket.off("opponent-disconnected", onOpponentDisconnected);
    };
  }, []);

  if (!lobby) {
    return null;
  }

  return (
    <>
      {lobby.playerIds.map((playerId: any) => (
        <div key={playerId}>{playerId}</div>
      ))}
      <button disabled={lobby.playerIds.length < 2} onClick={() => socket.emit("create-game", lobby.id)}>
        Create Game
      </button>
    </>
  );
};

const CreateLobby = (props: { onCreate: (lobby: any) => void }) => {
  const [bestOf, setBestOf] = useState(1);

  useEffect(() => {
    socket.on("created-lobby", props.onCreate);
    return () => {
      socket.off("created-lobby", props.onCreate);
    };
  });

  return (
    <>
      <div>
        <label>Best Of </label>
        <input type="number" value={bestOf} onChange={e => setBestOf(parseInt(e.target.value))} />
      </div>
      <button onClick={() => socket.emit("create-lobby", bestOf)}>Create Lobby</button>
    </>
  );
};

export default App;
