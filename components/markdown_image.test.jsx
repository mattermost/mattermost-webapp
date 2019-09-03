// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import configureStore from 'redux-mock-store';
import {Provider} from 'react-redux';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

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
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <MarkdownImage
                    imagesMetadata={{format: 'jpg', frame_count: 0, width: 100, height: 100}}
                    src='path/image'
                />
            </Provider>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
