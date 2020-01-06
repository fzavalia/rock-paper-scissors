import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route, useHistory } from "react-router-dom";
import io from "socket.io-client";
import CreateLobby from "./views/CreateLobby";
import Lobby from "./views/Lobby";
import { Typography, Button } from "@material-ui/core";

export const socket = io("http://localhost:8080");

// const App = () => (
//   <Router>
//     <Switch>
//       <Route path="/lobbies/:id" render={props => <Lobby id={props.match.params.id} />}></Route>
//       <Route path="/games/:id" render={props => <Game id={props.match.params.id} />}></Route>
//       <Route component={CreateLobby}></Route>
//     </Switch>
//   </Router>
// );

const App = () => <Game id={"gameId"} />;

const Game = (props: { id: string }) => {
  const [game, setGame] = useState<any>({
    id: props.id,
    bestOf: 3,
    player1Score: 0,
    player2Score: 1,
    isOver: true
  });
  const [playedHand, setPlayedHand] = useState<string | undefined>(undefined);

  if (!game) {
    return null;
  }

  const opponentHasToPlay = () => true;

  const alreadyPlayedHand = () => true;

  return (
    <div style={{ padding: "1rem" }}>
      <Typography variant="h3" gutterBottom>
        Game
      </Typography>

      <div style={{ marginBottom: "1rem" }}>
        Best Of: <b>{game.bestOf}</b>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        Your score: <b>{game.player1Score}</b> - Opponent score: <b>{game.player2Score}</b>
      </div>

      {game.isOver ? (
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

          <div>
            <Button disabled={alreadyPlayedHand()} style={{ marginRight: "1rem" }} variant="outlined">
              ROCK
            </Button>
            <Button disabled={alreadyPlayedHand()} style={{ marginRight: "1rem" }} variant="outlined">
              PAPER
            </Button>
            <Button disabled={alreadyPlayedHand()} style={{ marginRight: "1rem" }} variant="outlined">
              SCISSORS
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
