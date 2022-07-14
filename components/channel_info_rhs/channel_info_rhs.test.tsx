// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Channel, ChannelStats} from '@mattermost/types/channels';
import {renderWithIntl} from 'tests/react_testing_utils';
import {UserProfile} from '@mattermost/types/users';
import {Team} from '@mattermost/types/teams';

import ChannelInfoRHS from './channel_info_rhs';

const mockAboutArea = jest.fn();
jest.mock('./about_area', () => (props: any) => {
    mockAboutArea(props);
    return <div>{'test-about-area'}</div>;
});

describe('channel_info_rhs', () => {
    const OriginalProps = {
        channel: {display_name: 'my channel title', type: 'O'} as Channel,
        isArchived: false,
        channelStats: {} as ChannelStats,
        currentUser: {} as UserProfile,
        currentTeam: {} as Team,
        isFavorite: false,
        isMuted: false,
        isInvitingPeople: false,
        isMobile: false,
        canManageMembers: true,
        canManageProperties: true,
        channelMembers: [],
        actions: {
            closeRightHandSide: jest.fn(),
            unfavoriteChannel: jest.fn(),
            favoriteChannel: jest.fn(),
            unmuteChannel: jest.fn(),
            muteChannel: jest.fn(),
            openModal: jest.fn(),
            showChannelFiles: jest.fn(),
            showPinnedPosts: jest.fn(),
            showChannelMembers: jest.fn(),
        },
    };
    let props = {...OriginalProps};

    beforeEach(() => {
        props = {...OriginalProps};
    });

    describe('about area', () => {
        test('should be editable', () => {
            renderWithIntl(
                <ChannelInfoRHS
                    {...props}
                />,
            );

            expect(mockAboutArea).toHaveBeenCalledWith(
                expect.objectContaining({
                    canEditChannelProperties: true,
                }),
            );
        });
        test('should not be editable in archived channel', () => {
            props.isArchived = true;

            renderWithIntl(
                <ChannelInfoRHS
                    {...props}
                />,
            );

            expect(mockAboutArea).toHaveBeenCalledWith(
                expect.objectContaining({
                    canEditChannelProperties: false,
                }),
            );
        });
    });
});
