import { WebSocketMessage } from 'uno-shared';
import { Message } from './Message';
import { Game } from './Game';
import $ from 'jquery';

export class WebSocketClient {
  private static _websocket: WebSocket;
  connect(): void {
    WebSocketClient._websocket = new WebSocket('ws://localhost:1337');
    WebSocketClient._websocket.onmessage = this.onMessage;
  }

  static sendMessage(message: WebSocketMessage): void {
    WebSocketClient._websocket.send(JSON.stringify(message));
  }

  private onMessage(message: MessageEvent): void {
    const event: string = JSON.parse(message.data).event;
    const value: string = JSON.parse(message.data).message;
    switch (event) {
      case 'password':
        switch (value) {
          case 'correct':
            new Game();
            break;
          case 'incorrect':
            new Message('Incorrect password', 'error');
            break;
        }
        break;
      case 'player-joined':
        $('div.item.usernames').append(`<div class="username">${value}</div>`);
        break;
      case 'player-left':
        const usernames: JQuery<HTMLElement> = $('div.item.usernames');
        usernames.html(usernames.html().replace(`<div class="username">${value}</div>`, ''));
        break;
    }
  }
}
