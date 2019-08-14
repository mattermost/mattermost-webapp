// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PostAttachmentOpenGraph from './post_attachment_opengraph';

describe('PostAttachmentOpenGraph', () => {
    describe('getBestImageUrl', () => {
        test('should return nothing with no OpenGraph metadata', () => {
            const data = null;

            expect(PostAttachmentOpenGraph.getBestImageUrl(data)).toEqual(null);
        });

        test('should return nothing with missing OpenGraph images', () => {
            const data = {};

            expect(PostAttachmentOpenGraph.getBestImageUrl(data)).toEqual(null);
        });

        test('should return nothing with no OpenGraph images', () => {
            const data = {
                images: [],
            };

            expect(PostAttachmentOpenGraph.getBestImageUrl(data)).toEqual(null);
        });

        test('should return secure_url if specified', () => {
            const data = {
                images: [{
                    secure_url: 'https://example.com/image.png',
                    url: 'http://example.com/image.png',
                }],
            };

            expect(PostAttachmentOpenGraph.getBestImageUrl(data)).toEqual(data.images[0].secure_url);
        });

        test('should return url if secure_url is not specified', () => {
            const data = {
                images: [{
                    secure_url: '',
                    url: 'http://example.com/image.png',
                }],
            };

            expect(PostAttachmentOpenGraph.getBestImageUrl(data)).toEqual(data.images[0].url);
        });
    });
});
