// Web: Text из react-native-web — React.forwardRef, его render(props, ref)
// можно обернуть и подменить входные props.
import { Text } from 'react-native';
import { adjustTextProps } from './textStyleAdjust';

if (!Text.__nurPatched && typeof Text.render === 'function') {
  Text.__nurPatched = true;
  const origRender = Text.render;
  Text.render = function nurTextRender(props, ref) {
    return origRender.call(this, adjustTextProps(props), ref);
  };
}
