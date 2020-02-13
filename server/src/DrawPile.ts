import { Card, CardColor, CardType } from 'uno-shared';

export class DrawPile {
  private _cards: Card[] = [];

  constructor() {
    const colors: CardColor[] = [
      CardColor.Red,
      CardColor.Green,
      CardColor.Blue,
      CardColor.Yellow
    ];
    const cardNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const specialCardTypes: CardType[] = [
      CardType.Skip,
      CardType.Reverse,
      CardType.Take2
    ];

    for (const cardColor of colors) {
      for (const cardNumber of cardNumbers) {
        for (let i = 0; i < 2; i++) {
          this._cards.push({
            cardColor,
            cardNumber,
            cardType: CardType.Number
          });
        }
      }
      this._cards.push({ cardColor, cardNumber: 0, cardType: CardType.Number });

      for (const cardType of specialCardTypes)
        this._cards.push({ cardColor, cardType });
    }
    for (let i = 0; i < 4; i++) {
      this._cards.push({
        cardType: CardType.ChooseColor,
        cardColor: CardColor.Black
      });
      this._cards.push({
        cardType: CardType.Take4,
        cardColor: CardColor.Black
      });
    }
    console.table(this._cards);
  }

  //TODO add impl
  getFirstCard() {}
}
