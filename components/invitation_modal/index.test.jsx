// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {mapStateToProps} from './index.js';

jest.mock('mattermost-redux/selectors/entities/channels', () => ({
    getMyChannels: () => [],
}));

jest.mock('mattermost-redux/selectors/entities/general', () => ({
    getConfig: () => ({EnableGuestAccounts: 'true'}),
    getLicense: () => ({IsLicensed: 'true'}),
}));

jest.mock('mattermost-redux/selectors/entities/teams', () => ({
    getCurrentTeam: jest.fn().mockReturnValueOnce({group_constrained: true}).mockReturnValueOnce({group_constrained: false}),
}));

jest.mock('mattermost-redux/selectors/entities/roles', () => ({
    haveIChannelPermission: () => true,
    haveITeamPermission: () => true,
}));

jest.mock('mattermost-redux/actions/users', () => ({
    getProfiles: () => [],
    searchProfiles: () => [],
}));

jest.mock('actions/views/modals', () => ({
    closeModal: jest.fn(),
}));

jest.mock('selectors/views/modals', () => ({
    isModalOpen: jest.fn(),
}));

jest.mock('utils/constants', () => ({
    ModalIdentifiers: jest.fn(),
    Constants: jest.fn(),
}));

jest.mock('actions/invite_actions', () => ({
    sendMembersInvites: jest.fn(),
    sendGuestsInvites: jest.fn(),
}));

jest.mock('./invitation_modal.jsx', () => jest.fn());

describe('mapStateToProps', () => {
    const baseState = {};

    test('canInviteGuests is false when group_constrained is true', () => {
        const props = mapStateToProps(baseState);
        expect(props.canInviteGuests).toBe(false);
    });

    test('canInviteGuests is true when group_constrained is false', () => {
        const props = mapStateToProps(baseState);
        expect(props.canInviteGuests).toBe(true);
    });
});