import * as WebSocket from 'ws';
import { WebSocketConnection } from './WebSocketConnection';

export class WebSocketServer {
  startServer(): void {
    const wss: WebSocket.Server = new WebSocket.Server({ port: 1337 });
    wss.on('connection', this.onConnection);
  }

  private onConnection(ws: WebSocket): void {
    new WebSocketConnection().connect(ws);
  }
}
