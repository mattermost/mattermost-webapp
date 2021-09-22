// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {UserProfile} from 'mattermost-redux/types/users';
import {Team} from 'mattermost-redux/types/teams';
import {Channel} from 'mattermost-redux/types/channels';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import {localizeMessage} from 'utils/utils';
import {Constants} from 'utils/constants';
import {browserHistory} from 'utils/browser_history';
import Menu from 'components/widgets/menu/menu';

type Props = {

    /**
     * Object with info about currentUser
     */
    currentUser: UserProfile;

    /**
     * Object with info about currentTeam
     */
    currentTeam: Team;

    /**
     * String with info about redirect
     */
    redirectChannel: string;

    /**
     * Object with info about channel
     */
    channel: Channel;

    /**
     * Use for test selector
     */
    id?: string;

    /**
     * Object with action creators
     */
    actions: {

        /**
         * Action creator to update user preferences
         */
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;

        /**
         * Action creator to leave DM/GM
         */
        leaveDirectChannel: (channelName: string) => void;
    };
};

export default class CloseMessage extends React.PureComponent<Props> {
    handleClose = (e: React.MouseEvent): void => {
        e.preventDefault();

        const {
            channel,
            currentUser,
            currentTeam,
            redirectChannel,
            actions: {
                savePreferences,
                leaveDirectChannel,
            },
        } = this.props;

        let name: string;
        let category;
        if (channel.type === Constants.DM_CHANNEL) {
            category = Constants.Preferences.CATEGORY_DIRECT_CHANNEL_SHOW;
            name = channel.teammate_id!;
        } else {
            category = Constants.Preferences.CATEGORY_GROUP_CHANNEL_SHOW;
            name = channel.id;
        }

        leaveDirectChannel(channel.name);
        savePreferences(currentUser.id, [{user_id: currentUser.id, category, name, value: 'false'}]);

        browserHistory.push(`/${currentTeam.name}/channels/${redirectChannel}`);
    }

    render(): React.ReactNode {
        const {id, channel} = this.props;

        let text;
        if (channel.type === Constants.DM_CHANNEL) {
            text = localizeMessage('center_panel.direct.closeDirectMessage', 'Close Direct Message');
        }

        return (
            <Menu.ItemAction
                id={id}
                show={channel.type === Constants.DM_CHANNEL}
                onClick={this.handleClose}
                text={text}
            />
        );
    }
}
