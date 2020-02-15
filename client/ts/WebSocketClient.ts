import { WebSocketMessage, Card } from 'uno-shared';
import { Message } from './Message';
import $ from 'jquery';
import { Game } from './Game';
import { HandCards } from './cards/HandCards';

export class WebSocketClient {
  private static _websocket: WebSocket;
  private _allPlayers: string[] = [];
  private _handCards: HandCards = new HandCards();
  private _otherHandCards: { player: string; handCards: HandCards }[] = [];
  private _value: string;
  connect(): void {
    WebSocketClient._websocket = new WebSocket('ws://localhost:1337');
    WebSocketClient._websocket.onmessage = this.onMessage.bind(this);
  }

  static sendMessage(message: WebSocketMessage): void {
    WebSocketClient._websocket.send(JSON.stringify(message));
  }

  private onMessage(message: MessageEvent): void {
    const event: string = JSON.parse(message.data).event;
    this._value = JSON.parse(message.data).message;
    switch (event) {
      case 'password':
        switch (this._value) {
          case 'correct':
            $('div.item.form').html(
              `<input type="button" id="start-game" ${
                this._allPlayers.length > 0
                  ? 'value="Waiting for host" disabled'
                  : 'class="btn" value="Start Game"'
              }/>`
            );
            $('input#start-game.btn').on(
              'click',
              WebSocketClient.onStartGameClick
            );
            break;
          case 'incorrect':
            new Message('Incorrect password', 'error');
            break;
          case 'name-duplicate':
            new Message('This username has already been taken', 'error');
            break;
        }
        break;
      case 'player-joined':
      case 'player-left':
        this._allPlayers = [];
        this._allPlayers = JSON.parse(this._value);
        this.displayAllUsernames();
        break;
      case 'game-start':
        if (this._value === 'unauthorized') {
          new Message('You have hacked! That is not nice!', 'error');
          return;
        }
        new Game();
        break;
      case 'receive-card':
        const valueType = JSON.parse(this._value).type;
        const valueValue = JSON.parse(this._value).value;
        if (valueType === 'user') {
          if (!this._otherHandCards.find(this.getHandCardsByUser.bind(this)))
            this._otherHandCards.push({
              player: valueValue,
              handCards: new HandCards()
            });
            for (let i = 0; i < this._otherHandCards.length; i++) {
              const handCards = this._otherHandCards[i];
              if(handCards.player === valueValue) {
                handCards.handCards.addCard(i + 2);
              }
            }
          return;
        }

        const card: Card = valueValue;
        this._handCards.addCard(1, card);
        break;
    }
  }

  private getHandCardsByUser(handCard: {
    player: string;
    handCards: HandCards;
  }) {
    return handCard.player === JSON.parse(this._value).value;
  }
  private displayAllUsernames(): void {
    let usernameString: string = '<div class="title">Users in room:</div>';
    for (const username of this._allPlayers)
      usernameString += `<div class="username">${username}</div>`;
    $('div.item.usernames').html(usernameString);
  }

  private static onStartGameClick() {
    WebSocketClient.sendMessage({ event: 'game-start-request', message: null });
  }
}
