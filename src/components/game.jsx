//Componente para cada juego
import React from "react";

export const Game = ({ name, img, id, category }) => {
  const path1 = `../../public/${img}`;
  const path2 = !id.includes("https://") ? `src/games/${id}/index.html` : id;
  return (
    <div className="game-card" data-category={category} data-href={path2}>
      <img src={path1} alt={img} />
      <h3>{name}</h3>
    </div>
  );
};
