// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import {browserHistory} from 'utils/browser_history';

import UndeleteChannelModal from './undelete_channel_modal';

describe('components/undelete_channel_modal', () => {
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
            undeleteChannel: emptyFunction,
        },
        onHide: emptyFunction,
        penultimateViewedChannelName: 'my-prev-channel',
    };

    test('should match snapshot for undelete_channel_modal', () => {
        const wrapper = shallow(
            <UndeleteChannelModal {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow(
            <UndeleteChannelModal {...baseProps}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().onHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called actions.undeleteChannel when handleUndelete is called', () => {
        browserHistory.push = jest.fn();
        const actions = {undeleteChannel: jest.fn()};
        const props = {...baseProps, actions};
        const wrapper = shallow(
            <UndeleteChannelModal {...props}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().handleUndelete();

        expect(actions.undeleteChannel).toHaveBeenCalledTimes(1);
        expect(actions.undeleteChannel).toHaveBeenCalledWith(props.channel.id);
    });

    test('should have called props.onHide when Modal.onExited is called', () => {
        const onHide = jest.fn();
        const props = {...baseProps, onHide};
        const wrapper = shallow(
            <UndeleteChannelModal {...props}/>
        );

        wrapper.find(Modal).props().onExited();
        expect(onHide).toHaveBeenCalledTimes(1);
    });
});
