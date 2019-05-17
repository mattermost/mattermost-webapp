// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import {Client4} from 'mattermost-redux/client';

import PostAttachmentOpenGraph, {getBestImageUrl} from './post_attachment_opengraph';

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
        currentUserId: '1234',
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

describe('getBestImageUrl', () => {
    test('should return nothing with no OpenGraph metadata or dimensions', () => {
        const openGraphData = null;
        const imagesMetadata = null;

        expect(getBestImageUrl(openGraphData, imagesMetadata, false)).toEqual(null);
    });

    test('should return nothing with missing OpenGraph images', () => {
        const openGraphData = {};
        const imagesMetadata = null;

        expect(getBestImageUrl(openGraphData, imagesMetadata, false)).toEqual(null);
    });

    test('should return nothing with no OpenGraph images', () => {
        const openGraphData = {
            images: [],
        };
        const imagesMetadata = null;

        expect(getBestImageUrl(openGraphData, imagesMetadata, false)).toEqual(null);
    });

    test('should return secure_url if specified', () => {
        const openGraphData = {
            images: [{
                secure_url: 'https://example.com/image.png',
                url: 'http://example.com/image.png',
            }],
        };
        const imagesMetadata = null;

        expect(getBestImageUrl(openGraphData, imagesMetadata, false)).toEqual(openGraphData.images[0].secure_url);
    });

    test('should return url if secure_url is not specified', () => {
        const openGraphData = {
            images: [{
                secure_url: '',
                url: 'http://example.com/image.png',
            }],
        };
        const imagesMetadata = null;

        expect(getBestImageUrl(openGraphData, imagesMetadata, false)).toEqual(openGraphData.images[0].url);
    });

    test('should return a proxied image URL if the image proxy is enabled', () => {
        const openGraphData = {
            images: [{
                url: 'http://example.com/image.png',
            }],
        };
        const imagesMetadata = null;

        expect(getBestImageUrl(openGraphData, imagesMetadata, true).endsWith(`/api/v4/image?url=${encodeURIComponent(openGraphData.images[0].url)}`)).toEqual(true);
    });

    test('should not mangle a URL that is already proxied if the image proxy is enabled', () => {
        const openGraphData = {
            images: [{
                url: `${Client4.getBaseRoute()}/image?url=${encodeURIComponent('http://example.com/image.png')}`,
            }],
        };
        const imagesMetadata = null;

        expect(getBestImageUrl(openGraphData, imagesMetadata, true)).toEqual(openGraphData.images[0].url);
    });

    test('should pick the last image if no dimensions are specified', () => {
        const openGraphData = {
            images: [{
                url: 'http://example.com/image.png',
            }, {
                url: 'http://example.com/image2.png',
            }],
        };
        const imagesMetadata = null;

        expect(getBestImageUrl(openGraphData, imagesMetadata, false)).toEqual(openGraphData.images[1].url);
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
        const imagesMetadata = null;

        expect(getBestImageUrl(openGraphData, imagesMetadata, false)).toEqual(openGraphData.images[0].url);
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

        expect(getBestImageUrl(openGraphData, imagesMetadata, false)).toEqual(openGraphData.images[0].url);
    });
});
