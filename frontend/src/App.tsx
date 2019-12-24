import React from "react";
import io from "socket.io-client";
import logo from "./logo.svg";
import "./App.css";

const App: React.FC = () => {
  const socket = io("http://localhost:8080");

  socket.on("connect", () => {
    console.log("connected");
  });

  socket.on("chat message", (data: any) => {
    console.log(data);
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
};

export default App;
