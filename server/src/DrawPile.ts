import { Card, CardColor, CardType } from 'uno-shared';

export class DrawPile {
  private _cards: Card[];

  constructor() {
    this._cards = [];

    const colors: CardColor[] = [
      CardColor.Red,
      CardColor.Green,
      CardColor.Blue,
      CardColor.Yellow
    ];
    const cardNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
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
    this._cards = this._cards.sort(DrawPile.randomSort);
  }

  private static randomSort() {  
    return 0.5 - Math.random();
  }

  public drawFirstCard(): Card {
    return this._cards.pop();
  }
}
