import { Card, CardType, CardColor } from 'uno-shared';
import $ from 'jquery';
import Resources from '../ResourceHelper';
import _ from 'lodash';

export class HandCards {
  addCard(context: number, card?: Card) {
    let playerDiv: JQuery<HTMLElement> = $(
      `body > div.player-${context} > div.playerdeck-child`
    );
    if (playerDiv.length === 0) {
      $('body').append(
        `<div class="playerdeck player-${context}"><div class="playerdeck-child"></div></div>`
      );
      playerDiv = $(`body > div.player-${context} > div.playerdeck-child`);
    }
    if (card) {
      let typeAndNumber: { type: 'image' | 'number'; value: string } = {
        type: undefined,
        value: undefined
      };
      switch (card.cardType) {
        case CardType.Reverse:
          typeAndNumber.type = 'image';
          typeAndNumber.value = `<img src="${
            Resources.reverse[card.cardColor]
          }" alt="reverse"/>`;
          break;
        case CardType.Number:
          typeAndNumber.type = 'number';
          typeAndNumber.value = card.cardNumber.toString();
          break;
        case CardType.Skip:
          typeAndNumber.type = 'image';
          typeAndNumber.value = `<img src="${
            Resources.skip[card.cardColor]
          }" alt="skip"/>`;
          break;
        case CardType.Take2:
          typeAndNumber.type = 'number';
          typeAndNumber.value = '+2';
          break;
        case CardType.Take4:
          typeAndNumber.type = 'number';
          typeAndNumber.value = '+4';
          break;
        case CardType.ChooseColor:
          typeAndNumber.type = 'number';
          typeAndNumber.value = '';
          break;
      }

      playerDiv.append(
        `<div class="card"><div class="card-child"><img src="${Resources[card.cardColor]}" alt="${
          card.cardColor
        }"/><div class="symbol ${card.cardColor}">${
          typeAndNumber.value
        }</div></div></div>`
      );
      this.cardSize();
      return;
    }
    this.cardSize();
    playerDiv.append(
      `<div class="card"><img src="${
        Resources[CardColor.Back]
      }" alt="back"/></div>`
    );
  }

  private cardSize() {
    $('div.playerdeck-child').each((i: number, playerDeck: HTMLElement) => {
      if ($(playerDeck).parent().hasClass('player-1')) return;
      $(playerDeck).children('div.card').css('max-width', `${500 / $(playerDeck).children('div.card').length}px`);
    });
  }
}
