// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';

import styled from 'styled-components';

import {useIntl} from 'react-intl';

import {UserProfile} from '@mattermost/types/users';
import {Channel} from '@mattermost/types/channels';
import {Team} from '@mattermost/types/teams';

import {getSiteURL} from 'utils/url';
import {t} from 'utils/i18n';

import SearchResultsHeader from 'components/search_results_header';

const Divider = styled.div`
    width: 88%;
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.04);
    margin: 0 auto;
`;

export interface Props {
    channelDisplayName: string;

    // currentUser: UserProfile;
    // currentTeam: Team;
    // isMobile: boolean;

    // actions: {
    //     closeRightHandSide: () => void;
    // };
}

const PostEditHistory = ({
    channelDisplayName,

    // isMobile,
    // currentTeam,
    // currentUser,
    // actions,
}: Props) => {
    // const currentUserId = currentUser.id;
    // const channelURL = getSiteURL() + '/' + currentTeam.name + '/channels/' + channel.name;
    const {formatMessage} = useIntl();

    const formattedTitle = formatMessage({
        id: t('search_header.title6'),
        defaultMessage: 'Edit History',
    });

    return (
        <div
            id='rhsContainer'
            className='sidebar-right__body'
        >
            <SearchResultsHeader>
                {formattedTitle}
                {<div className='sidebar--right__title__channel'>{channelDisplayName}</div>}
            </SearchResultsHeader>
            <Divider/>
            <div>{'This is a post history'}</div>
        </div>
    );
};

export default memo(PostEditHistory);
