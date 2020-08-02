// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants';

import ExternalImage from 'components/external_image';
import MessageAttachment from 'components/post_view/message_attachments/message_attachment/message_attachment.jsx';

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
        footer: 'footer',
        footer_icon: 'footer_icon',
    };

    const baseProps = {
        postId: 'post_id',
        attachment,
        currentRelativeTeamUrl: 'dummy_team',
        actions: {doPostActionWithCookie: jest.fn()},
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

    test('should change checkOverflow state on handleHeightReceived change', () => {
        const wrapper = shallow(<MessageAttachment {...baseProps}/>);
        const instance = wrapper.instance();
        instance.checkAttachmentTextOverflow = jest.fn();

        wrapper.setState({checkOverflow: 0});
        instance.handleHeightReceived(1);
        expect(wrapper.state('checkOverflow')).toEqual(1);

        instance.handleHeightReceived(0);
        expect(wrapper.state('checkOverflow')).toEqual(1);
    });

    test('should match value on renderPostActions', () => {
        let wrapper = shallow(<MessageAttachment {...baseProps}/>);
        expect(wrapper.instance().renderPostActions()).toMatchSnapshot();

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
        expect(wrapper.instance().renderPostActions()).toMatchSnapshot();
    });

    test('should call actions.doPostActionWithCookie on handleAction', () => {
        const promise = Promise.resolve(123);
        const doPostActionWithCookie = jest.fn(() => promise);
        const actionId = 'action_id_1';
        const newAttachment = {
            ...attachment,
            actions: [{id: actionId, name: 'action_name_1', cookie: 'cookie-contents'}],
        };
        const props = {...baseProps, actions: {doPostActionWithCookie}, attachment: newAttachment};
        const wrapper = shallow(<MessageAttachment {...props}/>);
        expect(wrapper).toMatchSnapshot();
        wrapper.instance().handleAction({
            preventDefault: () => {}, // eslint-disable-line no-empty-function
            currentTarget: {getAttribute: () => {
                return 'attr_some_value';
            }},
        });

        expect(doPostActionWithCookie).toHaveBeenCalledTimes(1);
        expect(doPostActionWithCookie).toBeCalledWith(props.postId, 'attr_some_value', 'attr_some_value');
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

    test('should use ExternalImage for images', () => {
        const props = {
            ...baseProps,
            attachment: {
                author_icon: 'http://example.com/author.png',
                image_url: 'http://example.com/image.png',
                thumb_url: 'http://example.com/thumb.png',

                // footer_icon is only rendered if footer is provided
                footer: attachment.footer,
                footer_icon: 'http://example.com/footer.png',
            },
        };

        const wrapper = shallow(<MessageAttachment {...props}/>);

        expect(wrapper.find(ExternalImage)).toHaveLength(4);
        expect(wrapper.find(ExternalImage).find({src: props.attachment.author_icon}).exists()).toBe(true);
        expect(wrapper.find(ExternalImage).find({src: props.attachment.image_url}).exists()).toBe(true);
        expect(wrapper.find(ExternalImage).find({src: props.attachment.footer_icon}).exists()).toBe(true);
        expect(wrapper.find(ExternalImage).find({src: props.attachment.thumb_url}).exists()).toBe(true);
    });

    test('should match snapshot when the attachment has an emoji in the title', () => {
        const props = {
            ...baseProps,
            attachment: {
                title: 'Do you like :pizza:?',
            },
        };

        const wrapper = shallow(<MessageAttachment {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when the attachment hasn\'t any emojis in the title', () => {
        const props = {
            ...baseProps,
            attachment: {
                title: 'Don\'t you like emojis?',
            },
        };

        const wrapper = shallow(<MessageAttachment {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when the attachment has a link in the title', () => {
        const props = {
            ...baseProps,
            attachment: {
                title: 'Do you like https://mattermost.com?',
            },
        };

        const wrapper = shallow(<MessageAttachment {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when no footer is provided (even if footer_icon is provided)', () => {
        const props = {
            ...baseProps,
            attachment: {
                ...attachment,
                footer: undefined,
            },
        };

        const wrapper = shallow(<MessageAttachment {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when the footer is truncated', () => {
        const props = {
            ...baseProps,
            attachment: {
                title: 'footer',
                footer: 'a'.repeat(Constants.MAX_ATTACHMENT_FOOTER_LENGTH + 1),
            },
        };

        const wrapper = shallow(<MessageAttachment {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });
});
