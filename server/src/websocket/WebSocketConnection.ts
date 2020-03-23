import * as WebSocket from 'ws';
import { Card, CardType, CardColor, WebSocketMessage } from 'uno-shared';
import * as _ from 'lodash';
import { DrawPile } from '../DrawPile';
import { LoginMessageHandler } from './message/LoginMessageHandler';
import { GameStartRequestHandler } from './message/GameStartRequestHandler';
import { CardClickedHandler } from './message/CardClickedHandler';

export class WebSocketConnection {
  static _playingDirectionReversed: boolean = false;
  static _isPlaying: boolean = false;
  static _allWebSockets: WebSocketConnection[] = [];
  static _playersInRoom: WebSocketConnection[] = [];
  static _playerTurn: WebSocketConnection;
  static _drawPile: DrawPile;
  static _discardPileCard: Card;

  private _ws: WebSocket;

  _blackCard: boolean = false;
  _username: string;
  _cards: Card[];

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
    const value: any = json.message;

    switch (json.event) {
      case 'login':
        new LoginMessageHandler(this, value);
        break;
      case 'game-start-request':
        new GameStartRequestHandler(this, value);
        break;
      case 'card-clicked':
        new CardClickedHandler(this, value);
        break;
      case 'draw-card':
        if (!this.checkTurn(true)) return;
        this.drawCard();
        this.nextTurn();
        break;
      case 'choose-color':
        WebSocketConnection._discardPileCard.cardColor = CardColor[value];
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

  private static sendToEveryone(event: string, message: string): void {
    for (const webSocket of WebSocketConnection._allWebSockets)
      webSocket.sendMessage(event, message);
  }

  static sendToEveryoneInArray(
    array: WebSocketConnection[],
    event: string,
    message: string
  ) {
    for (const webSocket of array) {
      webSocket.sendMessage(event, message);
    }
  }

  sendMessage(event: string, message: string): void {
    this._ws.send(JSON.stringify({ event, message }));
  }

  /**
   * Sends to all websockets that a player joined the room and stores the player into _playersInRoom
   */
  static playerJoined(): void {
    const allWebSocketNames: string[] = [];
    for (const webSocket of WebSocketConnection._playersInRoom)
      allWebSocketNames.push(webSocket._username);
    WebSocketConnection.sendToEveryone(
      'player-joined',
      JSON.stringify(allWebSocketNames)
    );
  }

  reloadCards(): void {
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

  drawCard() {
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

  nextTurn(playedCard?: Card): void {
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

  checkTurn(draw: boolean = false): boolean {
    const playerTurn: boolean = this === WebSocketConnection._playerTurn;
    if (this._blackCard)
      this.sendMessage('error', draw ? 'cannot-draw' : 'card-cannot-be-played');
    if (!playerTurn) this.sendMessage('error', 'not-your-turn');
    return playerTurn && !this._blackCard;
  }
}
