import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Typography, Button } from "@material-ui/core";
import { socket } from "../App";

const Game = (props: { id: string }) => {
  const history = useHistory();

  const [game, setGame] = useState<any>(undefined);
  const [playedHand, setPlayedHand] = useState<string | undefined>(undefined);

  useEffect(() => {
    socket.emit("join-game", props.id);
  }, []);

  useEffect(() => {
    socket.on("updated-game", setGame);
    socket.on("runtime-error", console.log);
    return () => {
      socket.off("updated-game", setGame);
      socket.off("runtime-error", console.log);
    };
  });

  if (!game) {
    return null;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <Typography variant="body1" gutterBottom>
        Goal: <b>{game.goal}</b>
      </Typography>
      <Typography variant="body1" gutterBottom>
        Your score: <b>{game.playerScore}</b> - Opponent score: <b>{game.opponentScore}</b>
      </Typography>
      {!game.isOver ? (
        <>
          {game.hasToPlay ? (
            <Typography variant="body1" gutterBottom>
              Select what you want to play by clicking on one of the buttons...
            </Typography>
          ) : (
            <Typography variant="body1" gutterBottom>
              You have chosen <b>{playedHand}</b>! Waiting for opponent to play...
            </Typography>
          )}
          <div>
            <Button
              disabled={!game.hasToPlay}
              style={{ marginRight: "1rem" }}
              variant="outlined"
              onClick={() => {
                setPlayedHand("Rock");
                socket.emit("play-hand", { gameId: game.id, hand: "rock" });
              }}
            >
              ROCK
            </Button>
            <Button
              disabled={!game.hasToPlay}
              style={{ marginRight: "1rem" }}
              variant="outlined"
              onClick={() => {
                setPlayedHand("Paper");
                socket.emit("play-hand", { gameId: game.id, hand: "paper" });
              }}
            >
              PAPER
            </Button>
            <Button
              disabled={!game.hasToPlay}
              style={{ marginRight: "1rem" }}
              variant="outlined"
              onClick={() => {
                setPlayedHand("Scissors");
                socket.emit("play-hand", { gameId: game.id, hand: "scissors" });
              }}
            >
              SCISSORS
            </Button>
          </div>
        </>
      ) : (
        <>
          {game.winner === socket.id ? (
            <Typography variant="body1" gutterBottom>
              You have <b>won</b> the game!
            </Typography>
          ) : (
            <Typography variant="body1" gutterBottom>
              You have <b>lost</b> the game...
            </Typography>
          )}

          <Button variant="outlined" onClick={() => history.push("/")}>
            Return
          </Button>
        </>
      )}
    </div>
  );
};

export default Game;
