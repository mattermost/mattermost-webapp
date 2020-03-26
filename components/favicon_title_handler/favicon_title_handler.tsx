// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl, IntlShape} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';
import {Team} from 'mattermost-redux/types/teams';

import * as UserAgent from 'utils/user_agent';
import {Constants} from 'utils/constants';

import favicon16x16 from 'images/favicon/favicon-16x16.png';
import favicon32x32 from 'images/favicon/favicon-32x32.png';
import favicon96x96 from 'images/favicon/favicon-96x96.png';
import redDotFavicon16x16 from 'images/favicon/favicon-reddot-16x16.png';
import redDotFavicon32x32 from 'images/favicon/favicon-reddot-32x32.png';
import redDotFavicon96x96 from 'images/favicon/favicon-reddot-96x96.png';

type Props = {
    intl: IntlShape;
    unreads: {
        messageCount: number;
        mentionCount: number;
    };
    siteName?: string;
    currentChannel: Channel;
    currentTeam: Team;
    currentTeammate: Channel | null;
};

class FaviconTitleHandler extends React.PureComponent<Props> {
    badgesActive: boolean;
    lastBadgesActive: boolean;

    constructor(props: Props) {
        super(props);

        this.badgesActive = false;
        this.lastBadgesActive = false;
    }

    componentDidUpdate(prevProps: Props) {
        this.updateTitle();
        this.setBadgesActiveAndFavicon(prevProps.unreads.mentionCount > 0);
    }

    setBadgesActiveAndFavicon(lastBadgesActive: boolean) {
        if (!(UserAgent.isFirefox() || UserAgent.isChrome())) {
            return;
        }

        const link = document.querySelector('link[rel="icon"]');

        if (!link) {
            return;
        }

        this.badgesActive = this.props.unreads.mentionCount > 0;

        // update the favicon to show if there are any notifications
        if (lastBadgesActive !== this.badgesActive) {
            this.updateFavicon(this.badgesActive);
        }
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
            const unreadTitle = unreads.messageCount > 0 ? '* ' : '';
            document.title = mentionTitle + unreadTitle + currentChannelName + ' - ' + currentTeam.display_name + ' ' + currentSiteName;
        } else {
            document.title = formatMessage({id: 'sidebar.team_select', defaultMessage: '{siteName} - Join a team'}, {siteName: currentSiteName || 'Mattermost'});
        }
    }

    updateFavicon = (active: boolean) => {
        const link16x16 = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="16x16"]');
        const link32x32 = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="32x32"]');
        const link96x96 = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="96x96"]');

        if (active) {
            link16x16!.href = typeof redDotFavicon16x16 === 'string' ? redDotFavicon16x16 : '';
            link32x32!.href = typeof redDotFavicon32x32 === 'string' ? redDotFavicon32x32 : '';
            link96x96!.href = typeof redDotFavicon96x96 === 'string' ? redDotFavicon96x96 : '';
        } else {
            link16x16!.href = typeof favicon16x16 === 'string' ? favicon16x16 : '';
            link32x32!.href = typeof favicon32x32 === 'string' ? favicon32x32 : '';
            link96x96!.href = typeof favicon96x96 === 'string' ? favicon96x96 : '';
        }
    }

    render() {
        return null;
    }
}

export default injectIntl(FaviconTitleHandler);
