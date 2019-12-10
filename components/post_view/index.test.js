// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Constants} from 'utils/constants';

import {isChannelLoading} from './index.js';

describe('components/post_view/index', () => {
    test('should return false if loading a permalink view', () => {
        expect(isChannelLoading({postid: 'postId'})).toEqual(false);
    });

    test('should return true if channel or if team data is not present', () => {
        expect(isChannelLoading({}, {id: 'channelId'}, null)).toEqual(true);
        expect(isChannelLoading({}, null, {id: 'teamId'})).toEqual(true);
    });

    test('should return true if channel is a DM and indetifier is not the same as teammate name', () => {
        const channel = {type: Constants.DM_CHANNEL, name: 'myname'};
        expect(isChannelLoading({identifier: 'otherUsername'}, channel, {id: 'teamId'}, {username: 'diffrentName'})).toEqual(true);
    });

    test('should return true if channel is a GM and indetifier is not the same as channel name', () => {
        const channel = {type: Constants.GM_CHANNEL, name: 'username'};
        expect(isChannelLoading({identifier: 'notTheSameName'}, channel, {id: 'teamId'})).toEqual(true);
    });

    test('should return true if channel team id is not the same as current team id', () => {
        const channel = {type: Constants.DM_CHANNEL, name: 'username'};
        expect(isChannelLoading({identifier: 'username'}, channel, {id: 'teamId'})).toEqual(false);
    });

    test('should return true if teamMemberships exist but team is not part of membership', () => {
        const channel = {type: Constants.DM_CHANNEL, name: 'username'};
        expect(isChannelLoading({identifier: 'username'}, channel, {id: 'teamId'}, null, {differentTeamId: {}})).toEqual(true);
    });
});
