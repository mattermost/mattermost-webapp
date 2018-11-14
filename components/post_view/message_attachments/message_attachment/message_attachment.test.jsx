// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import MessageAttachment from 'components/post_view/message_attachments/message_attachment/message_attachment.jsx';
import {postListScrollChange} from 'actions/global_actions';

jest.mock('actions/global_actions.jsx', () => ({
    postListScrollChange: jest.fn(),
}));

describe('components/post_view/MessageAttachment', () => {
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
        actions: {doPostAction: jest.fn()},
        imagesMetadata: {
            image_url: {
                height: 200,
                width: 200,
            },
            thumb_url: {
                height: 200,
                width: 200,
            },
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<MessageAttachment {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state and have called postListScrollChange on handleImageHeightReceived', () => {
        const wrapper = shallow(<MessageAttachment {...baseProps}/>);
        const instance = wrapper.instance();
        instance.checkAttachmentTextOverflow = jest.fn();

        wrapper.setState({checkOverflow: 0});
        instance.handleHeightReceived(1);
        expect(postListScrollChange).toHaveBeenCalledTimes(1);
        expect(wrapper.state('checkOverflow')).toEqual(1);

        instance.handleHeightReceived(0);
        expect(postListScrollChange).toHaveBeenCalledTimes(1);
        expect(wrapper.state('checkOverflow')).toEqual(1);
    });

    test('should match value on getActionView', () => {
        let wrapper = shallow(<MessageAttachment {...baseProps}/>);
        expect(wrapper.instance().getActionView()).toMatchSnapshot();

        const newAttachment = {
            ...attachment,
            actions: [
                {id: 'action_id_1', name: 'action_name_1'},
                {id: 'action_id_2', name: 'action_name_2'},
                {id: 'action_id_3', name: 'action_name_3', type: 'select', data_source: 'users'},
            ],
        };

        const props = {...baseProps, attachment: newAttachment};

        wrapper = shallow(<MessageAttachment {...props}/>);
        expect(wrapper.instance().getActionView()).toMatchSnapshot();
    });

    test('should call actions.doPostAction on handleAction', () => {
        const doPostAction = jest.fn();
        const actionId = 'action_id_1';
        const newAttachment = {
            ...attachment,
            actions: [{id: actionId, name: 'action_name_1'}],
        };
        const props = {...baseProps, actions: {doPostAction}, attachment: newAttachment};
        const wrapper = shallow(<MessageAttachment {...props}/>);
        expect(wrapper).toMatchSnapshot();
        wrapper.instance().handleAction({
            preventDefault: () => {}, // eslint-disable-line no-empty-function
            currentTarget: {getAttribute: () => {
                return 'action_id_1';
            }},
        });

        expect(doPostAction).toHaveBeenCalledTimes(1);
        expect(doPostAction).toBeCalledWith(props.postId, actionId);
    });

    test('should match value on getFieldsTable', () => {
        let wrapper = shallow(<MessageAttachment {...baseProps}/>);
        expect(wrapper.instance().getFieldsTable()).toMatchSnapshot();

        const newAttachment = {
            ...attachment,
            fields: [
                {title: 'title_1', value: 'value_1', short: 'short_1'},
                {title: 'title_2', value: 'value_2', short: 'short_2'},
            ],
        };

        const props = {...baseProps, attachment: newAttachment};

        wrapper = shallow(<MessageAttachment {...props}/>);
        expect(wrapper.instance().getFieldsTable()).toMatchSnapshot();
    });
});
