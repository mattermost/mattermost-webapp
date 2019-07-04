// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

export default function Toggle({onToggle, toggled}) {
    return (
        <button
            type='button'
            onClick={onToggle}
            className={`btn btn-lg btn-toggle ${toggled && 'active'}`}
            aria-pressed={toggled ? 'true' : 'false'}
            autoComplete='off'
        >
            <div className='handle'/>
        </button>);
}

Toggle.propTypes = {
    onToggle: PropTypes.func.isRequired,
    toggled: PropTypes.bool,
};
