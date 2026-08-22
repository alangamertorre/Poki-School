import React from "react";
import "./App.css";
import { Game } from "./components/game";
import { games_database } from "./data/data-games";

function App() {
  return (
    <div id="games-div">
      {
        games_database.map((game, index) => (
          <Game
            key={index}
            name={game.name}
            img={game.img || "level-devil.png"}
            id={game.id}
            category={game.category}
          />
        ))}
    </div>
  );
}

export default App;
