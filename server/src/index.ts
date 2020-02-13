import {WebSocketServer} from './WebSocketServer';
import {DrawPile} from './DrawPile';

new WebSocketServer().startServer();
new DrawPile();