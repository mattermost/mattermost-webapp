// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';

import styled from 'styled-components';

import {UserProfile} from '@mattermost/types/users';
import {Channel} from '@mattermost/types/channels';
import {getSiteURL} from 'utils/url';
import {Team} from '@mattermost/types/teams';

const Divider = styled.div`
    width: 88%;
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.04);
    margin: 0 auto;
`;

export interface Props {
    // channel: Channel;
    // currentUser: UserProfile;
    // currentTeam: Team;
    // isMobile: boolean;

    // actions: {
    //     closeRightHandSide: () => void;
    // };
}

const PostEditHistory = ({
    // channel,
    // isMobile,
    // currentTeam,
    // currentUser,
    // actions,
}: Props) => {
    // const currentUserId = currentUser.id;
    // const channelURL = getSiteURL() + '/' + currentTeam.name + '/channels/' + channel.name;

    return (
        <div
            id='rhsContainer'
            className='sidebar-right__body'
        >
            <Divider/>
            <div>{'This is a post history'}</div>
        </div>
    );
};

export default memo(PostEditHistory);
