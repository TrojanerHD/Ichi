import { CardStackType } from '../Game';
import $ from 'jquery';
import Resources from '../ResourceHelper';
import { CardColor } from 'uno-shared';

export class CardStack {
  constructor(cardStackType: CardStackType, card: CardColor = CardColor.Back) {
    $('body').append(
      `<div class="${cardStackType}"><img src="${Resources[card]}" alt="Back"/></div>`
    );
  }
}
