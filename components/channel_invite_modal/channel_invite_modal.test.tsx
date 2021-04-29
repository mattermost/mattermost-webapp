// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import {UserProfile} from 'mattermost-redux/types/users';
import {Channel} from 'mattermost-redux/types/channels';
import {RelationOneToOne} from 'mattermost-redux/types/utilities';

import {Value} from 'components/multiselect/multiselect';

import ChannelInviteModal from 'components/channel_invite_modal/channel_invite_modal';

type UserProfileValue = Value & UserProfile;

describe('components/channel_invite_modal', () => {
    const users = [{
        id: 'user-1',
        label: 'user-1',
        value: 'user-1',
        delete_at: 0,
    } as UserProfileValue, {
        id: 'user-2',
        label: 'user-2',
        value: 'user-2',
        delete_at: 0,
    } as UserProfileValue];

    const userStatuses = {
        'user-1': 'online',
        'user-2': 'offline',
    } as RelationOneToOne<UserProfile, string>;

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
    } as Channel;

    const baseProps = {
        channel,
        profilesNotInCurrentChannel: [],
        profilesNotInCurrentTeam: [],
        userStatuses: {},
        actions: {
            addUsersToChannel: jest.fn().mockImplementation(() => {
                const error = {
                    message: 'Failed',
                };

                return Promise.resolve({error});
            }),
            getProfilesNotInChannel: jest.fn().mockImplementation(() => Promise.resolve()),
            getTeamStats: jest.fn(),
            getUserStatuses: jest.fn().mockImplementation(() => Promise.resolve()),
            loadStatusesForProfilesList: jest.fn(),
            searchProfiles: jest.fn(),
        },
        onHide: jest.fn(),
    };

    test('should match snapshot for channel_invite_modal with profiles', () => {
        const wrapper = shallow(
            <ChannelInviteModal
                {...baseProps}
                profilesNotInCurrentChannel={users}
                profilesNotInCurrentTeam={[]}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with exclude and include users', () => {
        const wrapper = shallow(
            <ChannelInviteModal
                {...baseProps}
                profilesNotInCurrentChannel={users}
                profilesNotInCurrentTeam={[]}
                includeUsers={
                    {
                        'user-3': {
                            id: 'user-3',
                            label: 'user-3',
                            value: 'user-3',
                            delete_at: 0,
                        } as UserProfileValue,
                    }
                }
                excludeUsers={
                    {
                        'user-1': {
                            id: 'user-1',
                            label: 'user-1',
                            value: 'user-1',
                            delete_at: 0,
                        } as UserProfileValue,
                    }
                }
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for channel_invite_modal with userStatuses', () => {
        const wrapper = shallow(
            <ChannelInviteModal
                {...baseProps}
                profilesNotInCurrentChannel={users}
                userStatuses={userStatuses}
            />,
        );
        const instance = wrapper.instance() as ChannelInviteModal;
        expect(instance.renderOption(users[0], true, jest.fn(), jest.fn())).toMatchSnapshot();
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow<ChannelInviteModal>(
            <ChannelInviteModal {...baseProps}/>,
        );

        wrapper.setState({show: true});
        wrapper.instance().onHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called props.onHide when Modal.onExited is called', () => {
        const props = {...baseProps};
        const wrapper = shallow(
            <ChannelInviteModal {...props}/>,
        );

        wrapper.find(Modal).props().onExited!(document.createElement('div'));
        expect(props.onHide).toHaveBeenCalledTimes(1);
    });

    test('should fail to add users on handleSubmit', (done) => {
        const wrapper = shallow<ChannelInviteModal>(
            <ChannelInviteModal
                {...baseProps}
            />,
        );

        wrapper.setState({values: users, show: true});
        wrapper.instance().handleSubmit();
        expect(wrapper.state('saving')).toEqual(true);
        expect(wrapper.instance().props.actions.addUsersToChannel).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(wrapper.state('inviteError')).toEqual('Failed');
            expect(wrapper.state('saving')).toEqual(false);
            done();
        });
    });

    test('should add users on handleSubmit', (done) => {
        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                addUsersToChannel: jest.fn().mockImplementation(() => {
                    const data = true;
                    return Promise.resolve({data});
                }),
            },
        };

        const wrapper = shallow<ChannelInviteModal>(
            <ChannelInviteModal
                {...props}
            />,
        );

        wrapper.setState({values: users, show: true});
        wrapper.instance().handleSubmit();
        expect(wrapper.state('saving')).toEqual(true);
        expect(wrapper.instance().props.actions.addUsersToChannel).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(wrapper.state('inviteError')).toBeUndefined();
            expect(wrapper.state('saving')).toEqual(false);
            expect(wrapper.state('show')).toEqual(false);
            done();
        });
    });

    test('should call onAddCallback on handleSubmit with skipCommit', () => {
        const onAddCallback = jest.fn();
        const props = {
            ...baseProps,
            skipCommit: true,
            onAddCallback,
        };

        const wrapper = shallow<ChannelInviteModal>(
            <ChannelInviteModal
                {...props}
            />,
        );

        wrapper.setState({values: users, show: true});
        wrapper.instance().handleSubmit();
        expect(onAddCallback).toHaveBeenCalled();
        expect(wrapper.instance().props.actions.addUsersToChannel).toHaveBeenCalledTimes(0);
    });

    test('should trim the search term', () => {
        const wrapper = shallow<ChannelInviteModal>(
            <ChannelInviteModal {...baseProps}/>,
        );

        wrapper.instance().search(' something ');
        expect(wrapper.state('term')).toEqual('something');
    });
});
