// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {localizeMessage} from 'utils/utils.jsx';

import SearchIcon from 'components/widgets/icons/search_icon';

export default class ShowSearchButton extends React.PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            openRHSSearch: PropTypes.func.isRequired,
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
                aria-label={localizeMessage('accessibility.button.Search', 'Search')}
            >
                <SearchIcon
                    className='icon icon__search'
                    aria-hidden='true'
                />
            </button>
        );
    }
}
