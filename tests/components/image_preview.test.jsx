// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ImagePreview from 'components/image_preview';

describe('components/ImagePreview', () => {
    test('should match snapshot, with and without preview', () => {
        const fileInfo = {
            id: 'file_id'
        };

        const wrapper = shallow(
            <ImagePreview fileInfo={fileInfo}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('a').prop('href')).toBe('/api/v4/files/file_id');
        expect(wrapper.find('img').prop('src')).toBe('/api/v4/files/file_id');

        fileInfo.id = 'file_id_1';
        fileInfo.has_preview_image = true;
        wrapper.setProps({fileInfo});

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('a').prop('href')).toBe('/api/v4/files/file_id_1');
        expect(wrapper.find('img').prop('src')).toBe('/api/v4/files/file_id_1/preview');
    });
});
