import { MessageHandler } from './MessageHandler';
import { WebSocketConnection } from '../WebSocketConnection';
import { Card, CardType, CardColor } from 'uno-shared';

export class CardClickedHandler extends MessageHandler {
  constructor(connection: WebSocketConnection, value: any) {
    super(connection, value);

    const playedCard: Card = this._connection._cards[+value];

    if (!this.cardIsPlayable(playedCard)) {
      this.sendMessage('error', 'card-cannot-be-played');
      return;
    }

    delete this._connection._cards[+value];

    WebSocketConnection._discardPileCard = playedCard;
    WebSocketConnection.sendToEveryoneInArray(
      WebSocketConnection._playersInRoom,
      'discard-stack-add-card',
      JSON.stringify(playedCard)
    );
    this.sendMessage('remove-cards', null);
    WebSocketConnection.sendToEveryoneInArray(
      WebSocketConnection._playersInRoom.filter(
        (webSocket: WebSocketConnection) => webSocket !== this._connection
      ),
      'remove-cards',
      this._connection._username
    );
    this._connection.reloadCards();

    if (playedCard.cardType === CardType.Reverse)
      if (WebSocketConnection._playersInRoom.length === 2)
        this._connection.nextTurn();
    WebSocketConnection._playingDirectionReversed = !WebSocketConnection._playingDirectionReversed;
    if (
      playedCard.cardType === CardType.ChooseColor ||
      playedCard.cardType === CardType.Take4
    ) {
      this._connection._blackCard = true;
      this.sendMessage('black-card', null);
    }
    this._connection.nextTurn(playedCard);
    let drawCount: number = 0;
    switch (playedCard.cardType) {
      case CardType.Take4:
        drawCount = 4;
        break;
      case CardType.Take2:
        drawCount = 2;
        break;
    }
    for (let i = 0; i < drawCount; i++)
      WebSocketConnection._playerTurn.drawCard();
    if (drawCount !== 0) this._connection.nextTurn();
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
  }

  private cardIsPlayable(playedCard: Card): boolean {
    if (!this._connection.checkTurn()) return false;
    if (playedCard.cardColor === CardColor.Black)
      // Black card cannot be placed on black card
      return WebSocketConnection._discardPileCard.cardColor !== CardColor.Black;

    if (playedCard.cardColor === WebSocketConnection._discardPileCard.cardColor)
      return true;

    if (playedCard.cardType === WebSocketConnection._discardPileCard.cardType) {
      if (playedCard.cardType === CardType.Number) {
        return (
          playedCard.cardNumber ===
          WebSocketConnection._discardPileCard.cardNumber
        );
      }
      return true;
    }

    return false;
  }
}
