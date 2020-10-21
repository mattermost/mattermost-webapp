import { ShortcutKey, ShortcutKeyVariant } from 'components/shortcut_key';
import { ShortcutKetVariant } from 'components/shortcut_key/shortcut_key';
import React from 'react';

import * as Utils from 'utils/utils.jsx';

export const SearchShortcut = () => {
  const controlKey = Utils.isMac() ? '⌘' : 'Ctrl';

  return (
    <React.Fragment>
        <ShortcutKey variant={ShortcutKetVariant.contrast}>{controlKey}</ShortcutKey>
        <ShortcutKey variant={ShortcutKetVariant.contrast}>Shift</ShortcutKey>
        <ShortcutKey variant={ShortcutKetVariant.contrast}>F</ShortcutKey>
    </React.Fragment>
  );
};