import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button, TextField, Typography } from "@material-ui/core";
import { socket } from "../App";

const CreateLobby = () => {
  const history = useHistory();

  const [goal, setGoal] = useState(1);
  const [nickName, setNickName] = useState(localStorage.getItem("nickname") || `Guest ${socket.id}`);

  useEffect(() => {
    const onLobbyCreated = (lobby: any) => history.push(`/lobbies/${lobby.id}`);
    socket.on("created-lobby", onLobbyCreated);
    return () => {
      socket.off("created-lobby", onLobbyCreated);
    };
  });

  useEffect(() => {
    return () => {
      localStorage.setItem("nickname", nickName);
    };
  });

  return (
    <>
      <Typography style={{ marginBottom: "1rem" }} variant="body1" align="justify">
        Welcome to <b>Rock, Paper & Scissors Online!</b>. It's the game that everybody knows about, but online... If you
        don't know how to play, just <a href="http://letmegooglethat.com/?q=how+to+play+rock+paper+scissors">Google</a>{" "}
        it.
      </Typography>
      <TextField
        style={{ marginBottom: "1rem" }}
        label="Your nickname"
        variant="outlined"
        value={nickName}
        onChange={e => setNickName(e.target.value)}
        fullWidth
      ></TextField>
      <Typography style={{ marginBottom: "1rem" }} variant="body1" align="justify">
        Select how many hands a player must win to be victorious <b>(Goal)</b> and press <b>PLAY</b> to start.
      </Typography>
      <div style={{ display: "flex", width: "100%" }}>
        <TextField
          style={{ flex: 1 }}
          type="number"
          label="Goal"
          value={goal}
          onChange={e => setGoal(Math.max(0, parseInt(e.target.value)))}
          variant="outlined"
        />
        <Button style={{ flex: 3 }} onClick={() => socket.emit("create-lobby", goal)} variant="outlined">
          PLAY
        </Button>
      </div>
    </>
  );
};

export default CreateLobby;
