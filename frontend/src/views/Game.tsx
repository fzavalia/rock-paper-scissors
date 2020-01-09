import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Typography, Button, Card, CardContent, List, ListItem } from "@material-ui/core";
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
          <Button variant="outlined" onClick={() => history.push("/")}>
            Return
          </Button>
        </>
      )}
      <Card style={{ marginTop: "1rem" }}>
        <CardContent>
          <Typography variant="caption" gutterBottom>
            Feed
          </Typography>
          <List>
            {game.rounds
              .filter((r: any) => r.isOver)
              .map((r: any) => (
                <ListItem>
                  <Typography variant="body1">
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
                </ListItem>
              ))}
          </List>
        </CardContent>
      </Card>
    </div>
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
