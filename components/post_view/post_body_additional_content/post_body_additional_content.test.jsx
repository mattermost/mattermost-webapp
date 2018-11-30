// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content/post_body_additional_content.jsx';

describe('components/post_view/PostBodyAdditionalContent', () => {
    const post = {
        id: 'post_id_1',
        root_id: 'root_id',
        channel_id: 'channel_id',
        create_at: 1,
        message: '',
    };
    const baseProps = {
        post,
        previewCollapsed: '',
        previewEnabled: false,
        isEmbedVisible: true,
        enableLinkPreviews: true,
        hasImageProxy: true,
        actions: {
            getRedirectLocation: jest.fn().mockResolvedValue({data: true}),
            toggleEmbedVisibility: jest.fn(),
        },
    };

    test('isLinkImage, should return true for valid image URLs', () => {
        const testCases = [
            {link: 'http://localhost/some_image1234.jpg', result: true},
            {link: 'http://localhost/some_image1234.JPG', result: true},
            {link: 'http://localhost/some_image1234.png?someURLParam=someValue', result: true},
            {link: 'http://localhost/some_image1234.PNG?someURLParam=someValue', result: true},
            {link: 'http://localhost/not_image', result: false},
            {link: 'http://localhost/not_jpg', result: false},
            {link: 'http://localhost/not_JPG', result: false},
        ];
        const wrapper = shallow(
            <PostBodyAdditionalContent {...baseProps}>
                <div/>
            </PostBodyAdditionalContent>
        );
        testCases.forEach((testCase) => {
            expect(wrapper.instance().isLinkImage(testCase.link)).toEqual(testCase.result);
        });
    });

    test('should call toggleEmbedVisibility with post id', () => {
        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                toggleEmbedVisibility: jest.fn(),
            },
        };

        const wrapper = shallow(
            <PostBodyAdditionalContent {...props}>
                <div/>
            </PostBodyAdditionalContent>
        );

        wrapper.instance().toggleEmbedVisibility();
        expect(props.actions.toggleEmbedVisibility).toHaveBeenCalledTimes(1);
        expect(props.actions.toggleEmbedVisibility).toBeCalledWith('post_id_1');
    });
});
