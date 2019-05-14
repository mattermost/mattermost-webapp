// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PostAttachmentOpenGraph from './post_attachment_opengraph.jsx';

describe('components/post_view/PostAttachmentOpenGraph', () => {
    const post = {
        id: 'post_id_1',
        root_id: 'root_id',
        channel_id: 'channel_id',
        create_at: 1,
        message: 'https://mattermost.com',
        metadata: {
            images: {
                'http://mattermost.com/OpenGraphImage.jpg': {
                    height: 100,
                    width: 100,
                },
            },
        },
    };

    const baseProps = {
        post,
        link: 'http://mattermost.com',
        previewEnabled: true,
        isEmbedVisible: true,
        enableLinkPreviews: true,
        hasImageProxy: true,
        currentUser: {
            id: '1234',
        },
        openGraphData: {
            description: 'description',
            images: [{
                height: 100,
                secure_url: '',
                url: 'http://mattermost.com/OpenGraphImage.jpg',
                width: 100,
            }],
            site_name: 'Mattermost',
            title: 'Mattermost Private Cloud Messaging',
        },
        toggleEmbedVisibility: jest.fn(),
        actions: {
            editPost: jest.fn(),
        },
    };

    test('should render nothing without any data', () => {
        const props = {
            ...baseProps,
            openGraphData: null,
        };

        const wrapper = shallow(
            <PostAttachmentOpenGraph {...props}/>
        );

        expect(wrapper).toEqual({});
    });

    test('should render nothing when link previews are disabled on the server', () => {
        const props = {
            ...baseProps,
            enableLinkPreviews: false,
        };

        const wrapper = shallow(
            <PostAttachmentOpenGraph {...props}/>
        );

        expect(wrapper).toEqual({});
    });

    test('should render nothing when link previews are disabled by the user', () => {
        const props = {
            ...baseProps,
            previewEnabled: false,
        };

        const wrapper = shallow(
            <PostAttachmentOpenGraph {...props}/>
        );

        expect(wrapper).toEqual({});
    });

    test('Match snapshot for small image openGraphData', () => {
        const wrapper = shallow(
            <PostAttachmentOpenGraph {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('Match snapshot for large image openGraphData', () => {
        const props = {
            ...baseProps,
            openGraphData: {
                ...baseProps.openGraphData,
                images: [{
                    height: 180,
                    secure_url: '',
                    url: 'http://mattermost.com/OpenGraphImage.jpg',
                    width: 400,
                }],
            },
            post: {
                ...post,
                metadata: {
                    ...post.metadata,
                    images: {
                        'http://mattermost.com/OpenGraphImage.jpg': {
                            height: 180,
                            width: 400,
                        },
                    },
                },
            },
        };

        const wrapper = shallow(
            <PostAttachmentOpenGraph {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('Match snapshot for with remove preview', () => {
        const props = {
            ...baseProps,
            post: {
                ...post,
                user_id: '1234',
            },
        };

        const wrapper = shallow(
            <PostAttachmentOpenGraph {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
