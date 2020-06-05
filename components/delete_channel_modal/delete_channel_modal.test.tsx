// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';
import {ChannelType} from 'mattermost-redux/types/channels';

import {browserHistory} from 'utils/browser_history';

import DeleteChannelModal from 'components/delete_channel_modal/delete_channel_modal';

describe('components/delete_channel_modal', () => {
    const channel = {
        id: 'owsyt8n43jfxjpzh9np93mx1wa',
        create_at: 1508265709607,
        update_at: 1508265709607,
        delete_at: 0,
        team_id: 'eatxocwc3bg9ffo9xyybnj4omr',
        type: 'O' as ChannelType,
        display_name: 'testing',
        name: 'testing',
        header: 'test',
        purpose: 'test',
        last_post_at: 1508265709635,
        total_msg_count: 0,
        extra_update_at: 1508265709628,
        creator_id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
        scheme_id: '',
        props: null,
        group_constrained: false,
    };

    const currentTeamDetails = {
        name: 'mattermostDev',
    };

    const baseProps = {
        channel,
        currentTeamDetails,
        actions: {
            deleteChannel: jest.fn(() => {
                return {data: true};
            }),
        },
        onHide: jest.fn(),
        penultimateViewedChannelName: 'my-prev-channel',
    };

    test('should match snapshot for delete_channel_modal', () => {
        const wrapper = shallow(
            <DeleteChannelModal {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow<DeleteChannelModal>(
            <DeleteChannelModal {...baseProps}/>,
        );

        wrapper.setState({show: true});
        wrapper.instance().onHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called actions.deleteChannel when handleDelete is called', () => {
        browserHistory.push = jest.fn();
        const actions = {deleteChannel: jest.fn()};
        const props = {...baseProps, actions};
        const wrapper = shallow<DeleteChannelModal>(
            <DeleteChannelModal {...props}/>,
        );

        wrapper.setState({show: true});
        wrapper.instance().handleDelete();

        expect(actions.deleteChannel).toHaveBeenCalledTimes(1);
        expect(actions.deleteChannel).toHaveBeenCalledWith(props.channel.id);
        expect(browserHistory.push).toHaveBeenCalledWith('/mattermostDev/channels/my-prev-channel');
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called props.onHide when Modal.onExited is called', () => {
        const props = {...baseProps};
        const wrapper = shallow(
            <DeleteChannelModal {...props}/>,
        );

        wrapper.find(Modal).props().onExited!(document.createElement('div'));
        expect(props.onHide).toHaveBeenCalledTimes(1);
    });
});
