export interface WebSocketMessage {
  event: string;
  message: string;
}

export enum CardColor {
  Red = 'red',
  Blue = 'blue',
  Green = 'green',
  Yellow = 'yellow',
  Black = 'black',
  Back = 'back'
}

export enum CardType {
  Number = 'number',
  Skip = 'skip',
  Reverse = 'reverse',
  Take2 = 'take2',
  Take4 = 'take4',
  ChooseColor = 'chooseColor'
}

export interface Card {
  cardColor: CardColor;
  cardNumber?: number;
  cardType: CardType;
}
