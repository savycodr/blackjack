import React from 'react';
import {Component} from 'react';
import axios from "axios";
import GameDeck from "./components/GameDeck.jsx";


import './App.css';

const API = {
  shuffle: function(){
    return axios.get("https://deckofcardsapi.com/api/deck/new/shuffle/");
  },
  
  deal: function(deck_id, num){
    return axios.get("https://deckofcardsapi.com/api/deck/"+deck_id+"/draw/?count="+num);
  } 
}

const cardMap = {
    "KING": 10,
    "QUEEN": 10,
    "JACK": 10,
    "ACE": 1
  }

class App extends Component {

constructor(props){
  super(props);
  this.state= {
    playerCards: [],
    dealerCards: [],
    deckId: 0,
    message: "Welcome"
  }
  this.handleHitClick = this.handleHitClick.bind(this);
  this.handleStandClick = this.handleStandClick.bind(this);
}


  componentDidMount(){
    // shuffle the deck
    API.shuffle().then(res=>{
      this.setState({deckId:res.data.deck_id});
      console.log("cards are shuffled " + this.state.deckId);

      // deal 4 cards
      API.deal(this.state.deckId, 4).then(res=>{
        console.log("cards are dealt");
  
        let playerCards = []
        playerCards.push(
          {image: res.data.cards[0].image,
          value: res.data.cards[0].value});
        playerCards.push(
          { image: res.data.cards[1].image,
            value: res.data.cards[1].value});
        this.setState({playerCards: playerCards});
    
        let dealerCards = []
        dealerCards.push(
          {image: res.data.cards[2].image,
          value: res.data.cards[2].value});
          dealerCards.push(
          { image: res.data.cards[3].image,
            value: res.data.cards[3].value});
        this.setState({dealerCards: dealerCards});
  
        console.log("playerCards ", playerCards );
        console.log("dealerCards ", dealerCards );

     })
    }).catch(error =>console.log(error));
  }

  // Handle the hit button
  handleHitClick(e){
    e.preventDefault();
    API.deal(this.state.deckId, 1).then(res=>{
      console.log("a new card is dealt");
  
      let cards = this.state.playerCards;
      cards.push(
        {image: res.data.cards[0].image,
        value: res.data.cards[0].value});

      this.setState({playerCards: cards});

      let total = this.getTotalValue(cards);
      if (total >21){
        console.log("You lose");
        this.setState({message: "You Lose!"})
      }
    
     });

  }

  handleStandClick(e){
    e.preventDefault();

    let dealerTotal = this.getTotalValue(this.state.dealerCards);
    let playerTotal = this.getTotalValue(this.state.playerCards);

    dealerTotal = this.hitDealer(dealerTotal);

    if ((dealerTotal > 21)||(dealerTotal<playerTotal)){
      this.setState({message: "You Win"});
    } else if (dealerTotal === playerTotal)  {
      this.setState({message: "You Tie"});
    } else {
      this.setState({message: "You Lose"});
    }
  }

  getTotalValue(cards){
    let total = 0;
    cards.forEach(x=>{
      total += cardMap[x.value] || +x.value;
    })
    return total;
  }

  hitDealer(total){
    if (total<17)
    {
      API.deal(this.state.deckId, 1).then(res=>{
        console.log("a new card is dealt to the dealer");
    
        let cards = this.state.dealerCards;
        cards.push(
          {image: res.data.cards[0].image,
          value: res.data.cards[0].value});
  
        this.setState({dealerCards: cards});
  
        total = this.getTotalValue(cards);
        this.hitDealer(total);
      })
    } else {
      return total;
    }
  }

  render(){
    return(
    <div className="App">
        <div>
          <h1>{this.state.message}</h1>
          <h2>Dealer's Hand</h2>
          <GameDeck cards={this.state.dealerCards}></GameDeck>
          <h2>Player's Hand</h2>
          <GameDeck cards={this.state.playerCards}></GameDeck>
        </div>
        <div>
          <button onClick={this.handleHitClick}>Hit</button>
          <button onClick={this.handleStandClick}>Stand</button>
        </div>
    </div>
  )}
}

export default App;
