// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChannelMembersDropdown from 'components/channel_members_dropdown/channel_members_dropdown.jsx';

describe('components/channel_members_dropdown', () => {
    const user = {
        id: 'user-1',
    };

    const channel = {
        create_at: 1508265709607,
        creator_id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
        delete_at: 0,
        display_name: 'testing',
        extra_update_at: 1508265709628,
        header: 'test',
        id: 'owsyt8n43jfxjpzh9np93mx1wa',
        last_post_at: 1508265709635,
        name: 'testing',
        purpose: 'test',
        team_id: 'eatxocwc3bg9ffo9xyybnj4omr',
        total_msg_count: 0,
        type: 'O',
        update_at: 1508265709607,
    };

    const baseProps = {
        channel,
        user,
        channelMember: {
            roles: 'channel_admin',
            scheme_admin: 'system_admin',
        },
        currentUserId: 'current-user-id',
        isLicensed: true,
        canChangeMemberRoles: false,
        canRemoveMember: true,
        index: 0,
        totalUsers: 10,
        actions: {
            removeChannelMember: jest.fn().mockImplementation(() => {
                const error = {
                    message: 'Failed',
                };

                return Promise.resolve({error});
            }),
            getChannelStats: jest.fn(),
            updateChannelMemberSchemeRoles: jest.fn(),
            getChannelMember: jest.fn(),
        },
    };

    test('should match snapshot for dropdown with guest user', () => {
        const props = {
            ...baseProps,
            user: {
                ...baseProps.user,
                roles: 'system_guest',
            },
            channelMember: {
                roles: 'channel_guest',
            },
            canChangeMemberRoles: true,
        };
        const wrapper = shallow(
            <ChannelMembersDropdown {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for not dropdown with guest user', () => {
        const props = {
            ...baseProps,
            user: {
                ...baseProps.user,
                roles: 'system_guest',
            },
            channelMember: {
                roles: 'channel_guest',
            },
            canChangeMemberRoles: false,
        };
        const wrapper = shallow(
            <ChannelMembersDropdown {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for channel_members_dropdown', () => {
        const wrapper = shallow(
            <ChannelMembersDropdown {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot opening dropdown upwards', () => {
        const wrapper = shallow(
            <ChannelMembersDropdown
                {...baseProps}
                index={4}
                totalUsers={5}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('If a removal is in progress do not execute another removal', () => {
        const wrapper = shallow(
            <ChannelMembersDropdown {...baseProps}/>,
        );

        wrapper.setState({removing: true});
        wrapper.instance().handleRemoveFromChannel();
        expect(wrapper.instance().props.actions.removeChannelMember).not.toBeCalled();
    });

    test('should fail to remove channel member', (done) => {
        const wrapper = shallow(
            <ChannelMembersDropdown {...baseProps}/>,
        );

        wrapper.instance().handleRemoveFromChannel();
        expect(wrapper.state('removing')).toEqual(true);
        expect(wrapper.instance().props.actions.removeChannelMember).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(wrapper.state('serverError')).toEqual('Failed');
            expect(wrapper.state('removing')).toEqual(false);
            done();
        });
    });

    test('should remove the channel member', (done) => {
        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                removeChannelMember: jest.fn().mockImplementation(() => {
                    const data = true;

                    return Promise.resolve({data});
                }),
            },
        };

        const wrapper = shallow(
            <ChannelMembersDropdown {...props}/>,
        );

        wrapper.instance().handleRemoveFromChannel();
        expect(wrapper.state('removing')).toEqual(true);
        expect(wrapper.instance().props.actions.removeChannelMember).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(wrapper.state('serverError')).toBeNull();
            expect(wrapper.state('removing')).toEqual(false);
            expect(wrapper.instance().props.actions.getChannelStats).toHaveBeenCalledTimes(1);
            expect(wrapper.instance().props.actions.getChannelStats).toHaveBeenCalledWith('owsyt8n43jfxjpzh9np93mx1wa');
            done();
        });
    });

    test('should match snapshot for group_constrained channel', () => {
        baseProps.channel.group_constrained = true;
        const wrapper = shallow(
            <ChannelMembersDropdown {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
