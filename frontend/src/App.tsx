import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8080");

const App = () => {
  const [lobbyId, setLobbyId] = useState<any>("");
  useEffect(() => {
    socket.on("created-lobby", (data: any) => {
      console.log(data);
      setLobbyId(data.lobby.id);
    });
    socket.on("joined-lobby", (data: any) => {
      console.log(data);
    });
    socket.on("created-game", (data: any) => {
      console.log(data);
    });
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 500 }}>
      <div style={{ display: "flex" }}>
        <span style={{ marginRight: "1rem" }}>lobbyId</span>
        <input style={{ flex: 1 }} value={lobbyId} onChange={e => setLobbyId(e.target.value)} />
      </div>
      <button onClick={() => socket.emit("create-lobby", 3)}>CREATE LOBBY</button>
      <button onClick={() => socket.emit("join-lobby", lobbyId)}>JOIN LOBBY</button>
      <button onClick={() => socket.emit("create-game", lobbyId)}>CREATE GAME</button>
    </div>
  );
};

export default App;
