import { ShortcutKey } from 'components/shortcut_key';
import React from 'react';

import * as Utils from 'utils/utils.jsx';

export const SearchShortcut = () => {
  const controlKey = Utils.isMac() ? '⌘' : 'Ctrl';

  return (
    <React.Fragment>
        <ShortcutKey variant="contrast">{controlKey}</ShortcutKey>
        <ShortcutKey variant="contrast">Shift</ShortcutKey>
        <ShortcutKey variant="contrast">F</ShortcutKey>
    </React.Fragment>
  );
};