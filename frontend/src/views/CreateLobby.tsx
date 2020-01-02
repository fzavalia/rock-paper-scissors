import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button, TextField } from "@material-ui/core";
import { socket } from "../App";

const CreateLobby = () => {
  const history = useHistory();

  const [bestOf, setBestOf] = useState(1);

  useEffect(() => {
    const onLobbyCreated = (data: any) => history.push(`/lobbies/${data.lobby.id}`);
    socket.on("created-lobby", onLobbyCreated);
    return () => {
      socket.off("created-lobby", onLobbyCreated);
    };
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <TextField
          label="Best Of"
          helperText="The amount of rounds to be played"
          type="number"
          value={bestOf}
          variant="outlined"
          onChange={e => setBestOf(Math.max(0, parseInt(e.target.value)))}
        />
      </div>
      <Button onClick={() => socket.emit("create-lobby", bestOf)} variant="contained">
        Create Lobby
      </Button>
    </div>
  );
};

export default CreateLobby;
