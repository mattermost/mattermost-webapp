// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {localizeMessage} from 'utils/utils';

import Menu from 'components/widgets/menu/menu';

type Props = {
    show?: boolean;
    channel: any;
    hasPinnedPosts: boolean;
    actions: {
        closeRightHandSide: () => (dispatch: any) => void;
        showPinnedPosts: (id: any) => void;
    };
}

export default class ViewPinnedPosts extends React.PureComponent<Props> {
    private handleClick = (e: React.MouseEvent) => {
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
