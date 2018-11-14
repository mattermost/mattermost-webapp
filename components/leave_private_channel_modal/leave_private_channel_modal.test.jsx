// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import LeavePrivateChannelModal from 'components/leave_private_channel_modal/leave_private_channel_modal.jsx';
import Constants from 'utils/constants';

describe('components/LeavePrivateChannelModal', () => {
    const channels = {
        'channel-1': {
            id: 'channel-1',
            name: 'test-channel-1',
            display_name: 'Test Channel 1',
            type: 'P',
            team_id: 'team-1',
        },
        'channel-2': {
            id: 'channel-2',
            name: 'test-channel-2',
            display_name: 'Test Channel 2',
            type: 'P',
            team_id: 'team-1',
        },
        'town-square': {
            id: 'town-square-id',
            name: 'town-square',
            display_name: 'Town Square',
            type: 'O',
            team_id: 'team-1',
        },
    };

    const baseProps = {
        actions: {
            leaveChannel: jest.fn(),
        },
    };

    test('should match snapshot, init', () => {
        const wrapper = shallowWithIntl(
            <LeavePrivateChannelModal
                {...baseProps}
            />
        ).dive({disableLifecycleMethods: true});

        expect(wrapper).toMatchSnapshot();
    });

    test('should show and hide the modal dialog', () => {
        const wrapper = shallowWithIntl(
            <LeavePrivateChannelModal
                {...baseProps}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.instance().handleToggle(channels['channel-2']);
        expect(wrapper.state('show')).toEqual(true);
        expect(wrapper.state('channel')).toHaveProperty('id', 'channel-2');

        wrapper.instance().handleHide();
        expect(wrapper.state('show')).toEqual(false);
        expect(wrapper.state('channel')).toBeNull();
    });

    test('should fail to leave channel', (done) => {
        const props = {
            actions: {
                leaveChannel: jest.fn().mockImplementation(() => {
                    const error = {
                        message: 'error leaving channel',
                    };

                    return Promise.resolve({error});
                }),
            },
        };
        const wrapper = shallowWithIntl(
            <LeavePrivateChannelModal
                {...props}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.setState({
            show: true,
            channel: channels['channel-2'],
        });

        const instance = wrapper.instance();
        instance.handleSubmit();
        expect(instance.props.actions.leaveChannel).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(wrapper.state('show')).toEqual(true);
            expect(wrapper.state('channel')).not.toBeNull();
            done();
        });
    });

    test('should leave channel when pressing the enter key browse to default channel', (done) => {
        const props = {
            actions: {
                leaveChannel: jest.fn().mockImplementation(() => {
                    const data = true;

                    return Promise.resolve({data});
                }),
            },
        };
        const wrapper = shallowWithIntl(
            <LeavePrivateChannelModal
                {...props}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.setState({
            show: true,
            channel: channels['channel-1'],
        });

        const instance = wrapper.instance();
        const enterKey = {
            preventDefault: jest.fn(),
            ctrlKey: false,
            key: Constants.KeyCodes.ENTER[0],
            keyCode: Constants.KeyCodes.ENTER[1],
        };

        instance.handleHide = jest.fn();
        instance.handleKeyPress(enterKey);
        expect(instance.props.actions.leaveChannel).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(instance.handleHide).toHaveBeenCalledTimes(1);
            done();
        });
    });
});
