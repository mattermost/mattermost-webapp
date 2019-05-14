// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import MessageAttachmentList from 'components/post_view/message_attachments/message_attachment_list';
import PostImage from 'components/post_view/post_image';

import PostBodyAdditionalContent from './post_body_additional_content';

describe('PostBodyAdditionalContent', () => {
    const baseProps = {
        children: <span>{'some children'}</span>,
        post: {
            id: 'post_id_1',
            root_id: 'root_id',
            channel_id: 'channel_id',
            create_at: 1,
            message: '',
            metadata: {},
        },
        isEmbedVisible: true,
        actions: {
            toggleEmbedVisibility: jest.fn(),
        },
    };

    describe('with an image preview', () => {
        const imageUrl = 'https://example.com/image.png';

        const imageBaseProps = {
            ...baseProps,
            post: {
                ...baseProps.post,
                message: imageUrl,
                metadata: {
                    embeds: [{
                        type: 'image',
                        url: imageUrl,
                    }],
                    images: {
                        [imageUrl]: {},
                    },
                },
            },
        };

        test('should render correctly', () => {
            const wrapper = shallow(<PostBodyAdditionalContent {...imageBaseProps}/>);

            expect(wrapper).toMatchSnapshot();
            expect(wrapper.find(PostImage).prop('imageMetadata')).toBe(imageBaseProps.post.metadata.images[imageUrl]);
        });

        test('should render the toggle after a message containing more than just a link', () => {
            const props = {
                ...imageBaseProps,
                post: {
                    ...imageBaseProps.post,
                    message: 'This is an image: ' + imageUrl,
                },
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('with a message attachment', () => {
        test('should render correctly', () => {
            const props = {
                ...baseProps,
                post: {
                    ...baseProps.post,
                    metadata: {
                        embeds: [{
                            type: 'message_attachment',
                        }],
                    },
                    props: {
                        attachments: [],
                    },
                },
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);

            expect(wrapper).toMatchSnapshot();
            expect(wrapper.find(MessageAttachmentList).prop('attachments')).toBe(props.post.props.attachments);
        });
    });

    describe('with an opengraph preview', () => {
        const ogUrl = 'https://example.com/image.png';

        const ogBaseProps = {
            ...baseProps,
            post: {
                ...baseProps.post,
                message: ogUrl,
                metadata: {
                    embeds: [{
                        type: 'opengraph',
                        url: ogUrl,
                    }],
                },
            },
        };

        test('should render correctly', () => {
            const wrapper = shallow(<PostBodyAdditionalContent {...ogBaseProps}/>);

            expect(wrapper).toMatchSnapshot();
        });

        test('should render the toggle after a message containing more than just a link', () => {
            const props = {
                ...ogBaseProps,
                post: {
                    ...ogBaseProps.post,
                    message: 'This is a link: ' + ogUrl,
                },
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('with a YouTube video', () => {
        const youtubeUrl = 'https://www.youtube.com/watch?v=d-YO3v-wJts';

        const imageBaseProps = {
            ...baseProps,
            post: {
                ...baseProps.post,
                message: youtubeUrl,
                metadata: {
                    embeds: [{
                        type: 'opengraph',
                        url: youtubeUrl,
                    }],
                },
            },
        };

        test('should render correctly', () => {
            const wrapper = shallow(<PostBodyAdditionalContent {...imageBaseProps}/>);

            expect(wrapper).toMatchSnapshot();
        });

        test('should render the toggle after a message containing more than just a link', () => {
            const props = {
                ...imageBaseProps,
                post: {
                    ...imageBaseProps.post,
                    message: 'This is a video: ' + youtubeUrl,
                },
            };

            const wrapper = shallow(<PostBodyAdditionalContent {...props}/>);

            expect(wrapper).toMatchSnapshot();
        });
    });

    test('should call toggleEmbedVisibility with post id', () => {
        const wrapper = shallow(<PostBodyAdditionalContent {...baseProps}/>);

        wrapper.instance().toggleEmbedVisibility();

        expect(baseProps.actions.toggleEmbedVisibility).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.toggleEmbedVisibility).toBeCalledWith('post_id_1');
    });
});
