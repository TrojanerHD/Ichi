import Back from 'Resources/cards/back.jpg';
import Blue from 'Resources/cards/blue.jpg';
import Red from 'Resources/cards/red.jpg';
import Black from 'Resources/cards/black.jpg';
import Yellow from 'Resources/cards/yellow.jpg';
import Green from 'Resources/cards/green.jpg';
import ChooseColor from 'Resources/cards/choose-color.jpg';
import Reverse from 'Resources/symbols/reverse.png';
import Skip from 'Resources/symbols/skip.png';
import { CardColor, CardType } from 'uno-shared';

export default {
  [CardColor.Back]: Back,
  [CardColor.Blue]: Blue,
  [CardColor.Red]: Red,
  [CardColor.Black]: ChooseColor,
  [CardColor.Green]: Green,
  [CardColor.Yellow]: Yellow,
  [CardType.Reverse]: Reverse,
  [CardType.Skip]: Skip
};
