// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import {browserHistory} from 'utils/browser_history';

import DeleteChannelModal from 'components/delete_channel_modal/delete_channel_modal.jsx';

describe('components/delete_channel_modal', () => {
    function emptyFunction() {} //eslint-disable-line no-empty-function

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

    const currentTeamDetails = {
        name: 'mattermostDev',
    };

    const baseProps = {
        channel,
        currentTeamDetails,
        actions: {
            deleteChannel: emptyFunction,
        },
        onHide: emptyFunction,
        penultimateViewedChannelName: 'my-prev-channel',
    };

    test('should match snapshot for delete_channel_modal', () => {
        const wrapper = shallow(
            <DeleteChannelModal {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow(
            <DeleteChannelModal {...baseProps}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().onHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called actions.deleteChannel when handleDelete is called', () => {
        browserHistory.push = jest.fn();
        const actions = {deleteChannel: jest.fn()};
        const props = {...baseProps, actions};
        const wrapper = shallow(
            <DeleteChannelModal {...props}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().handleDelete();

        expect(actions.deleteChannel).toHaveBeenCalledTimes(1);
        expect(actions.deleteChannel).toHaveBeenCalledWith(props.channel.id);
        expect(browserHistory.push).toHaveBeenCalledWith('/mattermostDev/channels/my-prev-channel');
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called props.onHide when Modal.onExited is called', () => {
        const onHide = jest.fn();
        const props = {...baseProps, onHide};
        const wrapper = shallow(
            <DeleteChannelModal {...props}/>
        );

        wrapper.find(Modal).props().onExited();
        expect(onHide).toHaveBeenCalledTimes(1);
    });
});
