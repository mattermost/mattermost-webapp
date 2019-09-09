// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import configureStore from 'redux-mock-store';
import {shallow} from 'enzyme';

import MarkdownImage from 'components/markdown_image.jsx';

describe('components/MarkdownImage', () => {
    const mockStore = configureStore();
    const initialState = {
        entities: {
            general: {
                config: {
                    DefaultClientLocale: 'en',
                },
            },
        },
    };
    const store = mockStore(initialState);
    it('should match snapsnot', () => {
        const imageMetadata = {format: 'jpg', frame_count: 0, width: 100, height: 100};
        const wrapper = shallow(
            <MarkdownImage
                imageMetadata={imageMetadata}
                src='path/image'
            />
        );

        const childrenWrapper = wrapper.dive({context: {store}}).props().children('safeSrc');

        expect(childrenWrapper).toMatchSnapshot();
    });
});
