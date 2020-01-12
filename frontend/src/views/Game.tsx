import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Typography, Button, Card, CardContent } from "@material-ui/core";
import { socket } from "../App";
import rockImg from "../img/rock.png";
import paperImg from "../img/paper.png";
import scissorsImg from "../img/scissors.png";

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
    <>
      <Typography variant="body1" style={{ marginBottom: "1rem" }}>
        Goal: <b>{game.goal}</b> win/s
      </Typography>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <Score>
          You - <b>{game.playerScore}</b>
        </Score>
        <Typography variant="body1">SCORE</Typography>
        <Score>
          <b>{game.opponentScore}</b> - Them
        </Score>
      </div>
      <Typography variant="body1" style={{ marginBottom: "1rem" }}>
        {(() => {
          console.log(game);
          if (game.isOver) {
            return (
              <>
                You have <b>{game.winner ? "WON" : "LOST"}</b> the game!
              </>
            );
          }
          if (game.hasToPlay && game.opponentHasToPlay) {
            return <>Select the hand you want to play...</>;
          }
          if (game.hasToPlay && !game.opponentHasToPlay) {
            return (
              <>
                Your opponent is waiting for <b>you</b> to <b>play</b>
              </>
            );
          }
          if (!game.hasToPlay && game.opponentHasToPlay) {
            return (
              <>
                Waiting for your <b>opponent</b> to <b>play</b>
              </>
            );
          }
          return null;
        })()}
      </Typography>
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-around" }}>
        <HandTypeButton game={game} setPlayedHand={setPlayedHand} playedHand={playedHand} type={"rock"} />
        <HandTypeButton game={game} setPlayedHand={setPlayedHand} playedHand={playedHand} type={"paper"} />
        <HandTypeButton game={game} setPlayedHand={setPlayedHand} playedHand={playedHand} type={"scissors"} />
      </div>
      {game.isOver && (
        <Button style={{ marginBottom: "1rem", width: "100%" }} variant="outlined" onClick={() => history.push("/")}>
          Return
        </Button>
      )}
      {game.rounds.filter((r: any) => r.isOver).length > 0 && (
        <>
          <Typography variant="body1" style={{ marginBottom: "1rem", fontSize: "0.8rem" }}>
            Results
          </Typography>
          <div>
            {game.rounds
              .filter((r: any) => r.isOver)
              .reverse()
              .map((r: any, i: number) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    marginBottom: "0.5rem"
                  }}
                >
                  <img style={{ height: 25, width: 25 }} src={typeToImage(r.playerHand)} alt={r.playerHand} />
                  <span style={{ fontSize: "0.8rem" }}>
                    {r.playerHand === r.opponentHand ? "Tied" : r.winner ? "Won" : "Lost"}
                  </span>
                  <img style={{ height: 25, width: 25 }} src={typeToImage(r.opponentHand)} alt={r.opponentHand} />
                </div>
              ))}
          </div>
        </>
      )}

      {/* {!game.isOver ? (
        <>
          {game.hasToPlay ? (
            <Typography variant="body1" gutterBottom>
              Select the hand you want to play...
            </Typography>
          ) : game.opponentHasToPlay ? (
            <Typography variant="body1" gutterBottom>
              Waiting for your opponent to play a hand...
            </Typography>
          ) : (
            <Typography variant="body1" gutterBottom>
              You have chosen <b>{playedHand}</b>! Waiting for opponent to play...
            </Typography>
          )}
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-around" }}>
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
      </div> */}
    </>
  );
};

const Score = (props: { children: any }) => (
  <Typography
    style={{
      padding: "0.5rem",
      borderStyle: "solid",
      borderWidth: 1,
      borderRadius: 5,
      borderColor: "#c5c5c5"
    }}
    variant="body1"
  >
    {props.children}
  </Typography>
);

const typeToImage = (type: string) => (type === "rock" ? rockImg : type === "paper" ? paperImg : scissorsImg);

const HandTypeButton = (props: {
  game: any;
  type: string;
  setPlayedHand: (hand: string) => void;
  playedHand?: string;
}) => {
  const disabled = !props.game.hasToPlay;
  const selected = props.playedHand === props.type;
  return (
    <Button
      disabled={disabled}
      onClick={() => {
        props.setPlayedHand(props.type);
        socket.emit("play-hand", { gameId: props.game.id, hand: props.type });
      }}
    >
      <img
        style={{ height: 50, width: 50, opacity: disabled && !selected ? "0.5" : undefined }}
        src={typeToImage(props.type)}
        alt={props.type}
      />
    </Button>
  );
};

export default Game;
