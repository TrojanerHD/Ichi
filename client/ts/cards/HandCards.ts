import { Card, CardType, CardColor } from 'uno-shared';
import $ from 'jquery';
import Resources from '../ResourceHelper';
import _ from 'lodash';

export class HandCards {
  addCard(context: number, card?: Card) {
    if (card) {
      let typeAndNumber: string;
      switch (card.cardType) {
        case CardType.Reverse:
          typeAndNumber = `<img src="${Resources.reverse}" alt="reverse"/>`;
          break;
        case CardType.Number:
          typeAndNumber = card.cardNumber.toString();
          break;
        case CardType.Skip:
          typeAndNumber = `<img src="${Resources.skip}" alt="skip"/>`;
          break;
        case CardType.Take2:
          typeAndNumber = '+2';
          break;
        case CardType.Take4:
          typeAndNumber = '+4';
          break;
        case CardType.ChooseColor:
          typeAndNumber = '';
          break;
      }
      $('body').append(
        `<div class="own-card card player-${context}"><img src="${
          Resources[card.cardColor]
        }" alt="${
          card.cardColor
        }"/><div class="symbol">${typeAndNumber}</div></div>`
      );
      return;
    }
    $('body').append(
      `<div class="card player-${context}"><img src="${
        Resources[CardColor.Back]
      }" alt="back"/></div>`
    );
  }
}
