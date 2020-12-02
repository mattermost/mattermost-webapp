// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Channel} from 'mattermost-redux/types/channels';

import {showLeavePrivateChannelModal} from 'actions/global_actions';
import {Constants} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import Menu from 'components/widgets/menu/menu';

type Props = {

    /**
     * Object with info about user
     */
    channel: Channel;

    /**
     * Boolean whether the channel is default
     */
    isDefault: boolean;

    /**
     * Boolean whether the user is a guest or no
     */
    isGuestUser: boolean;

    /**
     * Use for test selector
     */
    id?: string;

    /**
     * Object with action creators
     */
    actions: {

        /**
         * Action creator to leave channel
         */
        leaveChannel: (channelId: string) => void;
    };
};

type State = {
};

export default class LeaveChannel extends React.PureComponent<Props, State> {
    static defaultProps = {
        isDefault: true,
        isGuestUser: false,
    }

    handleLeave = (e: Event) => {
        e.preventDefault();

        const {
            channel,
            actions: {
                leaveChannel,
            },
        } = this.props;

        if (channel.type === Constants.PRIVATE_CHANNEL) {
            showLeavePrivateChannelModal(channel);
        } else {
            leaveChannel(channel.id);
        }
    }

    render() {
        const {channel, isDefault, isGuestUser, id} = this.props;

        return (
            <Menu.ItemAction
                id={id}
                show={(!isDefault || isGuestUser) && channel.type !== Constants.DM_CHANNEL && channel.type !== Constants.GM_CHANNEL}
                onClick={this.handleLeave}
                text={localizeMessage('channel_header.leave', 'Leave Channel')}
            />
        );
    }
}
