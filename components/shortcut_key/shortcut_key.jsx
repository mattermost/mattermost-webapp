import PropTypes from 'prop-types';
import React from 'react';

import './shortcut_key.scss';

export const ShortcutKey = ({children, variant}) => {
  let className = 'shortcut-key';
  if (variant === 'contrast') {
    className += ' shortcut-key--contrast';
  }

  return (
    <mark className={className}>
      {children}
    </mark>
  );
};

ShortcutKey.propTypes = {
  variant: PropTypes.string,
};