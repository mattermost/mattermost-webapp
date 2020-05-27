// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import {ChannelType} from 'mattermost-redux/types/channels';

import LeavePrivateChannelModal from 'components/leave_private_channel_modal/leave_private_channel_modal';

describe('components/LeavePrivateChannelModal', () => {
    const channels = {
        'channel-1': {
            id: 'channel-1',
            name: 'test-channel-1',
            display_name: 'Test Channel 1',
            type: ('P' as ChannelType),
            team_id: 'team-1',
            header: '',
            purpose: '',
            creator_id: '',
            scheme_id: '',
            group_constrained: false,
            create_at: 0,
            update_at: 0,
            delete_at: 0,
            last_post_at: 0,
            total_msg_count: 0,
            extra_update_at: 0,
        },
        'channel-2': {
            id: 'channel-2',
            name: 'test-channel-2',
            display_name: 'Test Channel 2',
            team_id: 'team-1',
            type: ('P' as ChannelType),
            header: '',
            purpose: '',
            creator_id: '',
            scheme_id: '',
            group_constrained: false,
            create_at: 0,
            update_at: 0,
            delete_at: 0,
            last_post_at: 0,
            total_msg_count: 0,
            extra_update_at: 0,
        },
        'town-square': {
            id: 'town-square-id',
            name: 'town-square',
            display_name: 'Town Square',
            type: ('O' as ChannelType),
            team_id: 'team-1',
            header: '',
            purpose: '',
            creator_id: '',
            scheme_id: '',
            group_constrained: false,
            create_at: 0,
            update_at: 0,
            delete_at: 0,
            last_post_at: 0,
            total_msg_count: 0,
            extra_update_at: 0,
        },
    };

    const baseProps = {
        actions: {
            leaveChannel: jest.fn(),
        },
    };

    test('should match snapshot, init', () => {
        const wrapper = shallow(
            <LeavePrivateChannelModal
                {...baseProps}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should show and hide the modal dialog', () => {
        const wrapper = shallow<LeavePrivateChannelModal>(
            <LeavePrivateChannelModal
                {...baseProps}
            />,
        );

        wrapper.instance().handleToggle(channels['channel-2']);
        expect(wrapper.state('show')).toEqual(true);
        expect(wrapper.state('channel')).toHaveProperty('id', 'channel-2');

        wrapper.instance().handleHide();
        expect(wrapper.state('show')).toEqual(false);
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
        const wrapper = shallow<LeavePrivateChannelModal>(
            <LeavePrivateChannelModal
                {...props}
            />,
        );

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
        const wrapper = shallow<LeavePrivateChannelModal>(
            <LeavePrivateChannelModal
                {...props}
            />,
        );

        wrapper.setState({
            show: true,
            channel: channels['channel-1'],
        });

        const instance = wrapper.instance();
        const enterKey = new KeyboardEvent('keydown', {key: 'Enter'});

        instance.handleHide = jest.fn();
        instance.handleKeyPress(enterKey);
        expect(instance.props.actions.leaveChannel).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(instance.handleHide).toHaveBeenCalledTimes(1);
            done();
        });
    });
});
