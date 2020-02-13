import * as WebSocket from 'ws';
import * as fs from 'fs';
import { WebSocketMessage } from 'uno-shared';

export class WebSocketConnection {
  private _ws: WebSocket;
  private static _allWebSockets: WebSocketConnection[] = [];
  private _value: string;
  private _username: string;
  connect(ws: WebSocket): void {
    this._ws = ws;
    for (const webSocket of WebSocketConnection._allWebSockets) {
      if (!webSocket._username) continue;
      this.sendMessage({
        event: 'player-joined',
        message: webSocket._username
      });
    }
    WebSocketConnection._allWebSockets.push(this);
    this._ws.on('close', this.onClose.bind(this));
    this._ws.on('message', this.onMessage.bind(this));
  }

  private onMessage(message: string): void {
    const event: string = JSON.parse(message).event;
    this._value = JSON.parse(message).message;
    if (event === 'login')
      fs.readFile('./room_password.txt', this.onFileRead.bind(this));
  }

  private onClose() {
    const allWebSockets: WebSocketConnection[] =
      WebSocketConnection._allWebSockets;
    for (let i: number = 0; i < allWebSockets.length; i++) {
      const webSocket = allWebSockets[i];
      if (webSocket === this) {
        WebSocketConnection._allWebSockets.splice(i, 1);
        WebSocketConnection.sendToEveryone({event: 'player-left', message: this._username});
      }
    }
  }

  private onFileRead(err: NodeJS.ErrnoException, data: Buffer): void {
    if (err) {
      console.error(err);
      return;
    }
    const value: { username: string; password: string } = JSON.parse(
      this._value
    );
    if (data.toString() === value.password) {
      this._username = value.username;
      this._ws.send(JSON.stringify({ event: 'password', message: 'correct' }));
      WebSocketConnection.sendToEveryone({
        event: 'player-joined',
        message: value.username
      });
    } else
      this._ws.send(
        JSON.stringify({ event: 'password', message: 'incorrect' })
      );
  }
  private static sendToEveryone(message: WebSocketMessage): void {
    for (const webSocket of WebSocketConnection._allWebSockets)
      webSocket.sendMessage(message);
  }

  private sendMessage(message: WebSocketMessage): void {
    this._ws.send(JSON.stringify(message));
  }
}
