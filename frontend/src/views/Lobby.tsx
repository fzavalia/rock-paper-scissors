import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Typography, List, ListItem, Button } from "@material-ui/core";
import { socket } from "../App";

const Lobby = (props: { id: string }) => {
  const history = useHistory();

  const [lobby, setLobby] = useState<any>(undefined);

  // join lobby
  useEffect(() => {
    socket.emit("join-lobby", props.id);
  }, [props.id]);

  // handle socket events
  useEffect(() => {
    const onUpdatedLobby = (lobby: any) => setLobby(lobby);
    const onRuntimeError = () => history.push("/");
    const onGameCreated = (game: any) => history.push(`/games/${game.id}`);
    socket.on("updated-lobby", onUpdatedLobby);
    socket.on("runtime-error", onRuntimeError);
    socket.on("created-game", onGameCreated);
    return () => {
      socket.off("updated-lobby", onUpdatedLobby);
      socket.off("runtime-error", onRuntimeError);
      socket.off("created-game", onGameCreated);
    };
  });

  // dont show anything if lobby hasn't been joined yet
  if (!lobby) {
    return null;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <Typography variant="body1" gutterBottom>
        {lobby.opponentId ? "All players are ready!" : "Waiting for opponent..."}
      </Typography>
      <Button disabled={!lobby.opponentId} onClick={() => socket.emit("create-game", lobby.id)} variant="contained">
        Start
      </Button>
    </div>
  );
};

export default Lobby;
