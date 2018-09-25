// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import SearchIcon from 'components/svg/search_icon';
import {RHSStates} from 'utils/constants';

const ShowSearchButton = ({
    actions: {
        updateRhsState,
    },
}) => (
    <button
        type='button'
        className='navbar-toggle navbar-right__icon navbar-search pull-right'
        onClick={() => updateRhsState(RHSStates.SEARCH)}
    >
        <SearchIcon
            className='icon icon__search'
            aria-hidden='true'
        />
    </button>
);

ShowSearchButton.propTypes = {
    actions: PropTypes.shape({
        updateRhsState: PropTypes.func.isRequired,
    }).isRequired,
};

export default ShowSearchButton;
