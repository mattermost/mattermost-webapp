import PropTypes from 'prop-types';
import React from 'react';

import Toast from 'components/toast/toast';

export const PostListHint = ({show, onDismiss, children}) => {
  return (
    <Toast show={show} extraClasses="toast__hint" onDismiss={onDismiss}> 
        {children}
    </Toast>
  );
};

PostListHint.propTypes = {
  /* Controls whether this tooltip should be shown */
  show: PropTypes.bool.isRequired,

  /* Handler function for Dismiss button */
  onDismiss: PropTypes.func,

  children: PropTypes.node,
};