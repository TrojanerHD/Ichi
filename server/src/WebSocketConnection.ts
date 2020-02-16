import * as WebSocket from 'ws';
import * as fs from 'fs';
import { Card } from 'uno-shared';
import * as _ from 'lodash';
import { DrawPile } from './DrawPile';

export class WebSocketConnection {
  private _ws: WebSocket;
  private static _allWebSockets: WebSocketConnection[] = [];
  private static _playersInRoom: WebSocketConnection[] = [];
  private _value: string;
  private _username: string;
  private _cards: Card[] = [];
  private static _playerTurn: WebSocketConnection;
  connect(ws: WebSocket): void {
    this._ws = ws;
    WebSocketConnection._allWebSockets.push(this);
    WebSocketConnection.playerJoined();
    this._ws.on('close', this.onClose.bind(this));
    this._ws.on('message', this.onMessage.bind(this));
  }

  private onMessage(message: string): void {
    const event: string = JSON.parse(message).event;
    this._value = JSON.parse(message).message;
    switch (event) {
      case 'login':
        fs.readFile('./room_password.txt', this.onFileRead.bind(this));
        break;
      case 'game-start-request':
        if (WebSocketConnection._playersInRoom[0] === this) {
          const drawPile: DrawPile = new DrawPile();
          for (const webSocket of WebSocketConnection._playersInRoom) {
            webSocket.sendMessage('game-start', null);
            for (let i = 0; i < 7; i++) {
              const firstCard: Card = drawPile.drawFirstCard();
              webSocket._cards.push(firstCard);
              webSocket.sendMessage(
                'receive-card',
                JSON.stringify({ type: 'card', value: firstCard })
              );
              for (const player of WebSocketConnection._playersInRoom.filter(
                (player: WebSocketConnection) => player !== webSocket
              ))
                player.sendMessage(
                  'receive-card',
                  JSON.stringify({ type: 'user', value: webSocket._username })
                );
            }
          }
        } else this.sendMessage('game-start', 'unauthorized');
        break;
      case 'card-clicked':
        if (this !== WebSocketConnection._playerTurn) {
          this.sendMessage('error', 'not-your-turn');
          return;
        }
        const playedCard: Card = this._cards[+this._value];
        this._cards = this._cards.filter((card: Card) => card !== playedCard);
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
        
        for (const card of this._cards) {
          for (const webSocket of WebSocketConnection._playersInRoom) {
            if (webSocket === this) {
              webSocket.sendMessage(
                'receive-card',
                JSON.stringify({ type: 'card', value: card })
              );
              } else {
              webSocket.sendMessage(
                'receive-card',
                JSON.stringify({type: 'user', value: this._username})
              );
            }
          }
        }

        let nextPlayerIsGoingToDoTheNextTurn: boolean = false;
        for (const webSocket of WebSocketConnection._playersInRoom) {
          if (nextPlayerIsGoingToDoTheNextTurn) {
            WebSocketConnection._playerTurn = webSocket;
            break;
          }
          if (webSocket === this) nextPlayerIsGoingToDoTheNextTurn = true;
        }
        if (!nextPlayerIsGoingToDoTheNextTurn) WebSocketConnection._playerTurn = WebSocketConnection._playersInRoom[0];
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

    if (
      WebSocketConnection._allWebSockets.find(
        (webSocket: WebSocketConnection) =>
          webSocket._username === value.username
      )
    ) {
      this.sendMessage('password', 'name-duplicate');
      return;
    }
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
}
