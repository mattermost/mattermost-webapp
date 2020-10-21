import PropTypes from 'prop-types';
import React from 'react';

import './shortcut_key.scss';

export const ShortcutKetVariant = {
  contrast: 'contrast',
};

export const ShortcutKey = ({children, variant}) => {
  let className = 'shortcut-key';
  if (variant === ShortcutKetVariant.contrast) {
    className += ' shortcut-key--contrast';
  }

  return (
    <mark className={className}>
      {children}
    </mark>
  );
};

ShortcutKey.propTypes = {
  /* Variant of shortcut key appearance to use. Can be either `contrast` or not set at all for regular */
  variant: PropTypes.oneOf(Object.values(ShortcutKetVariant)),
};