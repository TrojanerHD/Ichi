import { WebSocketMessage, Card } from 'uno-shared';
import { Message } from './Message';
import $ from 'jquery';
import { Game } from './Game';
import { HandCards } from './cards/HandCards';
interface otherHandCards {
  player: string;
  handCards: HandCards;
}

export class WebSocketClient {
  private static _websocket: WebSocket;
  private _allPlayers: string[] = [];
  private _handCards: HandCards = new HandCards();
  private _otherHandCards: otherHandCards[] = [];
  private _value: string;
  _username: string;
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
              `<input type="button" id="start-game" value="Waiting for host" disabled/>`
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
      case 'host':
        const startGameButton: JQuery<HTMLElement> = $('input#start-game');
        startGameButton.addClass('btn');
        startGameButton.val('Start Game');
        startGameButton.removeAttr('disabled');

        startGameButton.off('click');
        startGameButton.on('click', WebSocketClient.onStartGameClick);
        break;
      case 'player-joined':
      case 'player-left':
        this._allPlayers = [];
        this._allPlayers = JSON.parse(this._value);
        for (const player of this._allPlayers) {
          if (player === this._username) continue;
          if (
            !this._otherHandCards.find(
              (handCards: otherHandCards) => handCards.player === player
            )
          )
            this._otherHandCards.push({
              player,
              handCards: new HandCards()
            });
        }

        this._otherHandCards = this._otherHandCards.filter(
          (handCards: otherHandCards) =>
            this._allPlayers.includes(handCards.player)
        );
        this.displayAllUsernames();
        break;
      case 'game-start':
        if (this._value === 'unauthorized') {
          new Message('You have hacked! That is not nice!', 'error');
          return;
        }
        new Game();
        this.orderOtherHandCards();
        break;
      case 'receive-card':
        const valueType = JSON.parse(this._value).type;
        const valueValue = JSON.parse(this._value).value;
        if (valueType === 'user') {
          for (let i = 0; i < this._otherHandCards.length; i++) {
            const handCards = this._otherHandCards[i];
            if (handCards.player === valueValue)
              handCards.handCards.addCard(i + 2);
          }
          return;
        }

        const card: Card = valueValue;
        this._handCards.addCard(1, card);
        break;
    }
  }

  private orderOtherHandCards() {
    for (let i: number = 0; i < this._otherHandCards.length; i++) {
      let playerDiv: JQuery<HTMLElement> = $(`body > div.player-${i + 2}`);
      if (playerDiv.length === 0) {
        $('body').append(`<div class="playerdeck player-${i + 2}"><div class="playerdeck-child"></div></div>`);
        playerDiv = $(`body > div.player-${i + 2}`);
      }

      const radians: number =
        ((2 * Math.PI) / this._allPlayers.length) * (i + 1);
        const vh: number = Math.floor(0.5 + Math.cos(radians) * 50 + 50);
      playerDiv.css(
        'transform',
        `rotate(${360 - (360 / this._allPlayers.length) * (i + 1)}deg) translateY(${-Math.abs(vh)}%)`
      );
      playerDiv.css('top', `${vh}vh`);
      playerDiv.css('left', `${Math.floor(0.5 + Math.sin(radians) * 50)}vw`);
    }
  }

  private displayAllUsernames(): void {
    let usernameString: string = '<div class="title">Users in room:</div>';
    for (const username of this._allPlayers)
      usernameString += `<div class="username">${WebSocketClient.encodeHTML(
        username
      )}</div>`;
    $('div.item.usernames').html(usernameString);
  }

  private static onStartGameClick() {
    WebSocketClient.sendMessage({ event: 'game-start-request', message: null });
  }

  private static encodeHTML(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
