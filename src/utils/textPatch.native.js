// iOS/Android: глобальная подстройка <Text> (масштаб шрифта из настроек + Noto Naskh для арабского).
//
// В RN 0.81 Text — функциональный компонент без .render. Раньше мы подменяли
// `default` модуля react-native/Libraries/Text/Text, но в ПРОДАКШЕН-сборке Expo SDK 54
// этот экспорт — неперенастраиваемый геттер (ESM live binding): присваивание падало
// с «Cannot set property default … which has only a getter», патч молча отключался,
// и настройка размера шрифта на iPhone ничего не меняла (в dev/вебе всё работало).
//
// Теперь подменяем геттер `Text` у объекта экспорта самого 'react-native'
// (`get Text(){...}` в его index.js — configurable). Экраны обращаются к Text как
// `ReactNative.Text` в момент рендера, поэтому получают обёртку.
// Проверено на реальном iOS-бандле (`expo export --platform ios`).
import React from 'react';
import { adjustTextProps } from './textStyleAdjust';

const RN = require('react-native');

if (!RN.__nurTextPatched) {
  const OrigText = RN.Text;
  // React 19: ref приходит обычным prop и пробрасывается дальше вместе с props
  function NurText(props) {
    return React.createElement(OrigText, adjustTextProps(props));
  }
  NurText.displayName = 'Text';
  try {
    Object.defineProperty(RN, 'Text', {
      configurable: true,
      enumerable: true,
      get: () => NurText,
    });
    Object.defineProperty(RN, '__nurTextPatched', { value: true });
  } catch (e) {
    console.warn('Text patch failed', e);
  }
}
