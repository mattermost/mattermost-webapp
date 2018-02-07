// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.
// @flow

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {browserHistory} from 'utils/browser_history';
import {Constants} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import {trackEvent} from 'actions/diagnostics_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import SidebarChannelButtonOrLink from '../sidebar_channel_button_or_link/sidebar_channel_button_or_link.jsx';
import SidebarTutorialTip from '../sidebar_tutorial_tip.jsx';

type Props = {

    /**
     * Global config object
     */
    config: Object,

    /**
     * Channel id
     */
    channelId: string,

    /**
     * Channel name
     */
    channelName: string,

    /**
     * Channel display name
     */
    channelDisplayName: string,

    /**
     * Channel type
     */
    channelType: string,

    /**
     * Channel status
     */
    channelStatus?: string,

    /**
     * Channel is fake
     */
    channelFake?: boolean,

    /**
     * Serialized channel information (for fake channels)
     */
    channelStringified?: string,

    /**
     * Teammate id (for direct messages)
     */
    channelTeammateId?: string,

    /**
     * Teammate delete at date (for direct messages)
     */
    channelTeammateDeletedAt?: number,

    /**
     * Teammate username (for direct messages)
     */
    channelTeammateUsername?: string,

    /**
     * Whether or not to mark the channel as unread when it has unread messages and no mentions
     */
    showUnreadForMsgs: boolean,

    /**
     * Number of unread messages
     */
    unreadMsgs: number,

    /**
     * Number of unread mentions
     */
    unreadMentions: number,

    /**
     * Set if the channel is the current active channel
     */
    active: boolean,

    /**
     * Current team name
     */
    currentTeamName: string,

    /**
     * Current user id
     */
    currentUserId: string,

    /**
     * Set if the tutorial must be shown
     */
    showTutorialTip: boolean,

    /**
     * TownSquare (default channel) display name
     */
    townSquareDisplayName?: string,

    /**
     * OffTopic (default channel) display name
     */
    offTopicDisplayName?: string,

    /**
     * Number of members
     */
    membersCount: number,

    actions: {
        savePreferences: (string, Array<Object>) => Promise<void>,
        leaveChannel: (string) => Promise<void>
    }
}

export default class SidebarChannel extends React.PureComponent<Props> {
    props: Props;

    isLeaving = false;

    openLeftSidebar = () => {
        if (Utils.isMobile()) {
            setTimeout(() => {
                let element = document.querySelector('.app__body .inner-wrap');
                if (element) {
                    element.classList.add('move--right');
                }
                element = document.querySelector('.app__body .sidebar--left');
                if (element) {
                    element.classList.add('move--right');
                }
            });
        }
    }

    handleLeavePublicChannel = () => {
        this.props.actions.leaveChannel(this.props.channelId);
        trackEvent('ui', 'ui_public_channel_x_button_clicked');
    }

    handleLeavePrivateChannel = () => {
        GlobalActions.showLeavePrivateChannelModal({id: this.props.channelId, display_name: this.props.channelDisplayName});
        trackEvent('ui', 'ui_private_channel_x_button_clicked');
    }

    handleLeaveDirectChannel = () => {
        if (!this.isLeaving) {
            this.isLeaving = true;

            let id;
            let category;
            if (this.props.channelType === Constants.DM_CHANNEL) {
                id = this.props.channelTeammateId;
                category = Constants.Preferences.CATEGORY_DIRECT_CHANNEL_SHOW;
            } else {
                id = this.props.channelId;
                category = Constants.Preferences.CATEGORY_GROUP_CHANNEL_SHOW;
            }

            const currentUserId = this.props.currentUserId;
            this.props.actions.savePreferences(currentUserId, [{user_id: currentUserId, category, name: id, value: 'false'}]).then(
                () => {
                    this.isLeaving = false;
                }
            );

            trackEvent('ui', 'ui_direct_channel_x_button_clicked');
        }

        if (this.props.active) {
            browserHistory.push(`/${this.props.currentTeamName}/channels/${Constants.DEFAULT_CHANNEL}`);
        }
    }

    showChannelAsUnread = () => {
        return this.props.unreadMentions > 0 || (this.props.unreadMsgs > 0 && this.props.showUnreadForMsgs);
    };

    render = () => {
        if (!this.props.channelDisplayName || !this.props.channelType) {
            return (<div/>);
        }

        let closeHandler;
        if (!this.showChannelAsUnread()) {
            if (this.props.channelType === Constants.DM_CHANNEL || this.props.channelType === Constants.GM_CHANNEL) {
                closeHandler = this.handleLeaveDirectChannel;
            } else if (this.props.config.EnableXToLeaveChannelsFromLHS === 'true') {
                if (this.props.channelType === Constants.OPEN_CHANNEL && this.props.channelName !== Constants.DEFAULT_CHANNEL) {
                    closeHandler = this.handleLeavePublicChannel;
                } else if (this.props.channelType === Constants.PRIVATE_CHANNEL) {
                    closeHandler = this.handleLeavePrivateChannel;
                }
            }
        }

        let linkClass = '';
        if (this.props.active) {
            linkClass = 'active';
        }

        let rowClass = 'sidebar-item';
        let badge = false;
        if (this.showChannelAsUnread()) {
            rowClass += ' unread-title';

            if (this.props.unreadMentions > 0) {
                rowClass += ' has-badge';

                badge = true;
            }
        }

        if (closeHandler && !badge) {
            rowClass += ' has-close';
        }

        let tutorialTip = null;
        if (this.props.showTutorialTip && this.props.channelName === Constants.DEFAULT_CHANNEL) {
            tutorialTip = (
                <SidebarTutorialTip
                    townSquareDisplayName={this.props.townSquareDisplayName}
                    offTopicDisplayName={this.props.offTopicDisplayName}
                />
            );
            this.openLeftSidebar();
        }

        let link = '';
        if (this.props.channelFake && this.props.channelStringified) {
            link = `/${this.props.currentTeamName}/channels/${this.props.channelName}?fakechannel=${encodeURIComponent(this.props.channelStringified)}`;
        } else if (this.props.channelType === Constants.DM_CHANNEL && this.props.channelTeammateUsername) {
            link = `/${this.props.currentTeamName}/messages/@${this.props.channelTeammateUsername}`;
        } else if (this.props.channelType === Constants.GM_CHANNEL) {
            link = `/${this.props.currentTeamName}/messages/${this.props.channelName}`;
        } else {
            link = `/${this.props.currentTeamName}/channels/${this.props.channelName}`;
        }

        let displayName = '';
        if (this.props.currentUserId === this.props.channelTeammateId) {
            displayName = (
                <FormattedMessage
                    id='sidebar.directchannel.you'
                    defaultMessage='{displayname} (you)'
                    values={{
                        displayname: this.props.channelDisplayName
                    }}
                />
            );
        } else {
            displayName = this.props.channelDisplayName;
        }

        return (
            <li
                key={this.props.channelName}
                ref={'channel'}
                className={linkClass}
            >
                <SidebarChannelButtonOrLink
                    link={link}
                    rowClass={rowClass}
                    channelId={this.props.channelId}
                    channelStatus={this.props.channelStatus}
                    channelType={this.props.channelType}
                    displayName={displayName}
                    handleClose={closeHandler}
                    badge={badge}
                    unreadMentions={this.props.unreadMentions}
                    membersCount={this.props.membersCount}
                    teammateId={this.props.channelTeammateId}
                    teammateDeletedAt={this.props.channelTeammateDeletedAt}
                />
                {tutorialTip}
            </li>
        );
    }
}
