import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

const socket = io("http://localhost:8080");

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/:gameId" component={JoinGame} />
        <Route component={StartGame} />
      </Switch>
    </Router>
  );
};

const StartGame = () => {
  const [selectedHand, setSelectedHand] = useState<string | undefined>();

  useEffect(() => {
    const onGameStarted = (game: any) => {
      console.log(game);
      socket.emit("play-hand", selectedHand);
    };
    socket.on("game-started", onGameStarted);
    return () => {
      socket.off("game-started", onGameStarted);
    };
  }, [selectedHand]);

  const onClick = (hand: string) => {
    if (!selectedHand) {
      socket.emit("start-game");
      setSelectedHand(hand);
    }
  };

  return (
    <div>
      <button disabled={!!selectedHand} onClick={() => onClick("rock")}>
        ROCK
      </button>
      <button disabled={!!selectedHand} onClick={() => onClick("paper")}>
        PAPER
      </button>
      <button disabled={!!selectedHand} onClick={() => onClick("scissors")}>
        SCISSORS
      </button>
      {selectedHand && <div>Selected: {selectedHand}</div>}
    </div>
  );
};

const JoinGame = (props: { gameId: string }) => {
  const [selectedHand, setSelectedHand] = useState<string | undefined>();

  useEffect(() => {}, [selectedHand]);

  const onClick = (hand: string) => {
    if (!selectedHand) {
      setSelectedHand(hand);
      socket.emit("play-hand", hand);
    }
  };

  return (
    <div>
      <button disabled={!!selectedHand} onClick={() => onClick("rock")}>
        ROCK
      </button>
      <button disabled={!!selectedHand} onClick={() => onClick("paper")}>
        PAPER
      </button>
      <button disabled={!!selectedHand} onClick={() => onClick("scissors")}>
        SCISSORS
      </button>
      {selectedHand && <div>Selected: {selectedHand}</div>}
    </div>
  );
};

export default App;
