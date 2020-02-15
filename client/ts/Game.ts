import $ from 'jquery';
import { CardStack } from './cards/CardStack';
import { CardColor } from 'uno-shared';

export enum CardStackType {
  DrawPile = 'drawPile',
  DiscardPile = 'storagePile',
  PlayerHand = 'playerHand'
}

export class Game {
  constructor() {
    $('div#start').addClass('hide');
    const drawPile: CardStack = new CardStack(CardStackType.DrawPile);
    let discardPile: CardStack;
  }
}
