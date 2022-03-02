// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';

import React from 'react';

import {Post, PostEmbed} from 'mattermost-redux/types/posts';
import {UserProfile} from 'mattermost-redux/types/users';

import PostMessagePreview, {Props} from './post_message_preview';

describe('PostMessagePreview', () => {
    const previewPost = {
        id: 'post_id',
        message: 'post message',
        metadata: {},
    } as Post;

    const user = {
        id: 'user_1',
        username: 'username1',
    } as UserProfile;

    const baseProps: Props = {
        metadata: {
            channel_display_name: 'channel name',
            team_name: 'team1',
            post_id: 'post_id',
        },
        previewPost,
        user,
        hasImageProxy: false,
        enablePostIconOverride: false,
        isEmbedVisible: true,
        compactDisplay: false,
        handleFileDropdownOpened: jest.fn(),
        actions: {
            toggleEmbedVisibility: jest.fn(),
        },
    };

    test('should render correctly', () => {
        const wrapper = shallow(<PostMessagePreview {...baseProps}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should render without preview', () => {
        const wrapper = shallow(
            <PostMessagePreview
                {...baseProps}
                previewPost={undefined}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should not render bot icon', () => {
        const postProps = {
            override_icon_url: 'https://fakeicon.com/image.jpg',
            use_user_icon: 'false',
            from_webhook: 'false',
        };

        const postPreview = {
            ...previewPost,
            props: postProps,
        } as unknown as Post;

        const props = {
            ...baseProps,
            previewPost: postPreview,
        };
        const wrapper = shallow(
            <PostMessagePreview
                {...props}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should render bot icon', () => {
        const postProps = {
            override_icon_url: 'https://fakeicon.com/image.jpg',
            use_user_icon: false,
            from_webhook: 'true',
        };

        const postPreview = {
            ...previewPost,
            props: postProps,
        } as unknown as Post;

        const props = {
            ...baseProps,
            previewPost: postPreview,
            enablePostIconOverride: true,
        };
        const wrapper = shallow(
            <PostMessagePreview
                {...props}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    describe('nested previews', () => {
        const files = {
            file_ids: [
                'file_1',
                'file_2',
            ],
        };

        const opengraphMetadata = {
            type: 'opengraph',
            url: 'https://example.com',
        } as PostEmbed;

        test('should render opengraph preview', () => {
            const postPreview = {
                ...previewPost,
                metadata: {
                    embeds: [opengraphMetadata],
                },
            } as Post;

            const props = {
                ...baseProps,
                previewPost: postPreview,
            };

            const wrapper = shallow(<PostMessagePreview {...props}/>);

            expect(wrapper).toMatchSnapshot();
        });

        test('should render file preview', () => {
            const postPreview = {
                ...previewPost,
                ...files,
            } as Post;

            const props = {
                ...baseProps,
                previewPost: postPreview,
            };

            const wrapper = shallow(<PostMessagePreview {...props}/>);

            expect(wrapper).toMatchSnapshot();
        });
    });
});
