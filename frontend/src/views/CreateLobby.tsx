import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button, TextField, Typography } from "@material-ui/core";
import { socket } from "../App";

const CreateLobby = () => {
  const history = useHistory();

  const [goal, setGoal] = useState(1);

  useEffect(() => {
    const onLobbyCreated = (lobby: any) => history.push(`/lobbies/${lobby.id}`);
    socket.on("created-lobby", onLobbyCreated);
    return () => {
      socket.off("created-lobby", onLobbyCreated);
    };
  });

  return (
    <div style={{ padding: "1rem" }}>
      <Typography variant="body1" gutterBottom>
        Create Game
      </Typography>
      <div style={{ marginBottom: "1rem" }}>
        <TextField
          label="Goal"
          helperText="The amount of rounds a player needs to win to be victorious"
          type="number"
          value={goal}
          onChange={e => setGoal(Math.max(0, parseInt(e.target.value)))}
        />
      </div>
      <Button onClick={() => socket.emit("create-lobby", goal)} variant="outlined">
        Create
      </Button>
    </div>
  );
};

export default CreateLobby;
