// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import {browserHistory} from 'utils/browser_history';

import DeletePostModal from 'components/delete_post_modal/delete_post_modal.jsx';

jest.mock('utils/browser_history', () => ({
    browserHistory: {
        replace: jest.fn(),
    },
}));

describe('components/delete_post_modal', () => {
    const post = {
        id: '123',
        message: 'test',
        channel_id: '5',
        type: '',
        root_id: '',
    };

    const baseProps = {
        post,
        commentCount: 0,
        isRHS: false,
        actions: {
            deleteAndRemovePost: jest.fn(),
        },
        onHide: jest.fn(),
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

    test('should match snapshot for post with 1 commentCount and is not rootPost', () => {
        const commentCount = 1;
        const postObj = {
            ...post,
            root_id: '1234',
        };

        const props = {
            ...baseProps,
            commentCount,
            post: postObj,
        };

        const wrapper = shallow(
            <DeletePostModal {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should focus delete button on enter', () => {
        const wrapper = shallow(
            <DeletePostModal {...baseProps}/>
        );

        const deletePostBtn = {focus: jest.fn()};
        wrapper.instance().deletePostBtn = deletePostBtn;

        wrapper.instance().handleEntered();
        expect(deletePostBtn.focus).toHaveBeenCalled();
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow(
            <DeletePostModal {...baseProps}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().onHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should match state when the cancel button is clicked', () => {
        const wrapper = shallow(
            <DeletePostModal {...baseProps}/>
        );

        wrapper.setState({show: true});
        wrapper.find('button').at(0).simulate('click');
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called actions.deleteAndRemovePost when handleDelete is called', async () => {
        const deleteAndRemovePost = jest.fn().mockReturnValueOnce({data: true});
        const props = {
            ...baseProps,
            actions: {
                deleteAndRemovePost,
            },
            location: {
                pathname: '/teamname/messages/@username'
            }
        };
        const wrapper = shallow(
            <DeletePostModal {...props}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().handleDelete();

        await expect(deleteAndRemovePost).toHaveBeenCalledTimes(1);
        expect(deleteAndRemovePost).toHaveBeenCalledWith(props.post);
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called browserHistory.replace when permalink post is deleted for DM/GM', async () => {
        const deleteAndRemovePost = jest.fn().mockReturnValueOnce({data: true});
        const props = {
            ...baseProps,
            actions: {
                deleteAndRemovePost,
            },
            location: {
                pathname: '/teamname/messages/@username/123'
            }
        };

        const wrapper = shallow(
            <DeletePostModal {...props}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().handleDelete();
        await expect(deleteAndRemovePost).toHaveBeenCalledTimes(1);
        expect(browserHistory.replace).toHaveBeenCalledWith('/teamname/messages/@username');
    });

    test('should have called browserHistory.replace when permalink post is deleted for a channel', async () => {
        const deleteAndRemovePost = jest.fn().mockReturnValueOnce({data: true});
        const props = {
            ...baseProps,
            actions: {
                deleteAndRemovePost,
            },
            location: {
                pathname: '/teamname/channels/channelName/123'
            }
        };

        const wrapper = shallow(
            <DeletePostModal {...props}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().handleDelete();
        await expect(deleteAndRemovePost).toHaveBeenCalledTimes(1);
        expect(browserHistory.replace).toHaveBeenCalledWith('/teamname/channels/channelName');
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
