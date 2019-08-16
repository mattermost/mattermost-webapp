// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {localizeMessage} from 'utils/utils';

import Menu from 'components/widgets/menu/menu';

export default class ViewPinnedPosts extends React.PureComponent {
    static propTypes = {
        show: PropTypes.bool,
        channel: PropTypes.object.isRequired,
        hasPinnedPosts: PropTypes.bool.isRequired,
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
            <Menu.ItemAction
                show={this.props.show}
                onClick={this.handleClick}
                text={localizeMessage('navbar.viewPinnedPosts', 'View Pinned Posts')}
            />
        );
    }
}
