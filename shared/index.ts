export interface WebSocketMessage {
  event: string;
  message: string;
}

export enum CardColor {
  Red,
  Blue,
  Green,
  Yellow,
  Black
}

export enum CardType {
  Number,
  Skip,
  Reverse,
  Take2,
  Take4,
  ChooseColor
}

export interface Card {
  cardColor: CardColor;
  cardNumber?: number;
  cardType: CardType;
}
