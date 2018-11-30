// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import ChannelInviteModal from 'components/channel_invite_modal/channel_invite_modal.jsx';

describe('components/channel_invite_modal', () => {
    const event = {
        preventDefault: jest.fn(),
    };

    const users = [{
        id: 'user-1',
    }, {
        id: 'user-2',
    }];

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
        profilesNotInCurrentChannel: [],
        actions: {
            addUsersToChannel: jest.fn().mockImplementation(() => {
                const error = {
                    message: 'Failed',
                };

                return Promise.resolve({error});
            }),
            getProfilesNotInChannel: jest.fn().mockImplementation(() => Promise.resolve()),
            getTeamStats: jest.fn(),
        },
        onHide: jest.fn(),
    };

    test('should match snapshot for channel_invite_modal', () => {
        const wrapper = shallow(
            <ChannelInviteModal {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow(
            <ChannelInviteModal {...baseProps}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().onHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called props.onHide when Modal.onExited is called', () => {
        const wrapper = shallow(
            <ChannelInviteModal {...baseProps}/>
        );

        wrapper.find(Modal).props().onExited();
        expect(wrapper.instance().props.onHide).toHaveBeenCalledTimes(1);
    });

    test('should fail to add users on handleSubmit', (done) => {
        const wrapper = shallow(
            <ChannelInviteModal
                {...baseProps}
            />
        );

        wrapper.setState({values: users, show: true});
        wrapper.instance().handleSubmit(event);
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

        const wrapper = shallow(
            <ChannelInviteModal
                {...props}
            />
        );

        wrapper.setState({values: users, show: true});
        wrapper.instance().handleSubmit(event);
        expect(wrapper.state('saving')).toEqual(true);
        expect(wrapper.instance().props.actions.addUsersToChannel).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(wrapper.state('inviteError')).toBeNull();
            expect(wrapper.state('saving')).toEqual(false);
            expect(wrapper.state('show')).toEqual(false);
            done();
        });
    });
});
