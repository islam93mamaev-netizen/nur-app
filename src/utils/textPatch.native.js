// iOS/Android: в RN 0.81 Text — обычный функциональный компонент (нет .render),
// поэтому старый патч Text.render молча не работал. Зато `Text` из 'react-native'
// — это геттер `require('./Libraries/Text/Text').default`, который читается при
// каждом обращении. Подменяем default модуля обёрткой, правящей входные props.
import React from 'react';
import { adjustTextProps } from './textStyleAdjust';

const TextModule = require('react-native/Libraries/Text/Text');

if (!TextModule.__nurPatched) {
  const OrigText = TextModule.default;
  // React 19: ref приходит обычным prop и пробрасывается дальше вместе с props
  function NurText(props) {
    return React.createElement(OrigText, adjustTextProps(props));
  }
  NurText.displayName = 'Text';
  try {
    TextModule.default = NurText;
    TextModule.__nurPatched = true;
  } catch (e) {
    console.warn('Text patch failed', e);
  }
}
