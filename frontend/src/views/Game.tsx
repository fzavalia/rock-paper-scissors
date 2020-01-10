import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Typography, Button, Card, CardContent } from "@material-ui/core";
import { socket } from "../App";

const Game = (props: { id: string }) => {
  const history = useHistory();

  const [game, setGame] = useState<any>(undefined);
  const [playedHand, setPlayedHand] = useState<string | undefined>(undefined);

  useEffect(() => {
    socket.emit("join-game", props.id);
  }, []);

  useEffect(() => {
    const onRuntimeError = () => history.push("/");
    socket.on("updated-game", setGame);
    socket.on("runtime-error", onRuntimeError);
    return () => {
      socket.off("updated-game", setGame);
      socket.off("runtime-error", onRuntimeError);
    };
  });

  if (!game) {
    return null;
  }

  return (
    <Card style={{ display: "inline-block" }}>
      <CardContent>
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
            <div style={{ marginTop: "1rem" }}>
              <HandTypeButton game={game} type={"rock"} setPlayedHand={setPlayedHand} />
              <HandTypeButton game={game} type={"paper"} setPlayedHand={setPlayedHand} />
              <HandTypeButton game={game} type={"scissors"} setPlayedHand={setPlayedHand} />
            </div>
          </>
        ) : (
          <>
            <Typography variant="body2" gutterBottom>
              You have <b>{game.winner ? "WON" : "LOST"}</b> the game!
            </Typography>
            <Button style={{ marginTop: "1rem" }} variant="outlined" onClick={() => history.push("/")}>
              Return
            </Button>
          </>
        )}
        <div style={{ marginTop: "1rem" }}>
          {game.rounds
            .filter((r: any) => r.isOver)
            .reverse()
            .map((r: any) => (
              <div>
                <Typography variant="caption" gutterBottom>
                  -{" "}
                  {r.playerHand === r.opponentHand ? (
                    <>
                      <i>TIED</i> with <b>{r.playerHand.toUpperCase()}</b>
                    </>
                  ) : (
                    <>
                      <i>{r.winner ? "WIN" : "LOSE"}</i> with <b>{r.playerHand.toUpperCase()}</b> against{" "}
                      <b>{r.opponentHand.toUpperCase()}</b>
                    </>
                  )}
                </Typography>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

const HandTypeButton = (props: { game: any; type: string; setPlayedHand: (hand: string) => void }) => (
  <Button
    disabled={!props.game.hasToPlay}
    style={{ marginRight: "1rem" }}
    variant="outlined"
    onClick={() => {
      props.setPlayedHand(props.type.toUpperCase());
      socket.emit("play-hand", { gameId: props.game.id, hand: props.type });
    }}
  >
    {props.type.toUpperCase()}
  </Button>
);

export default Game;
