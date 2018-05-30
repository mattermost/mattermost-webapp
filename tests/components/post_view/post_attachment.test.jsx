// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {doPostAction} from 'actions/post_actions.jsx';

import PostAttachment from 'components/post_view/post_attachment.jsx';

jest.mock('actions/post_actions.jsx', () => ({
    doPostAction: jest.fn(),
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

    test('should match collapsed state on toggleCollapseState', () => {
        const wrapper = shallow(<PostAttachment {...baseProps}/>);

        wrapper.setState({collapsed: true});
        wrapper.instance().toggleCollapseState({preventDefault: () => {}}); // eslint-disable-line no-empty-function
        expect(wrapper.state('collapsed')).toEqual(false);

        wrapper.instance().toggleCollapseState({preventDefault: () => {}}); // eslint-disable-line no-empty-function
        expect(wrapper.state('collapsed')).toEqual(true);
    });

    test('should match value on shouldCollapse', () => {
        const wrapper = shallow(<PostAttachment {...baseProps}/>);

        expect(wrapper.instance().shouldCollapse()).toEqual(false);

        let text = 'a'.repeat(701);
        wrapper.setProps({attachment: {text}});
        expect(wrapper.instance().shouldCollapse()).toEqual(true);

        text = 'a'.repeat(700);
        wrapper.setProps({attachment: {text}});
        expect(wrapper.instance().shouldCollapse()).toEqual(false);

        text = 'a\n'.repeat(5);
        wrapper.setProps({attachment: {text}});
        expect(wrapper.instance().shouldCollapse()).toEqual(true);

        text = 'a\n'.repeat(4);
        wrapper.setProps({attachment: {text}});
        expect(wrapper.instance().shouldCollapse()).toEqual(false);
    });

    test('getCollapsedText should return correct results', () => {
        const wrapper = shallow(<PostAttachment {...baseProps}/>);
        wrapper.setState({collapsed: true});

        let text = 'b'.repeat(30);
        wrapper.setProps({attachment: {text}});
        let actual = wrapper.instance().getCollapsedText();
        expect(actual).toBe(text);

        text = 'c'.repeat(701);
        wrapper.setProps({attachment: {text}});
        actual = wrapper.instance().getCollapsedText();
        expect(actual).toBe('c'.repeat(300));

        text = 'd\n'.repeat(5);
        wrapper.setProps({attachment: {text}});
        actual = wrapper.instance().getCollapsedText();
        expect(actual).toBe('d\nd\nd\nd\nd');
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
