import React, { useEffect, useState, Component } from "react";
import { useHistory } from "react-router-dom";
import { Typography, Button, MenuList, MenuItem, Menu } from "@material-ui/core";
import { socket } from "../App";
import CopyToClipboard from "react-copy-to-clipboard";
import { WithSnackbarProps, withSnackbar } from "notistack";
import CopyUrlMenuItem from "../components/CopyUrlMenuItem";

const Lobby = (props: { id: string }) => {
  const history = useHistory();

  const [lobby, setLobby] = useState<any>(undefined);
  const [anchorEl, setAnchorEl] = useState<any>(undefined);

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

  const openMenu = (e: any) => setAnchorEl(e.currentTarget);

  const closeMenu = () => setAnchorEl(undefined);

  // dont show anything if lobby hasn't been joined yet
  if (!lobby) {
    return null;
  }

  console.log(lobby);

  return (
    <>
      <Typography style={{ marginBottom: "1rem" }} variant="body1">
        Goal: <b>{lobby.goal}</b> win/s
      </Typography>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={closeMenu}>
        <CopyUrlMenuItem onClick={closeMenu} />
        <MenuItem onClick={closeMenu}>
          <a
            style={{ textDecoration: "none", color: "inherit" }}
            href={`whatsapp://send?text=${window.location.href}`}
            data-action="share/whatsapp/share"
          >
            Whatsapp
          </a>
        </MenuItem>
      </Menu>
      <Typography style={{ marginBottom: "1rem" }} align="justify" variant="body1" gutterBottom>
        {lobby.opponentId ? (
          <>Your opponent has joined! Press <b>PLAY</b> to start de game!</>
        ) : (
          <i>
            Waiting for an opponent to join... Make sure to <b>invite</b> someone or you will be waiting for a long
            time...
          </i>
        )}
      </Typography>
      {lobby.opponentId ? (
        <Button
          style={{ width: "100%" }}
          disabled={!lobby.opponentId}
          onClick={() => socket.emit("create-game", lobby.id)}
          variant="outlined"
        >
          Play
        </Button>
      ) : (
        <Button style={{ width: "100%" }} onClick={openMenu} variant="outlined">
          Invite
        </Button>
      )}
    </>
  );
};

export default Lobby;
