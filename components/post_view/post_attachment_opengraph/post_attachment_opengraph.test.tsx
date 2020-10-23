// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import {OpenGraphMetadata, Post} from 'mattermost-redux/types/posts';

import ExternalImage from 'components/external_image';

import PostAttachmentOpenGraph, {getBestImageUrl} from './post_attachment_opengraph';

describe('PostAttachmentOpenGraph', () => {
    const imageUrl = 'http://mattermost.com/OpenGraphImage.jpg';
    const post = {
        id: 'post_id_1',
        root_id: 'root_id',
        channel_id: 'channel_id',
        create_at: 1,
        message: 'https://mattermost.com',
        metadata: {
            images: {
                [imageUrl]: {
                    height: 100,
                    width: 100,
                },
            },
        },
    } as unknown as Post;

    const baseProps = {
        post,
        postId: '',
        link: 'http://mattermost.com',
        previewEnabled: true,
        isEmbedVisible: true,
        enableLinkPreviews: true,
        currentUserId: '1234',
        openGraphData: {
            description: 'description',
            images: [{
                secure_url: '',
                url: imageUrl,
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
            openGraphData: undefined,
        };

        const wrapper = shallow(<PostAttachmentOpenGraph {...props}/>);

        expect(wrapper).toEqual({});
    });

    test('should render nothing when link previews are disabled on the server', () => {
        const props = {
            ...baseProps,
            enableLinkPreviews: false,
        };

        const wrapper = shallow(<PostAttachmentOpenGraph {...props}/>);

        expect(wrapper).toEqual({});
    });

    test('should render nothing when link previews are disabled by the user', () => {
        const props = {
            ...baseProps,
            previewEnabled: false,
        };

        const wrapper = shallow(<PostAttachmentOpenGraph {...props}/>);

        expect(wrapper).toEqual({});
    });

    describe('isLargeImage', () => {
        test('should be a large image', () => {
            const wrapper = shallow<PostAttachmentOpenGraph>(<PostAttachmentOpenGraph {...baseProps}/>);

            expect(wrapper.instance().isLargeImage({width: 400, height: 180})).toBe(true);
        });

        test('should not be a large image', () => {
            const wrapper = shallow<PostAttachmentOpenGraph>(<PostAttachmentOpenGraph {...baseProps}/>);

            expect(wrapper.instance().isLargeImage({width: 100, height: 100})).toBe(false);
        });
    });

    describe('image', () => {
        test('should use an ExternalImage for a small image', () => {
            const wrapper = shallow(<PostAttachmentOpenGraph {...baseProps}/>);

            expect(wrapper.find(ExternalImage).exists()).toBe(true);
            expect(wrapper.find('.post__embed-visibility').exists()).toBe(false);
        });

        test('should render with large image and toggle', () => {
            const props = {
                ...baseProps,
                post: {
                    ...post,
                    metadata: {
                        ...post.metadata,
                        images: {
                            [imageUrl]: {
                                height: 180,
                                width: 400,
                            },
                        },
                    },
                },
            };

            const wrapper = shallow(<PostAttachmentOpenGraph {...props}/>);

            expect(wrapper.find(ExternalImage).exists()).toBe(true);
            expect(wrapper.find('.post__embed-visibility').exists()).toBe(true);
        });
    });

    describe('remove preview button', () => {
        test('should not show button to remove preview for post made by another user', () => {
            const wrapper = shallow(<PostAttachmentOpenGraph {...baseProps}/>);

            expect(wrapper.find('.btn-close').exists()).toBe(false);
        });

        test('should show button to remove preview for post made by current user', () => {
            const props = {
                ...baseProps,
                post: {
                    ...post,
                    user_id: baseProps.currentUserId,
                },
            };

            const wrapper = shallow(<PostAttachmentOpenGraph {...props}/>);

            expect(wrapper.find('.btn-close').exists()).toBe(true);
        });
    });
});

describe('getBestImageUrl', () => {
    test('should return nothing with no OpenGraph metadata or dimensions', () => {
        expect(getBestImageUrl()).toBeFalsy();
    });

    test('should return nothing with missing OpenGraph images', () => {
        const openGraphData = {} as OpenGraphMetadata;

        expect(getBestImageUrl(openGraphData)).toBeFalsy();
    });

    test('should return nothing with no OpenGraph images', () => {
        const openGraphData = {
            images: [],
        };

        expect(getBestImageUrl(openGraphData)).toBeFalsy();
    });

    test('should return secure_url if specified', () => {
        const openGraphData = {
            images: [{
                secure_url: 'https://example.com/image.png',
                url: 'http://example.com/image.png',
            }],
        };

        expect(getBestImageUrl(openGraphData)).toEqual(openGraphData.images[0].secure_url);
    });

    test('should return url if secure_url is not specified', () => {
        const openGraphData = {
            images: [{
                secure_url: '',
                url: 'http://example.com/image.png',
            }],
        };

        expect(getBestImageUrl(openGraphData)).toEqual(openGraphData.images[0].url);
    });

    test('should pick the last image if no dimensions are specified', () => {
        const openGraphData = {
            images: [{
                url: 'http://example.com/image.png',
            }, {
                url: 'http://example.com/image2.png',
            }],
        };

        expect(getBestImageUrl(openGraphData)).toEqual(openGraphData.images[1].url);
    });

    test('should prefer images with dimensions closer to 80 by 80', () => {
        const openGraphData = {
            images: [{
                url: 'http://example.com/image.png',
                height: 100,
                width: 100,
            }, {
                url: 'http://example.com/image2.png',
                height: 1000,
                width: 1000,
            }],
        };

        expect(getBestImageUrl(openGraphData)).toEqual(openGraphData.images[0].url);
    });

    test('should use dimensions from post metadata if necessary', () => {
        const openGraphData = {
            images: [{
                url: 'http://example.com/image.png',
            }, {
                url: 'http://example.com/image2.png',
            }],
        };
        const imagesMetadata = {
            'http://example.com/image.png': {
                height: 100,
                width: 100,
            },
            'http://example.com/image2.png': {
                height: 1000,
                width: 1000,
            },
        };

        expect(getBestImageUrl(openGraphData, imagesMetadata)).toEqual(openGraphData.images[0].url);
    });
});
