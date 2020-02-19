import { Card, CardColor, CardType } from 'uno-shared';
import { Message } from './Message';
import $ from 'jquery';
import { HandCards } from './cards/HandCards';
import Resources from './ResourceHelper';

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
  private _username: string;

  connect(): void {
    WebSocketClient._websocket = new WebSocket('ws://localhost:1337');
    WebSocketClient._websocket.onmessage = this.onMessage.bind(this);
    WebSocketClient._websocket.onerror = this.onError.bind(this);
  }

  public static sendMessage(event: string, message: string): void {
    WebSocketClient._websocket.send(JSON.stringify({ event, message }));
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
            $('div.item.rules').html(
              '<div class="title">Rules</div><input type="checkbox" id="stack-plus-cards" checked disabled>\
              <label for="stack-plus-cards" class="checkbox">Stack +2/+4</label>'
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
        $('div#start').addClass('hide');
        $('body').append(
          `<div class="center-cards"><div class="restock-pile"><img src="${
            Resources[CardColor.Back]
          }" alt="Back"/></div>`
        );
        $('div.restock-pile > img').on('click', () =>
          WebSocketClient.sendMessage('draw-card', null)
        );
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
      case 'error':
        switch (this._value) {
          case 'not-your-turn':
            new Message('It is not your turn', 'error');
            break;
          case 'card-cannot-be-played':
            new Message('This card cannot be played', 'error');
            break;
          case 'cannot-draw':
            new Message(
              'You cannot draw a card while being in color selection',
              'error'
            );
            break;
        }
        break;
      case 'card-played':
        $(
          `div.playerdeck.username-${
            JSON.parse(this._value).username
          } > playerdeck.child`
        ).remove();
        break;
      case 'discard-stack-add-card':
        let discardPile: JQuery<HTMLElement> = $('div.discard-pile');
        if (discardPile.length === 0) {
          $('div.center-cards').prepend('<div class="discard-pile"></div>');
          discardPile = $('div.discard-pile');
        }

        discardPile.html(HandCards.generateCard(JSON.parse(this._value)));
        break;
      case 'remove-cards':
        let player: string = '1';
        if (this._value !== null)
          for (let i = 0; i < this._otherHandCards.length; i++) {
            const handCards = this._otherHandCards[i];
            if (handCards.player === this._value) player = (i + 2).toString();
          }

        $(
          `div.playerdeck.player-${player} > div.playerdeck-child > div.card`
        ).remove();
        break;
      case 'black-card':
        let message: string =
          '<div class="choose-color">Choose your color<br/>';
        for (const color of Object.keys(Resources['choose-color']))
          message += `<div class="color-text ${color}">${color.toUpperCase()}</div> `;
        $('body').append(message.substr(0, message.length - 1));
        $('div.color-text').on('click', this.onColorChooseClick);
        break;
      case 'username':
        switch (this._value) {
          case 'empty':
            new Message('The username field is required', 'error');
            break;
          case 'whitespace':
            new Message(
              'You are not allowed to use a username that starts and/or ends with a whitespace',
              'error'
            );
            break;
          case 'too-short':
            new Message('This username is too short', 'error');
            break;
        }
      case 'is-playing':
        new Message('A game is ongoing', 'error');
        break;
      case 'game-over':
        location.reload();
        break;
    }
  }

  private onError(error: ErrorEvent): void {
    new Message('A websocket error has occurred', 'error');
  }

  private orderOtherHandCards() {
    for (let i: number = 0; i < this._otherHandCards.length; i++) {
      let playerDiv: JQuery<HTMLElement> = $(`body > div.player-${i + 2}`);
      if (playerDiv.length === 0) {
        $('body').append(
          `<div class="playerdeck player-${i +
            2}"><div class="playerdeck-child"></div></div>`
        );
        playerDiv = $(`body > div.player-${i + 2}`);
      }

      const radians: number =
        ((2 * Math.PI) / this._allPlayers.length) * (i + 1);
      const vh: number = Math.floor(0.5 + Math.cos(radians) * 50 + 50);
      playerDiv.css(
        'transform',
        `rotate(${360 -
          (360 / this._allPlayers.length) * (i + 1)}deg) translateY(${-Math.abs(
          vh
        )}%)`
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
    WebSocketClient.sendMessage('game-start-request', null);
  }

  private static encodeHTML(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private onColorChooseClick(): void {
    const color: string = Object.keys(
      Resources['choose-color']
    ).find((color: string) => $(this).hasClass(color));
    if (color) {
      WebSocketClient.sendMessage(
        'choose-color',
        Object.entries(CardColor).find((e: [string, CardColor]) => e[1].toString() === color)[0]
      );
      $('body  > div.choose-color').remove();
    }
  }

  set username(username: string) {
    this._username = username;
  }
}
