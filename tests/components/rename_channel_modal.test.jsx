// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {RequestStatus} from 'mattermost-redux/constants';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import RenameChannelModal from 'components/rename_channel_modal/rename_channel_modal.jsx';

describe('components/rename_channel_modal/rename_channel_modal.jsx', () => {
    const channel = {
        id: 'fake-id',
        name: 'fake-channel',
        display_name: 'Fake Channel'
    };

    const team = {
        name: 'Fake Team', display_name: 'fake-team', type: 'O'
    };

    function emptyFunction() {} //eslint-disable-line no-empty-function

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <RenameChannelModal
                show={true}
                onHide={emptyFunction}
                channel={channel}
                requestStatus={RequestStatus.NOT_STARTED}
                team={team}
                currentTeamUrl={'fake-channel'}
                actions={{updateChannel: emptyFunction}}
            />
        ).dive({disableLifecycleMethods: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should submit form', () => {
        const updateChannel = jest.fn();
        const wrapper = shallowWithIntl(
            <RenameChannelModal
                show={true}
                onHide={emptyFunction}
                channel={channel}
                requestStatus={RequestStatus.STARTED}
                team={team}
                currentTeamUrl={'fake-channel'}
                actions={{updateChannel: emptyFunction}}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find('#save-button').simulate('click');

        expect(updateChannel).not.toHaveBeenCalled();
    });

    test('should not call updateChannel as channel.name.length > Constants.MAX_CHANNELNAME_LENGTH (22)', () => {
        const updateChannel = jest.fn();
        const wrapper = shallowWithIntl(
            <RenameChannelModal
                show={true}
                onHide={emptyFunction}
                channel={channel}
                requestStatus={RequestStatus.NOT_STARTED}
                team={team}
                currentTeamUrl={'fake-channel'}
                actions={{updateChannel: emptyFunction}}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find('#display_name').simulate(
            'change', {preventDefault: jest.fn(), target: {value: 'string-above-twentytwo-characters'}}
        );

        wrapper.find('#save-button').simulate('click');

        expect(updateChannel).not.toHaveBeenCalled();
    });

    test('should change state when display_name is edited', () => {
        const wrapper = shallowWithIntl(
            <RenameChannelModal
                show={true}
                onHide={emptyFunction}
                channel={channel}
                requestStatus={RequestStatus.NOT_STARTED}
                team={team}
                currentTeamUrl={'fake-channel'}
                actions={{updateChannel: emptyFunction}}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find('#display_name').simulate(
            'change', {preventDefault: jest.fn(), target: {value: 'New Fake Channel'}}
        );

        expect(wrapper.state('displayName')).toBe('New Fake Channel');
    });
});