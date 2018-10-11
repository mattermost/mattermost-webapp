// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

export default class ViewPinnedPosts extends React.PureComponent {
    static propTypes = {

        /**
         * Object with info about channel
         */
        channel: PropTypes.object.isRequired,

        /**
         * Bool whether the channel has pinned any posts
         * from redux store
         */
        hasPinnedPosts: PropTypes.bool.isRequired,

        /**
         * Object with action creators
         */
        actions: PropTypes.shape({
            closeRightHandSide: PropTypes.func.isRequired,
            showPinnedPosts: PropTypes.func.isRequired,
        }).isRequired,
    }

    handleClick = (e) => {
        e.preventDefault();

        const {
            channel,
            hasPinnedPosts,
            actions: {
                closeRightHandSide,
                showPinnedPosts,
            },
        } = this.props;

        if (hasPinnedPosts) {
            closeRightHandSide();
        } else {
            showPinnedPosts(channel.id);
        }
    }

    render() {
        return (
            <li role='presentation'>
                <button
                    role='menuitem'
                    className='style--none'
                    onClick={this.handleClick}
                >
                    <FormattedMessage
                        id='navbar.viewPinnedPosts'
                        defaultMessage='View Pinned Posts'
                    />
                </button>
            </li>
        );
    }
}
