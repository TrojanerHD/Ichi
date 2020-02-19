import * as WebSocket from 'ws';
import * as fs from 'fs';
import { Card, CardType, CardColor, WebSocketMessage } from 'uno-shared';
import * as _ from 'lodash';
import { DrawPile } from '../DrawPile';

export class WebSocketConnection {
  private static _discardPileCard: Card;
  private static _playingDirectionReversed: boolean = false;
  private static _allWebSockets: WebSocketConnection[] = [];
  private static _playersInRoom: WebSocketConnection[] = [];
  private static _playerTurn: WebSocketConnection;
  private static _drawPile: DrawPile;
  private static _isPlaying: boolean = false;

  private _ws: WebSocket;
  private _value: string;
  private _username: string;
  private _cards: Card[];
  private _blackCard: boolean = false;

  constructor() {
    this._cards = [];
  }

  public connect(ws: WebSocket): void {
    this._ws = ws;
    if (WebSocketConnection._isPlaying) {
      this.sendMessage('is-playing', null);
      return;
    }
    WebSocketConnection._allWebSockets.push(this);
    WebSocketConnection.playerJoined();
    this._ws.on('close', this.onClose.bind(this));
    this._ws.on('message', this.onMessage.bind(this));
  }

  private onMessage(message: string): void {
    const json: WebSocketMessage = JSON.parse(message);
    this._value = json.message;

    switch (json.event) {
      case 'login':
        const login: { username: string; password: string } = JSON.parse(
          this._value
        );
        if (login.username === '') {
          this.sendMessage('username', 'empty');
          return;
        }

        if (!login.username.match(/^([^\s]+.*[^\s]+)$/)) {
          this.sendMessage('username', 'whitespace');
          return;
        }

        if (login.username.length < 3) {
          this.sendMessage('username', 'too-short');
          return;
        }

        if (
          WebSocketConnection._allWebSockets.find(
            (webSocket: WebSocketConnection) =>
              webSocket._username === login.username
          )
        ) {
          this.sendMessage('username', 'name-duplicate');
          return;
        }
        fs.readFile('./room_password.txt', this.onFileRead.bind(this));
        break;
      case 'game-start-request':
        if (WebSocketConnection._playersInRoom[0] === this) {
          WebSocketConnection._drawPile = new DrawPile();
          for (const webSocket of WebSocketConnection._playersInRoom) {
            webSocket.sendMessage('game-start', null);
            WebSocketConnection._isPlaying = true;
            for (let i = 0; i < 7; i++) webSocket.drawCard();
          }
          WebSocketConnection._discardPileCard = WebSocketConnection._drawPile.drawFirstCard();
          WebSocketConnection.sendToEveryoneInArray(
            WebSocketConnection._playersInRoom,
            'discard-stack-add-card',
            JSON.stringify(WebSocketConnection._discardPileCard)
          );
        } else this.sendMessage('game-start', 'unauthorized');
        break;
      case 'card-clicked':
        if (!this.checkTurn()) return;

        const playedCard: Card = this._cards[+this._value];

        const blackCard: boolean =
          playedCard.cardType === CardType.ChooseColor ||
          playedCard.cardType === CardType.Take4;

        const bothNumbers: boolean =
          WebSocketConnection._discardPileCard.cardType === CardType.Number &&
          playedCard.cardType === CardType.Number;

        const notSameCardType: boolean =
          WebSocketConnection._discardPileCard.cardType !== playedCard.cardType;

        const notSameColor: boolean =
          WebSocketConnection._discardPileCard.cardColor !==
          playedCard.cardColor;

        const sameNumbers: boolean =
          WebSocketConnection._discardPileCard.cardNumber ===
          playedCard.cardNumber;

        const chooseColorCard: boolean =
          WebSocketConnection._discardPileCard.cardType === CardType.Take4 ||
          WebSocketConnection._discardPileCard.cardType ===
            CardType.ChooseColor;
        if (
          !blackCard &&
          (bothNumbers || notSameCardType) &&
          notSameColor &&
          !(sameNumbers || chooseColorCard)
        ) {
          this.sendMessage('error', 'card-cannot-be-played');
          return;
        }
        this._cards = this._cards.filter((card: Card) => card !== playedCard);
        WebSocketConnection._discardPileCard = playedCard;
        WebSocketConnection.sendToEveryoneInArray(
          WebSocketConnection._playersInRoom,
          'discard-stack-add-card',
          JSON.stringify(playedCard)
        );
        this.sendMessage('remove-cards', null);
        WebSocketConnection.sendToEveryoneInArray(
          WebSocketConnection._playersInRoom.filter(
            (webSocket: WebSocketConnection) => webSocket !== this
          ),
          'remove-cards',
          this._username
        );
        this.receiveCards();
        if (playedCard.cardType === CardType.Reverse)
          WebSocketConnection._playingDirectionReversed = !WebSocketConnection._playingDirectionReversed;
        if (
          playedCard.cardType === CardType.ChooseColor ||
          playedCard.cardType === CardType.Take4
        ) {
          this._blackCard = true;
          this.sendMessage('black-card', null);
        }
        this.nextTurn(playedCard);
        if (
          WebSocketConnection._playersInRoom.find(
            (webSocket: WebSocketConnection) => webSocket._cards.length === 0
          )
        ) {
          for (const webSocket of WebSocketConnection._playersInRoom) {
            webSocket.sendMessage('game-over', null);
            WebSocketConnection._isPlaying = false;
          }
        }
        break;
      case 'draw-card':
        if (!this.checkTurn(true)) return;
        this.drawCard();
        this.nextTurn();
        break;
      case 'choose-color':
        WebSocketConnection._discardPileCard.cardColor = CardColor[this._value];
        this._blackCard = false;
        break;
    }
  }

