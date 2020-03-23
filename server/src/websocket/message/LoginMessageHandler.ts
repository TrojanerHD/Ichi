import { MessageHandler } from './MessageHandler';
import { WebSocketConnection } from '../WebSocketConnection';
import * as fs from 'fs';

interface Credentials {
  username: string;
  password: string;
}

export class LoginMessageHandler extends MessageHandler {
  constructor(connection: WebSocketConnection, value: any) {
    super(connection, value);
    const login: Credentials = JSON.parse(value);
    if (login.username === '') {
      this.sendMessage('username', 'empty');
      return;
    }

    if (!login.username.match(/^([^\s​]+.*[^\s​]+)$/)) {
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
    const roomPasswordFile: string = './room_password.txt';
    if (!fs.existsSync(roomPasswordFile))
      fs.writeFileSync(roomPasswordFile, '', 'utf-8');
    fs.readFile(roomPasswordFile, 'utf-8', this.onFileRead.bind(this));
  }

  /**
   * Checks whether the password is correct and sends a confirmation/rejection to the client
   * @param err Error
   * @param data The correct password
   */
  private onFileRead(err: NodeJS.ErrnoException, data: Buffer): void {
    if (err) {
      console.error(err);
      return;
    }
    const value: Credentials = JSON.parse(this._value);

    if (data.toString() === value.password) {
      this._connection._username = value.username;
      this.sendMessage('password', 'correct');
      WebSocketConnection._playersInRoom.push(this._connection);
      WebSocketConnection._playerTurn = WebSocketConnection._playersInRoom[0];
      WebSocketConnection._playersInRoom[0].sendMessage('host', null);
      WebSocketConnection.playerJoined();
    } else this.sendMessage('password', 'incorrect');
  }
}
