// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl} from 'react-intl';

import {browserHistory} from 'utils/browser_history';
import {Constants} from 'utils/constants';
import {intlShape} from 'utils/react_intl';
import {trackEvent} from 'actions/telemetry_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import SidebarChannelButtonOrLink from '../sidebar_channel_button_or_link/sidebar_channel_button_or_link.jsx';
import SidebarTutorialTip from '../sidebar_tutorial_tip.jsx';

class SidebarChannel extends React.PureComponent {
    static propTypes = {

        /**
         * Global config object
         */
        config: PropTypes.object.isRequired,

        /**
         * Channel id
         */
        channelId: PropTypes.string.isRequired,

        /**
         * Channel name
         */
        channelName: PropTypes.string.isRequired,

        /**
         * Channel display name
         */
        channelDisplayName: PropTypes.string.isRequired,

        /**
         * LHS bot icon image url
         */
        botIconUrl: PropTypes.string,

        /**
         * Channel is muted
         */
        channelMuted: PropTypes.bool,

        /**
         * Channel type
         */
        channelType: PropTypes.string.isRequired,

        /**
         * Channel status
         */
        channelStatus: PropTypes.string,

        /**
         * Channel is fake
         */
        channelFake: PropTypes.bool,

        /**
         * Serialized channel information (for fake channels)
         */
        channelStringified: PropTypes.string,

        /**
         * Teammate id (for direct messages)
         */
        channelTeammateId: PropTypes.string,

        /**
         * Teammate username (for direct messages)
         */
        channelTeammateUsername: PropTypes.string,

        /**
         * Teammate delete at date (for direct messages)
         */
        channelTeammateDeletedAt: PropTypes.number,

        /**
         * Teammate is_bot (for direct messages)
         */
        channelTeammateIsBot: PropTypes.bool,

        /**
         * Whether the channel contains a draft in the center channel
         */
        hasDraft: PropTypes.bool.isRequired,

        intl: intlShape.isRequired,

        /**
         * Whether or not to mark the channel as unread when it has unread messages and no mentions
         */
        showUnreadForMsgs: PropTypes.bool.isRequired,

        /**
         * Number of unread messages
         */
        unreadMsgs: PropTypes.number.isRequired,

        /**
         * Number of unread mentions
         */
        unreadMentions: PropTypes.number.isRequired,

        /**
         * Set if the channel is the current active channel
         */
        active: PropTypes.bool.isRequired,

        /**
         * Current team name
         */
        currentTeamName: PropTypes.string.isRequired,

        /**
         * Current user id
         */
        currentUserId: PropTypes.string.isRequired,

        /**
         * Set if the tutorial must be shown
         */
        showTutorialTip: PropTypes.bool.isRequired,

        /**
         * TownSquare (default channel) display name
         */
        townSquareDisplayName: PropTypes.string,

        /**
         * OffTopic (default channel) display name
         */
        offTopicDisplayName: PropTypes.string,

        /**
         * Number of members
         */
        membersCount: PropTypes.number.isRequired,

        /**
         * Flag if channel should be hidden in sidebar
         */
        shouldHideChannel: PropTypes.bool.isRequired,

        channelIsArchived: PropTypes.bool.isRequired,

        redirectChannel: PropTypes.string.isRequired,

        actions: PropTypes.shape({
            savePreferences: PropTypes.func.isRequired,
            leaveChannel: PropTypes.func.isRequired,
            leaveDirectChannel: PropTypes.func.isRequired,
            openLhs: PropTypes.func.isRequired,
        }).isRequired,
    }

    isLeaving = false;

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
            this.props.actions.leaveDirectChannel(this.props.channelName);
            this.props.actions.savePreferences(currentUserId, [{user_id: currentUserId, category, name: id, value: 'false'}]).then(
                () => {
                    this.isLeaving = false;
                },
            );

            trackEvent('ui', 'ui_direct_channel_x_button_clicked');
        }

        if (this.props.active) {
            browserHistory.push(`/${this.props.currentTeamName}/channels/${this.props.redirectChannel}`);
        }
    }

    showChannelAsUnread = () => {
        return this.props.unreadMentions > 0 || (this.props.unreadMsgs > 0 && this.props.showUnreadForMsgs);
    };

    render = () => {
        if (this.props.channelIsArchived && !this.props.active) {
            return null;
        }
        if (!this.props.channelDisplayName || !this.props.channelType) {
            return (<div/>);
        }

        let closeHandler = null;
        if (!this.showChannelAsUnread()) {
            if (this.props.shouldHideChannel) {
                return '';
            }
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
        }

        if (this.props.unreadMentions > 0) {
            rowClass += ' has-badge';

            badge = true;
        }

        if (this.props.channelMuted) {
            rowClass += ' muted';
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
                    openLhs={this.props.actions.openLhs}
                />
            );
        }

        let link = '';
        if (this.props.channelFake) {
            link = `/${this.props.currentTeamName}/channels/${this.props.channelName}?fakechannel=${encodeURIComponent(this.props.channelStringified)}`;
        } else if (this.props.channelType === Constants.DM_CHANNEL) {
            link = `/${this.props.currentTeamName}/messages/@${this.props.channelTeammateUsername}`;
        } else if (this.props.channelType === Constants.GM_CHANNEL) {
            link = `/${this.props.currentTeamName}/messages/${this.props.channelName}`;
        } else {
            link = `/${this.props.currentTeamName}/channels/${this.props.channelName}`;
        }

        let displayName = '';
        if (this.props.currentUserId === this.props.channelTeammateId) {
            displayName = this.props.intl.formatMessage({
                id: 'sidebar.directchannel.you',
                defaultMessage: '{displayname} (you)',
            }, {
                displayname: this.props.channelDisplayName,
            });
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
                    channelName={this.props.channelName}
                    botIconUrl={this.props.botIconUrl}
                    channelStatus={this.props.channelStatus}
                    channelType={this.props.channelType}
                    displayName={displayName}
                    handleClose={closeHandler}
                    hasDraft={this.props.hasDraft}
                    badge={badge}
                    showUnreadForMsgs={this.props.showUnreadForMsgs}
                    unreadMentions={this.props.unreadMentions}
                    unreadMsgs={this.props.unreadMsgs}
                    membersCount={this.props.membersCount}
                    teammateId={this.props.channelTeammateId}
                    teammateDeletedAt={this.props.channelTeammateDeletedAt}
                    teammateIsBot={this.props.channelTeammateIsBot}
                    channelIsArchived={this.props.channelIsArchived}
                />
                {tutorialTip}
            </li>
        );
    }
}

const wrappedComponent = injectIntl(SidebarChannel, {forwardRef: true});
wrappedComponent.displayName = 'injectIntl(SidebarChannel)';
export default wrappedComponent;
/* eslint-enable react/no-string-refs */
