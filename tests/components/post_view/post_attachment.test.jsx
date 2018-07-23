// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {doPostAction} from 'actions/post_actions.jsx';
import {postListScrollChange} from 'actions/global_actions';

import PostAttachment from 'components/post_view/post_attachment.jsx';

jest.mock('actions/post_actions.jsx', () => ({
    doPostAction: jest.fn(),
}));

jest.mock('actions/global_actions.jsx', () => ({
    postListScrollChange: jest.fn(),
}));

describe('components/post_view/PostAttachment', () => {
    const attachment = {
        pretext: 'pretext',
        author_name: 'author_name',
        author_icon: 'author_icon',
        author_link: 'author_link',
        title: 'title',
        title_link: 'title_link',
        text: 'short text',
        image_url: 'image_url',
        thumb_url: 'thumb_url',
        color: '#FFF',
    };

    const baseProps = {
        postId: 'post_id',
        attachment,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<PostAttachment {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should have called checkAttachmentTextOverflow on handleResize and on componentDidUpdate', () => {
        const wrapper = shallow(<PostAttachment {...baseProps}/>);
        const instance = wrapper.instance();
        instance.checkAttachmentTextOverflow = jest.fn();

        // on handleResize
        instance.handleResize();
        expect(instance.checkAttachmentTextOverflow).toHaveBeenCalledTimes(1);

        // on componentDidUpdate
        const newAttachment = {...attachment, text: 'new text'};
        wrapper.setProps({attachment: newAttachment});
        expect(instance.checkAttachmentTextOverflow).toHaveBeenCalledTimes(2);
    });

    test('should have called postListScrollChange and checkAttachmentTextOverflow on handleImageHeightReceived', () => {
        const wrapper = shallow(<PostAttachment {...baseProps}/>);
        const instance = wrapper.instance();
        instance.checkAttachmentTextOverflow = jest.fn();

        instance.handleImageHeightReceived();
        expect(instance.checkAttachmentTextOverflow).toHaveBeenCalledTimes(1);
        expect(postListScrollChange).toHaveBeenCalledTimes(1);
    });

    test('should match collapsed state on toggleCollapseState', () => {
        const wrapper = shallow(<PostAttachment {...baseProps}/>);

        wrapper.setState({collapsed: true});
        wrapper.instance().toggleCollapseState({preventDefault: () => {}}); // eslint-disable-line no-empty-function
        expect(wrapper.state('collapsed')).toEqual(false);

        wrapper.instance().toggleCollapseState({preventDefault: () => {}}); // eslint-disable-line no-empty-function
        expect(wrapper.state('collapsed')).toEqual(true);
    });

    test('should match value on getActionView', () => {
        let wrapper = shallow(<PostAttachment {...baseProps}/>);
        expect(wrapper.instance().getActionView()).toMatchSnapshot();

        const newAttachment = {
            ...attachment,
            actions: [
                {id: 'action_id_1', name: 'action_name_1'},
                {id: 'action_id_2', name: 'action_name_2'},
            ],
        };

        const props = {...baseProps, attachment: newAttachment};

        wrapper = shallow(<PostAttachment {...props}/>);
        expect(wrapper.instance().getActionView()).toMatchSnapshot();
    });

    test('should call PostActions.doPostAction on handleActionButtonClick', () => {
        const actionId = 'action_id_1';
        const newAttachment = {
            ...attachment,
            actions: [{id: actionId, name: 'action_name_1'}],
        };
        const props = {...baseProps, attachment: newAttachment};
        const wrapper = shallow(<PostAttachment {...props}/>);
        expect(wrapper).toMatchSnapshot();
        wrapper.instance().handleActionButtonClick({
            preventDefault: () => {}, // eslint-disable-line no-empty-function
            currentTarget: {getAttribute: () => {
                return 'action_id_1';
            }},
        });

        expect(doPostAction).toBeCalledWith(props.postId, actionId);
    });

    test('should match value on getFieldsTable', () => {
        let wrapper = shallow(<PostAttachment {...baseProps}/>);
        expect(wrapper.instance().getFieldsTable()).toMatchSnapshot();

        const newAttachment = {
            ...attachment,
            fields: [
                {title: 'title_1', value: 'value_1', short: 'short_1'},
                {title: 'title_2', value: 'value_2', short: 'short_2'},
            ],
        };

        const props = {...baseProps, attachment: newAttachment};

        wrapper = shallow(<PostAttachment {...props}/>);
        expect(wrapper.instance().getFieldsTable()).toMatchSnapshot();
    });
});
