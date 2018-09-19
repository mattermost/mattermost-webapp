// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {matchExistsInChannelProfiles, getChannelsWithUserProfiles} from 'selectors/more_direct_channels';

jest.mock('mattermost-redux/selectors/entities/channels', () => ({
    getGroupChannels: jest.fn(() => {
        var channel = {};
        channel.name = 'some-name';
        channel.display_name = `Unit Test ${channel.name}`;
        channel.type = 'G';
        return [channel];
    }),
}));

jest.mock('mattermost-redux/selectors/entities/users', () => ({

    makeGetProfilesInChannel: jest.fn(() => {
        const mockUser1 = {id: 'user1', password: 'password', username: 'user1'};
        const mockUser2 = {id: 'user2', password: 'password', username: 'user2'};
        const mockUser3 = {id: 'user3', password: 'password', username: 'user3'};
        return () => [mockUser1, mockUser2, mockUser3];
    }),
    getCurrentUserId: jest.fn(() => 'user1'),
}));

describe('more_direct_channels selector', () => {
    test('getChannelsWithUserProfiles', () => {
        expect(getChannelsWithUserProfiles({})).toMatchSnapshot();
    });
});

describe('matchExistsInChannelProfiles', () => {
    const mockUser1 = {id: 'user1', password: 'password', username: 'user1', first_name: 'foo', last_name: 'bar', nickname: 'foobar'};
    const mockUser2 = {id: 'user2', password: 'password', username: 'Hello', first_name: 'john', last_name: 'smith', nickname: 'jsmith'};
    const mockUser3 = {id: 'user3', password: 'password', username: 'HelloWorld', first_name: 'steve', last_name: 'fleming', nickname: 'sfleming'};

    const profiles = [mockUser1, mockUser2, mockUser3];

    test('should return true for username', () => {
        const searchTerm = 'Hello';
        const exists = matchExistsInChannelProfiles(profiles, searchTerm);
        expect(exists).toBeTruthy();
    });

    test('should return true for firstName', () => {
        const searchTerm = 'john';
        const exists = matchExistsInChannelProfiles(profiles, searchTerm);
        expect(exists).toBeTruthy();
    });

    test('should return true for lastname', () => {
        const searchTerm = 'fleming';
        const exists = matchExistsInChannelProfiles(profiles, searchTerm);
        expect(exists).toBeTruthy();
    });

    test('should return true for nickname', () => {
        const searchTerm = 'foobar';
        const exists = matchExistsInChannelProfiles(profiles, searchTerm);
        expect(exists).toBeTruthy();
    });

    test('should return false if nothing matches', () => {
        const searchTerm = 'non-existing';
        const exists = matchExistsInChannelProfiles(profiles, searchTerm);
        expect(exists).toBeFalsy();
    });
});

