// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

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
        onHide: jest.fn(),
        show: false,
        channel: channels['channel-1'],
        actions: {
            leaveChannel: jest.fn(),
        },
    };

    test('should match snapshot, init', () => {
        const wrapper = shallow(
            <LeavePrivateChannelModal
                {...baseProps}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should fail to leave channel', (done) => {
        const props = {
            ...baseProps,
            show: true,
            channel: channels['channel-2'],
            actions: {
                leaveChannel: jest.fn().mockImplementation(() => {
                    const error = {
                        message: 'error leaving channel',
                    };

                    return Promise.resolve({error});
                }),
            },
        };
        const wrapper = shallow(
            <LeavePrivateChannelModal {...props}/>
        );

        const instance = wrapper.instance();
        instance.handleSubmit();
        expect(instance.props.actions.leaveChannel).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(instance.props.onHide).toHaveBeenCalledTimes(0);
            done();
        });
    });

    test('should leave channel when pressing the enter key browse to default channel', (done) => {
        const props = {
            ...baseProps,
            show: true,
            channel: channels['channel-1'],
            actions: {
                leaveChannel: jest.fn().mockImplementation(() => {
                    const data = true;

                    return Promise.resolve({data});
                }),
            },
        };
        const wrapper = shallow(
            <LeavePrivateChannelModal {...props}/>
        );

        const instance = wrapper.instance();
        const enterKey = {
            preventDefault: jest.fn(),
            ctrlKey: false,
            key: Constants.KeyCodes.ENTER[0],
            keyCode: Constants.KeyCodes.ENTER[1],
        };

        instance.handleKeyPress(enterKey);
        expect(instance.props.actions.leaveChannel).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(instance.props.onHide).toHaveBeenCalledTimes(1);
            done();
        });
    });
});
