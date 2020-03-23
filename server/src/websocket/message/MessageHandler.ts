import { WebSocketConnection } from "../WebSocketConnection";

export abstract class MessageHandler {
    _connection: WebSocketConnection;
    _value: any;
    constructor(connection: WebSocketConnection, value: any) {
       this._connection = connection;
       this._value = value;
    }

    sendMessage(event: string, message: string): void {
        this._connection.sendMessage(event, message);
    }
}