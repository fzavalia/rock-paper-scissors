import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route, useHistory } from "react-router-dom";
import io from "socket.io-client";
import CreateLobby from "./views/CreateLobby";
import Lobby from "./views/Lobby";
import { Typography, Button } from "@material-ui/core";

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

// const App = () => <Game id={"gameId"} />;

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

      {/* {game.isOver ? (
        <>
          <div style={{ marginBottom: "1rem" }}>Game Over</div>
          <div style={{ marginBottom: "1rem" }}>
            {game.winner === socket.id ? (
              <div>You have won the game!</div>
            ) : (
              <div>You have lost the game, better luck nest time...</div>
            )}
          </div>
          <div>
            <div>Rounds</div>
            {game.rounds.map((r: any, i: any) => (
              <div key={i}></div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: "1rem" }}>
            {opponentHasToPlay() ? (
              <span>Your opponent is still choosing what to play...</span>
            ) : (
              <span>Your opponent is waiting for you to play!</span>
            )}
          </div>
          <div style={{ marginBottom: "1rem" }}>
            {alreadyPlayedHand() ? <span>You have chosen {playedHand}</span> : <span>Choose a hand to play</span>}
          </div>

          
        </>
      )} */}
    </div>
  );
};

export default App;
