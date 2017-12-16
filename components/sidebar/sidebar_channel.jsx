// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

import {Constants} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import SidebarChannelButtonOrLink from './sidebar_channel_button_or_link/sidebar_channel_button_or_link.jsx';
import SidebarTutorialTip from './sidebar_tutorial_tip.jsx';

export default class SidebarChannel extends React.PureComponent {
    static propTypes = {
        channelDisplayName: PropTypes.string.isRequired,
        channelName: PropTypes.string.isRequired,
        channelId: PropTypes.string.isRequired,
        channelType: PropTypes.string.isRequired,
        channelStatus: PropTypes.string,
        channelFake: PropTypes.string,
        channelTeammateId: PropTypes.string,
        channelTeammateDeletedAt: PropTypes.instanceOf(Date),
        stringifiedChannel: PropTypes.string,
        index: PropTypes.number,
        handleClose: PropTypes.func,
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
        membersCount: PropTypes.number.isRequired
    }

    openLeftSidebar = () => {
        if (Utils.isMobile()) {
            setTimeout(() => {
                document.querySelector('.app__body .inner-wrap').classList.add('move--right');
                document.querySelector('.app__body .sidebar--left').classList.add('move--right');
            });
        }
    }

    render = () => {
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

        if (this.props.handleClose && !badge) {
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
            link = '/' + this.props.currentTeamName + '/channels/' + this.props.channelName + '?fakechannel=' + encodeURIComponent(this.props.stringifiedChannel);
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
                ref={this.props.channelName}
                className={linkClass}
            >
                <SidebarChannelButtonOrLink
                    link={link}
                    rowClass={rowClass}
                    channelId={this.props.channelId}
                    channelStatus={this.props.channelStatus}
                    channelType={this.props.channelType}
                    displayName={displayName}
                    handleClose={this.props.handleClose}
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
