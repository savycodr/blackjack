import React from 'react';
import { Component } from 'react';
import axios from "axios";
import GameDeck from "./components/GameDeck.jsx";

import './App.css';

const API = {
  shuffle: function () {
    return axios.get("https://deckofcardsapi.com/api/deck/new/shuffle/");
  },

  deal: function (deck_id, num) {
    return axios.get("https://deckofcardsapi.com/api/deck/" + deck_id + "/draw/?count=" + num);
  }
}

const cardMap = {
  "KING": 10,
  "QUEEN": 10,
  "JACK": 10,
  "ACE": 1
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      playerCards: [],
      dealerCards: [],
      deckId: 0,
      message: "Welcome",
      disableBtn: false
    }
    this.handleHitClick = this.handleHitClick.bind(this);
    this.handleStandClick = this.handleStandClick.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
  }

  componentDidMount() {
    this.init();
  }

  init() {
    // shuffle the deck
    API.shuffle().then(res => {
      this.setState({ deckId: res.data.deck_id });
      console.log("cards are shuffled " + this.state.deckId);

      // deal 4 cards
      API.deal(this.state.deckId, 4).then(res => {
        console.log("cards are dealt");

        let playerCards = []
        playerCards.push(
          {
            image: res.data.cards[0].image,
            value: res.data.cards[0].value
          });
        playerCards.push(
          {
            image: res.data.cards[1].image,
            value: res.data.cards[1].value
          });
        this.setState({ playerCards: playerCards });

        let dealerCards = []
        dealerCards.push(
          {
            image: res.data.cards[2].image,
            value: res.data.cards[2].value
          });
        dealerCards.push(
          {
            image: res.data.cards[3].image,
            value: res.data.cards[3].value
          });
        this.setState({ dealerCards: dealerCards });

        console.log("playerCards ", playerCards);
        console.log("dealerCards ", dealerCards);

      })
    }).catch(error => console.log(error));

  }

  // Handle the hit button
  handleHitClick(e) {
    e.preventDefault();
    API.deal(this.state.deckId, 1).then(res => {
      console.log("a new card is dealt");

      let cards = this.state.playerCards;
      cards.push(
        {
          image: res.data.cards[0].image,
          value: res.data.cards[0].value
        });

      this.setState({ playerCards: cards });

      let total = this.getTotalValue(cards);
      if (total > 21) {
        console.log("1. You lose " + total);
        this.setState({ message: "You Lose!" });
        this.setState({ disableBtn: true });
      }
    });

  }

  handleStandClick(e) {
    e.preventDefault();
    // this.hitDealer(this.determineWinner());
    this.hitDealer();
  }

  determineWinner() {
    let dealerTotal = this.getTotalValue(this.state.dealerCards);
    let playerTotal = this.getTotalValue(this.state.playerCards);

    console.log("dealerTotal ", dealerTotal);
    console.log("playerTotal ", playerTotal);

    if ((dealerTotal > 21) || (dealerTotal < playerTotal)) {
      this.setState({ message: "You Win" });
    } else if (dealerTotal === playerTotal) {
      this.setState({ message: "You Tie" });
    } else if (dealerTotal > playerTotal) {
      this.setState({ message: "You Lose" });
    }
    this.setState({ disableBtn: true });
  }

  getTotalValue(cards) {
    let total = 0;
    cards.forEach(x => {
      total += cardMap[x.value] || +x.value;
    })
    return total;
  }

  hitDealer() {
    let total = this.getTotalValue(this.state.dealerCards);
    console.log("the hitdealer total is at " + total);
    if (total < 17) {
      API.deal(this.state.deckId, 1).then(res => {
        console.log("a new card is dealt to the dealer");

        let cards = this.state.dealerCards;
        cards.push(
          {
            image: res.data.cards[0].image,
            value: res.data.cards[0].value
          });

        this.setState({ dealerCards: cards });

        total = this.getTotalValue(cards);
        if (total > 17) {
          this.determineWinner();
        } else {
          this.hitDealer();
        }
      })
    } else {
      this.determineWinner();
    }
  }


  // hitDealer(cb){
  //   let total = this.getTotalValue(this.state.dealerCards);
  //   console.log("the hitdealer total is at " + total);
  //   if (total<17)
  //   {
  //     API.deal(this.state.deckId, 1).then(res=>{
  //       console.log("a new card is dealt to the dealer");

  //       let cards = this.state.dealerCards;
  //       cards.push(
  //         {image: res.data.cards[0].image,
  //         value: res.data.cards[0].value});

  //       this.setState({dealerCards: cards});

  //       total = this.getTotalValue(cards);
  //       this.hitDealer();
  //     })
  //   }
  //   else {
  //     console.log("I am calling the callback now");
  //     if (cb) cb();
  //   }

  // }

  handleResetClick(e) {
    e.preventDefault();
    this.setState({ disableBtn: false });
    this.setState({ message: "Welcome Back" });

    this.init();
  }

  render() {
    return (
      <div className="App">
        <div>
          <h1>{this.state.message}</h1>
          <h2>Dealer's Hand</h2>
          <GameDeck cards={this.state.dealerCards}></GameDeck>
          <h2>Player's Hand</h2>
          <GameDeck cards={this.state.playerCards}></GameDeck>
        </div>
        <div>
          <button disabled={this.state.disableBtn} onClick={this.handleHitClick} >Hit</button>
          <button disabled={this.state.disableBtn} onClick={this.handleStandClick}  >Stand</button>
          <button disabled={!this.state.disableBtn} onClick={this.handleResetClick} >Play Again</button>
        </div>
      </div>
    )
  }
}

export default App;
