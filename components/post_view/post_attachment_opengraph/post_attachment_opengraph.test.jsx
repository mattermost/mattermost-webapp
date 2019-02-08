// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';

import PostAttachmentOpenGraph from './post_attachment_opengraph';

describe('PostAttachmentOpenGraph', () => {
    describe('getBestImageUrl', () => {
        test('should return nothing with no OpenGraph metadata', () => {
            const data = null;

            expect(PostAttachmentOpenGraph.getBestImageUrl(data, false)).toEqual(null);
        });

        test('should return nothing with missing OpenGraph images', () => {
            const data = {};

            expect(PostAttachmentOpenGraph.getBestImageUrl(data, false)).toEqual(null);
        });

        test('should return nothing with no OpenGraph images', () => {
            const data = {
                images: [],
            };

            expect(PostAttachmentOpenGraph.getBestImageUrl(data, false)).toEqual(null);
        });

        test('should return secure_url if specified', () => {
            const data = {
                images: [{
                    secure_url: 'https://example.com/image.png',
                    url: 'http://example.com/image.png',
                }],
            };

            expect(PostAttachmentOpenGraph.getBestImageUrl(data, false)).toEqual(data.images[0].secure_url);
        });

        test('should return url if secure_url is not specified', () => {
            const data = {
                images: [{
                    secure_url: '',
                    url: 'http://example.com/image.png',
                }],
            };

            expect(PostAttachmentOpenGraph.getBestImageUrl(data, false)).toEqual(data.images[0].url);
        });

        test('should return a proxied image URL if the image proxy is enabled', () => {
            const data = {
                images: [{
                    url: 'http://example.com/image.png',
                }],
            };

            expect(PostAttachmentOpenGraph.getBestImageUrl(data, true).endsWith(`/api/v4/image?url=${encodeURIComponent(data.images[0].url)}`)).toEqual(true);
        });

        test('should not mangle a URL that is already proxied if the image proxy is enabled', () => {
            const data = {
                images: [{
                    url: `${Client4.getBaseRoute()}/image?url=${encodeURIComponent('http://example.com/image.png')}`,
                }],
            };

            expect(PostAttachmentOpenGraph.getBestImageUrl(data, true)).toEqual(data.images[0].url);
        });
    });
});
