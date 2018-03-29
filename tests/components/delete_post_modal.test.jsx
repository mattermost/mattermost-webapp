// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import {browserHistory} from 'utils/browser_history';

import DeletePostModal from 'components/delete_post_modal/delete_post_modal.jsx';

describe('components/delete_post_modal', () => {
    function emptyFunction() {} //eslint-disable-line no-empty-function

    const post = {
        id: '123',
        message: 'test',
        channel_id: '5',
    };

    const baseProps = {
        post,
        commentCount: 0,
        isRHS: false,
        actions: {
            deletePost: emptyFunction,
        },
        onHide: emptyFunction,
    };

    test('should match snapshot for delete_post_modal with 0 comments', () => {
        const wrapper = shallow(
            <DeletePostModal {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for delete_post_modal with 1 comment', () => {
        const commentCount = 1;
        const props = {...baseProps, commentCount};
        const wrapper = shallow(
            <DeletePostModal {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow(
            <DeletePostModal {...baseProps}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().onHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called actions.deleteAndRemovePost when handleDelete is called', async () => {
        browserHistory.push = jest.fn();
        const actions = {deleteAndRemovePost: jest.fn()};
        actions.deleteAndRemovePost.mockReturnValueOnce({data: true});
        const props = {...baseProps, actions};
        const wrapper = shallow(
            <DeletePostModal {...props}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().handleDelete();

        await expect(actions.deleteAndRemovePost).toHaveBeenCalledTimes(1);
        expect(actions.deleteAndRemovePost).toHaveBeenCalledWith(props.post);
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should call browserHistory.push on handleDelete with post.id === focusedPostId && channelName', async () => {
        browserHistory.push = jest.fn();
        const actions = {deleteAndRemovePost: jest.fn()};
        actions.deleteAndRemovePost.mockReturnValueOnce({data: true});
        const props = {...baseProps, actions, focusedPostId: '123', channelName: 'channel_name', teamName: 'team_name'};
        const wrapper = shallow(
            <DeletePostModal {...props}/>
        );

        await wrapper.instance().handleDelete();
        expect(browserHistory.push).toHaveBeenCalledTimes(1);
        expect(browserHistory.push).toHaveBeenCalledWith('/team_name/channels/channel_name');
    });

    test('should have called props.onHide when Modal.onExited is called', () => {
        const onHide = jest.fn();
        const props = {...baseProps, onHide};
        const wrapper = shallow(
            <DeletePostModal {...props}/>
        );

        wrapper.find(Modal).props().onExited();
        expect(onHide).toHaveBeenCalledTimes(1);
    });
});
