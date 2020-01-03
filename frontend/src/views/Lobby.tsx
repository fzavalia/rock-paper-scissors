import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Typography, List, ListItem, Button, Card } from "@material-ui/core";
import { socket } from "../App";

const Lobby = (props: { id: string }) => {
  const history = useHistory();

  const [lobby, setLobby] = useState<any>(undefined);

  // join lobby
  useEffect(() => {
    socket.emit("join-lobby", props.id);
  }, []);

  // handle socket events
  useEffect(() => {
    const onJoinedLobby = (data: any) => setLobby(data.lobby);
    const onRuntimeError = () => history.push("/");
    const onGameCreated = (data: any) => history.push(`/games/${data.game.id}`);
    const onOpponentDisconnected = (data: any) => {
      const playerIds = lobby.playerIds.filter((pid: any) => pid !== data.playerId);
      setLobby({ ...lobby, playerIds });
    };
    socket.on("joined-lobby", onJoinedLobby);
    socket.on("runtime-error", onRuntimeError);
    socket.on("opponent-disconnected", onOpponentDisconnected);
    socket.on("created-game", onGameCreated);
    return () => {
      socket.off("joined-lobby", onJoinedLobby);
      socket.off("runtime-error", onRuntimeError);
      socket.off("opponent-disconnected", onOpponentDisconnected);
      socket.off("created-game", onGameCreated);
    };
  });

  // dont show anything if lobby hasn't been joined yet
  if (!lobby) {
    return null;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <Typography variant="h3" gutterBottom>
        Game Lobby
      </Typography>
      <Typography variant="h6" gutterBottom>
        Players
      </Typography>
      <List style={{ marginBottom: "1rem" }}>
        {lobby.playerIds.map((playerId: any) => (
          <ListItem>{playerId}</ListItem>
        ))}
      </List>
      <Button
        disabled={lobby.playerIds.length < 2}
        onClick={() => socket.emit("create-game", lobby.id)}
        variant="contained"
      >
        Start
      </Button>
    </div>
  );
};

export default Lobby;
