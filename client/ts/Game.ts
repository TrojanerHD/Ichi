import $ from 'jquery';
import { CardDeck } from './cards/CardDeck';

export class Game {
  constructor() {
    $('div#start').addClass('hide');
    new CardDeck
  }
}
