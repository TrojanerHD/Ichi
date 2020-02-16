import $ from 'jquery';
import Resources from './ResourceHelper';
import { CardColor } from 'uno-shared';

export enum CardStackType {
  DrawPile = 'drawPile',
  DiscardPile = 'storagePile',
  PlayerHand = 'playerHand'
}

export class Game {
  constructor() {
    $('div#start').addClass('hide');
    $('body').append(
      `<div class="center-cards"><div class="restock-pile"><img src="${
        Resources[CardColor.Back]
      }" alt="Back"/></div>`
    );
  }
}
