// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import SearchIcon from 'components/widgets/icons/search_icon';

export default class ShowSearchButton extends React.PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            openRHSSearch: PropTypes.func.isRequired,
            updateRhsState: PropTypes.func.isRequired,
        }).isRequired,
    }

    handleClick = () => {
        this.props.actions.openRHSSearch();
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
