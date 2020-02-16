import Back from 'Resources/cards/back.png';
import Blue from 'Resources/cards/blue.png';
import Red from 'Resources/cards/red.png';
import Yellow from 'Resources/cards/yellow.png';
import Green from 'Resources/cards/green.png';
import ChooseColor from 'Resources/cards/choose-color.png';
import ReverseYellow from 'Resources/symbols/reverse_yellow.png';
import ReverseBlue from 'Resources/symbols/reverse_blue.png';
import ReverseRed from 'Resources/symbols/reverse_red.png';
import ReverseGreen from 'Resources/symbols/reverse_green.png';
import SkipYellow from 'Resources/symbols/skip_yellow.png';
import SkipBlue from 'Resources/symbols/skip_blue.png';
import SkipRed from 'Resources/symbols/skip_red.png';
import SkipGreen from 'Resources/symbols/skip_green.png';
import { CardColor, CardType } from 'uno-shared';

export default {
  [CardColor.Back]: Back,
  [CardColor.Blue]: Blue,
  [CardColor.Red]: Red,
  [CardColor.Black]: ChooseColor,
  [CardColor.Green]: Green,
  [CardColor.Yellow]: Yellow,
  [CardType.Reverse]: {
    [CardColor.Yellow]: ReverseYellow,
    [CardColor.Blue]: ReverseBlue,
    [CardColor.Red]: ReverseRed,
    [CardColor.Green]: ReverseGreen
  },
  [CardType.Skip]: {
    [CardColor.Yellow]: SkipYellow,
    [CardColor.Blue]: SkipBlue,
    [CardColor.Red]: SkipRed,
    [CardColor.Green]: SkipGreen    
  }
};
