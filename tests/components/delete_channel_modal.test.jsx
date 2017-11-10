// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import DeleteChannelModal from 'components/delete_channel_modal/delete_channel_modal.jsx';

jest.mock('react-router', () => ({
    browserHistory: {
        push: jest.fn()
    }
}));

describe('components/delete_channel_modal', () => {
    test('should match snapshot for delete_channel_modal', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const wrapper = shallow(
            <DeleteChannelModal
                onHide={emptyFunction}
                currentTeamDetails={{
                    name: 'mattermostDev'
                }}
                channel={{
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
                    update_at: 1508265709607
                }}
                actions={{
                    deleteChannel: emptyFunction
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should call delete channel on keyDown', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const mockFunc = jest.fn();
        const wrapper = shallow(
            <DeleteChannelModal
                onHide={emptyFunction}
                currentTeamDetails={{
                    name: 'mattermostDev'
                }}
                channel={{
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
                    update_at: 1508265709607
                }}
                actions={{
                    deleteChannel: mockFunc
                }}
            />
        );
        wrapper.find(Modal).prop('onKeyDown')({keyCode: 13});
        expect(mockFunc).toHaveBeenCalled();
    });

    test('should not call delete channel on keyDown as id length !== defaultLength ', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const mockFunc = jest.fn();
        const wrapper = shallow(
            <DeleteChannelModal
                onHide={emptyFunction}
                currentTeamDetails={{
                    name: 'mattermostDev'
                }}
                channel={{
                    create_at: 1508265709607,
                    creator_id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
                    delete_at: 0,
                    display_name: 'testing',
                    extra_update_at: 1508265709628,
                    header: 'test',
                    id: 'owsyt8n43jfxjpzh9np93mx1w',
                    last_post_at: 1508265709635,
                    name: 'testing',
                    purpose: 'test',
                    team_id: 'eatxocwc3bg9ffo9xyybnj4omr',
                    total_msg_count: 0,
                    type: 'O',
                    update_at: 1508265709607
                }}
                actions={{
                    deleteChannel: mockFunc
                }}
            />
        );
        wrapper.find(Modal).prop('onKeyDown')({keyCode: 13});
        expect(mockFunc).not.toHaveBeenCalled();
    });
});
