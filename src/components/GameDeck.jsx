import React from 'react';
import "./style.css";

// pass in an array of cards
function GameDeck(props){
    return (

    <div >
      {
        props.cards.map(card => (
          <div className="card">
          <img src={card.image} alt="card" />
          </div>
          ))
      }
    </div>


  );
}

export default GameDeck;
