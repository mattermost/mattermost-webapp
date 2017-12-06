// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import {browserHistory} from 'react-router';

import {Constants} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import {trackEvent} from 'actions/diagnostics_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';

import SidebarChannelButtonOrLink from '../sidebar_channel_button_or_link/sidebar_channel_button_or_link.jsx';
import SidebarTutorialTip from '../sidebar_tutorial_tip.jsx';

export default class SidebarChannel extends React.PureComponent {
    static propTypes = {
        config: PropTypes.object.isRequired,
        channelId: PropTypes.string.isRequired,
        channelName: PropTypes.string.isRequired,
        channelDisplayName: PropTypes.string.isRequired,
        channelType: PropTypes.string.isRequired,
        channelStatus: PropTypes.string,
        channelFake: PropTypes.bool,
        channelStringified: PropTypes.string,
        channelTeammateId: PropTypes.string,
        channelTeammateDeletedAt: PropTypes.number,
        index: PropTypes.number,
        membership: PropTypes.object,
        unreadMsgs: PropTypes.number.isRequired,
        unreadMentions: PropTypes.number.isRequired,
        active: PropTypes.bool.isRequired,
        loadingDMChannel: PropTypes.bool.isRequired,
        currentTeamName: PropTypes.string.isRequired,
        currentUserId: PropTypes.string.isRequired,
        showTutorialTip: PropTypes.bool.isRequired,
        townSquareDisplayName: PropTypes.string,
        offTopicDisplayName: PropTypes.string,
        membersCount: PropTypes.number.isRequired,
        actions: PropTypes.shape({
            savePreferences: PropTypes.func.isRequired,
            leaveChannel: PropTypes.func.isRequired
        }).isRequired
    }

    isLeaving = false;

    openLeftSidebar = () => {
        if (Utils.isMobile()) {
            setTimeout(() => {
                document.querySelector('.app__body .inner-wrap').classList.add('move--right');
                document.querySelector('.app__body .sidebar--left').classList.add('move--right');
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
            browserHistory.push('/' + this.props.currentTeamName + '/channels/town-square');
        }
    }

    render = () => {
        let closeHandler = null;
        if (this.props.channelType === Constants.DM_CHANNEL || this.props.channelType === Constants.GM_CHANNEL) {
            closeHandler = this.handleLeaveDirectChannel;
        } else if (this.props.config.EnableXToLeaveChannelsFromLHS === 'true') {
            if (this.props.channelType === Constants.OPEN_CHANNEL && this.props.channelName !== Constants.DEFAULT_CHANNEL) {
                closeHandler = this.handleLeavePublicChannel;
            } else if (this.props.channelType === Constants.PRIVATE_CHANNEL) {
                closeHandler = this.handleLeavePrivateChannel;
            }
        }

        let linkClass = '';
        if (this.props.active) {
            linkClass = 'active';
        }

        let rowClass = 'sidebar-item';

        var unread = false;
        if (this.props.membership) {
            const msgCount = this.props.unreadMsgs + this.props.unreadMentions;
            unread = msgCount > 0 || this.props.membership.mention_count > 0;
        }

        if (unread) {
            rowClass += ' unread-title';
        }

        var badge = null;
        if (this.props.membership) {
            if (this.props.unreadMentions) {
                badge = 'mentions';
            }
        } else if (this.props.loadingDMChannel) {
            badge = 'loading';
        }

        if (this.props.unreadMentions > 0) {
            rowClass += ' has-badge';
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
        if (this.props.channelFake) {
            link = '/' + this.props.currentTeamName + '/channels/' + this.props.channelName + '?fakechannel=' + encodeURIComponent(this.props.channelStringified);
        } else {
            link = '/' + this.props.currentTeamName + '/channels/' + this.props.channelName;
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
