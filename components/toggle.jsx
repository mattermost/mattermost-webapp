// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

export default function Toggle({onToggle, toggled, onText, offText, disabled}) {
    return (
        <button
            type='button'
            onClick={onToggle}
            className={`btn btn-lg btn-toggle ${toggled && 'active'} ${disabled && 'disabled'}`}
            aria-pressed={toggled ? 'true' : 'false'}
            autoComplete='off'
        >
            <div className='handle'/>
            {text(toggled, onText, offText)}
        </button>);
}

function text(toggled, onText, offText) {
    if ((toggled && !onText) || (!toggled && !offText)) {
        return null;
    }
    return (<div className={`bg-text ${toggled ? 'on' : 'off'}`}>{toggled ? onText : offText}</div>);
}

Toggle.propTypes = {
    onToggle: PropTypes.func.isRequired,
    toggled: PropTypes.bool,
    disabled: PropTypes.bool,
    onText: PropTypes.node,
    offText: PropTypes.node,
};
