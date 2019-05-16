// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import SizeAwareImage from 'components/size_aware_image';
import ViewImageModal from 'components/view_image';

import * as PostUtils from 'utils/post_utils.jsx';

import PostImage from './post_image';

describe('PostImage', () => {
    const baseProps = {
        hasImageProxy: false,
        imageMetadata: {
            format: 'png',
            height: 400,
            width: 300,
        },
        link: 'https://example.com/image.png',
        post: {},
    };

    test('all image URLs should go through the image proxy when enabled', () => {
        const props = {
            ...baseProps,
            hasImageProxy: true,
        };

        const wrapper = shallow(<PostImage {...props}/>);

        const expectedLink = PostUtils.getImageSrc(props.link, true);

        expect(wrapper.find(SizeAwareImage).prop('src')).toBe(expectedLink);
        expect(wrapper.find(ViewImageModal).prop('fileInfos')).toMatchObject([{
            link: expectedLink,
        }]);
    });
});