  private onClose(): void {
    if (
      this === WebSocketConnection._playersInRoom[0] &&
      WebSocketConnection._playersInRoom.length > 1
    ) {
      WebSocketConnection._playerTurn = WebSocketConnection._playersInRoom[1];
      WebSocketConnection._playersInRoom[1].sendMessage('host', null);
    }
    WebSocketConnection._allWebSockets = this.removePlayerFromArray(
      WebSocketConnection._allWebSockets
    );
    WebSocketConnection._playersInRoom = this.removePlayerFromArray(
      WebSocketConnection._playersInRoom
    );
    const playersInRoom: string[] = [];
    for (const player of WebSocketConnection._playersInRoom) {
      playersInRoom.push(player._username);
    }
    WebSocketConnection.sendToEveryone(
      'player-left',
      JSON.stringify(playersInRoom)
    );
    if (WebSocketConnection._playersInRoom.length === 0)
      WebSocketConnection._isPlaying = false;
  }

  private removePlayerFromArray(
    webSocketArray: WebSocketConnection[]
  ): WebSocketConnection[] {
    return webSocketArray.filter(
      (webSocket: WebSocketConnection) => webSocket !== this
    );
  }

  private onFileRead(err: NodeJS.ErrnoException, data: Buffer): void {
    if (err) {
      console.error(err);
      return;
    }
    const value: { username: string; password: string } = JSON.parse(
      this._value
    );

    if (data.toString() === value.password || true) {
      this._username = value.username;
      this.sendMessage('password', 'correct');
      WebSocketConnection._playersInRoom.push(this);
      WebSocketConnection._playerTurn = WebSocketConnection._playersInRoom[0];
      WebSocketConnection._playersInRoom[0].sendMessage('host', null);
      WebSocketConnection.playerJoined();
    } else this.sendMessage('password', 'incorrect');
  }

  private static sendToEveryone(event: string, message: string): void {
    for (const webSocket of WebSocketConnection._allWebSockets)
      webSocket.sendMessage(event, message);
  }

  private static sendToEveryoneInArray(
    array: WebSocketConnection[],
    event: string,
    message: string
  ) {
    for (const webSocket of array) {
      webSocket.sendMessage(event, message);
    }
  }

  private sendMessage(event: string, message: string): void {
    this._ws.send(JSON.stringify({ event, message }));
  }

  private static playerJoined(): void {
    const allWebSocketNames: string[] = [];
    for (const webSocket of WebSocketConnection._playersInRoom)
      allWebSocketNames.push(webSocket._username);
    WebSocketConnection.sendToEveryone(
      'player-joined',
      JSON.stringify(allWebSocketNames)
    );
  }

  private receiveCards(): void {
    for (const card of this._cards) {
      for (const webSocket of WebSocketConnection._playersInRoom) {
        if (webSocket === this)
          webSocket.sendMessage(
            'receive-card',
            JSON.stringify({ type: 'card', value: card })
          );
        else
          webSocket.sendMessage(
            'receive-card',
            JSON.stringify({ type: 'user', value: this._username })
          );
      }
    }
  }

  private drawCard() {
    const firstCard: Card = WebSocketConnection._drawPile.drawFirstCard();
    this._cards.push(firstCard);
    this.sendMessage(
      'receive-card',
      JSON.stringify({ type: 'card', value: firstCard })
    );
    for (const player of WebSocketConnection._playersInRoom.filter(
      (player: WebSocketConnection) => player !== this
    ))
      player.sendMessage(
        'receive-card',
        JSON.stringify({ type: 'user', value: this._username })
      );
  }

  private nextTurn(playedCard?: Card): void {
    for (
      let i: number = 0;
      i < WebSocketConnection._playersInRoom.length;
      i++
    ) {
      const webSocket: WebSocketConnection =
        WebSocketConnection._playersInRoom[i];
      if (webSocket === WebSocketConnection._playerTurn) {
        if (!WebSocketConnection._playingDirectionReversed)
          WebSocketConnection._playerTurn =
            WebSocketConnection._playersInRoom.length - 1 >= i + 1
              ? WebSocketConnection._playersInRoom[i + 1]
              : WebSocketConnection._playersInRoom[0];
        else
          WebSocketConnection._playerTurn =
            i - 1 >= 0
              ? WebSocketConnection._playersInRoom[i - 1]
              : WebSocketConnection._playersInRoom[
                  WebSocketConnection._playersInRoom.length - 1
                ];
        break;
      }
    }
    if (playedCard && playedCard.cardType === CardType.Skip) this.nextTurn();
  }

  private checkTurn(draw: boolean = false): boolean {
    const playerTurn: boolean = this === WebSocketConnection._playerTurn;
    if (this._blackCard)
      this.sendMessage('error', draw ? 'cannot-draw' : 'card-cannot-be-played');
    if (!playerTurn) this.sendMessage('error', 'not-your-turn');
    return playerTurn && !this._blackCard;
  }
}
