import { MessageHandler } from './MessageHandler';
import { WebSocketConnection } from '../WebSocketConnection';
import { DrawPile } from '../../DrawPile';

export class GameStartRequestHandler extends MessageHandler {
  constructor(connection: WebSocketConnection, value: any) {
    super(connection, value);
    if (WebSocketConnection._playersInRoom[0] === this._connection) {
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
  }
}
