// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import SearchIcon from 'components/widgets/icons/search_icon';
import {RHSStates} from 'utils/constants';

export default class ShowSearchButton extends React.PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            updateRhsState: PropTypes.func.isRequired,
        }).isRequired,
    }

    handleClick = () => {
        this.props.actions.updateRhsState(RHSStates.SEARCH);
    }

    render() {
        return (
            <button
                type='button'
                className='navbar-toggle navbar-right__icon navbar-search pull-right'
                onClick={this.handleClick}
            >
                <SearchIcon
                    className='icon icon__search'
                    aria-hidden='true'
                />
            </button>
        );
    }
}
