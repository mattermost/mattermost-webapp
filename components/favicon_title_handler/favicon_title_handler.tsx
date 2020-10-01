// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl, IntlShape} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';
import {Team} from 'mattermost-redux/types/teams';

import * as UserAgent from 'utils/user_agent';
import {Constants} from 'utils/constants';

// default favicons
import faviconDefault16x16 from 'images/favicon/favicon-default-16x16.png';
import faviconDefault24x24 from 'images/favicon/favicon-default-24x24.png';
import faviconDefault32x32 from 'images/favicon/favicon-default-32x32.png';
import faviconDefault64x64 from 'images/favicon/favicon-default-64x64.png';
import faviconDefault96x96 from 'images/favicon/favicon-default-96x96.png';

// mention favicons
import faviconMention16x16 from 'images/favicon/favicon-mentions-16x16.png';
import faviconMention24x24 from 'images/favicon/favicon-mentions-24x24.png';
import faviconMention32x32 from 'images/favicon/favicon-mentions-32x32.png';
import faviconMention64x64 from 'images/favicon/favicon-mentions-64x64.png';
import faviconMention96x96 from 'images/favicon/favicon-mentions-96x96.png';

// unread favicons
import faviconUnread16x16 from 'images/favicon/favicon-unread-16x16.png';
import faviconUnread24x24 from 'images/favicon/favicon-unread-24x24.png';
import faviconUnread32x32 from 'images/favicon/favicon-unread-32x32.png';
import faviconUnread64x64 from 'images/favicon/favicon-unread-64x64.png';
import faviconUnread96x96 from 'images/favicon/favicon-unread-96x96.png';

enum BadgeStatus {
    Mention = 'Mention',
    Unread = 'Unread',
    None = 'None'
}

type Unreads = {
    messageCount: number;
    mentionCount: number;
};

type Props = {
    intl: IntlShape;
    unreads: Unreads;
    siteName?: string;
    currentChannel?: Channel;
    currentTeam: Team;
    currentTeammate: Channel | null;
};

class FaviconTitleHandler extends React.PureComponent<Props> {
    componentDidUpdate(prevProps: Props) {
        this.updateTitle();
        const oldBadgeStatus = this.getBadgeStatus(prevProps.unreads);
        const newBadgeStatus = this.getBadgeStatus(this.props.unreads);

        if (oldBadgeStatus !== newBadgeStatus) {
            this.updateFavicon(newBadgeStatus);
        }
    }

    get isDynamicFaviconSupported() {
        return UserAgent.isChrome() || UserAgent.isFirefox();
    }

    getBadgeStatus(unreads: Unreads) {
        if (unreads.mentionCount > 0) {
            return BadgeStatus.Mention;
        }
        if (unreads.messageCount > 0) {
            return BadgeStatus.Unread;
        }
        return BadgeStatus.None;
    }

    updateTitle = () => {
        const {
            siteName,
            currentChannel,
            currentTeam,
            currentTeammate,
            unreads,
        } = this.props;
        const {formatMessage} = this.props.intl;

        const currentSiteName = siteName || '';

        if (currentChannel && currentTeam && currentChannel.id) {
            let currentChannelName = currentChannel.display_name;
            if (currentChannel.type === Constants.DM_CHANNEL) {
                if (currentTeammate != null) {
                    currentChannelName = currentTeammate.display_name;
                }
            }
            const mentionTitle = unreads.mentionCount > 0 ? '(' + unreads.mentionCount + ') ' : '';
            const unreadTitle = !this.isDynamicFaviconSupported && unreads.messageCount > 0 ? '* ' : '';
            document.title = mentionTitle + unreadTitle + currentChannelName + ' - ' + currentTeam.display_name + ' ' + currentSiteName;
        } else {
            document.title = formatMessage({id: 'sidebar.team_select', defaultMessage: '{siteName} - Join a team'}, {siteName: currentSiteName || 'Mattermost'});
        }
    }

    updateFavicon = (badgeStatus: BadgeStatus) => {
        if (!(UserAgent.isFirefox() || UserAgent.isChrome())) {
            return;
        }

        const link = document.querySelector('link[rel="icon"]');

        if (!link) {
            return;
        }
        const link16x16 = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="16x16"]');
        const link24x24 = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="24x24"]');
        const link32x32 = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="32x32"]');
        const link64x64 = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="64x64"]');
        const link96x96 = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="96x96"]');

        const getFavicon = (url: string) : string => (typeof url === 'string' ? url : '');

        switch (badgeStatus) {
        case BadgeStatus.Mention: {
            link16x16!.href = getFavicon(faviconMention16x16);
            link24x24!.href = getFavicon(faviconMention24x24);
            link32x32!.href = getFavicon(faviconMention32x32);
            link64x64!.href = getFavicon(faviconMention64x64);
            link96x96!.href = getFavicon(faviconMention96x96);
            break;
        }
        case BadgeStatus.Unread: {
            link16x16!.href = getFavicon(faviconUnread16x16);
            link24x24!.href = getFavicon(faviconUnread24x24);
            link32x32!.href = getFavicon(faviconUnread32x32);
            link64x64!.href = getFavicon(faviconUnread64x64);
            link96x96!.href = getFavicon(faviconUnread96x96);
            break;
        }
        default: {
            link16x16!.href = getFavicon(faviconDefault16x16);
            link24x24!.href = getFavicon(faviconDefault24x24);
            link32x32!.href = getFavicon(faviconDefault32x32);
            link64x64!.href = getFavicon(faviconDefault64x64);
            link96x96!.href = getFavicon(faviconDefault96x96);
        }
        }
    }

    render() {
        return null;
    }
}

export default injectIntl(FaviconTitleHandler);
