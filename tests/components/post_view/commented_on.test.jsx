// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import CommentedOn from 'components/post_view/commented_on/commented_on.jsx';
import CommentedOnFilesMessage from 'components/post_view/commented_on_files_message';

describe('components/post_view/CommentedOn', () => {
    const baseProps = {
        displayName: 'user_displayName',
        enablePostUsernameOverride: false,
        onCommentClick: jest.fn(),
        post: {
            id: 'post_id',
            message: 'text message',
            props: {
                from_webhook: true,
                override_username: 'override_username',
            },
        },
        actions: {
            showSearchResults: jest.fn(),
            updateSearchTerms: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<CommentedOn {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();

        wrapper.setProps({enablePostUsernameOverride: true});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(CommentedOnFilesMessage).exists()).toBe(false);

        const newPost = {
            id: 'post_id',
            message: '',
            file_ids: ['file_id_1', 'file_id_2'],
        };
        wrapper.setProps({post: newPost, enablePostUsernameOverride: false});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(CommentedOnFilesMessage).exists()).toBe(true);
    });

    test('should call onCommentClick on click of text message', () => {
        const wrapper = shallow(<CommentedOn {...baseProps}/>);

        wrapper.find('a').first().simulate('click');
        expect(baseProps.onCommentClick).toHaveBeenCalledTimes(1);
    });

    test('should call actions.updateSearchTerms and actions.showSearchResults on handleOnClick', () => {
        const wrapper = shallow(<CommentedOn {...baseProps}/>);

        wrapper.instance().handleOnClick();

        expect(baseProps.actions.updateSearchTerms).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.updateSearchTerms).toHaveBeenCalledWith(baseProps.displayName);

        expect(baseProps.actions.showSearchResults).toHaveBeenCalledTimes(1);
    });
});
