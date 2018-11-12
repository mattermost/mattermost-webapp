// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ImagePreview from 'components/view_image/image_preview';

describe('components/view_image/ImagePreview', () => {
    test('should match snapshot, without preview', () => {
        const fileInfo = {
            id: 'file_id',
        };

        const wrapper = shallow(
            <ImagePreview
                fileInfo={fileInfo}
                canDownloadFiles={true}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with preview', () => {
        const fileInfo = {
            id: 'file_id_1',
            has_preview_image: true,
        };

        const wrapper = shallow(
            <ImagePreview
                fileInfo={fileInfo}
                canDownloadFiles={true}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, without preview, cannot download', () => {
        const fileInfo = {
            id: 'file_id',
        };

        const wrapper = shallow(
            <ImagePreview
                fileInfo={fileInfo}
                canDownloadFiles={false}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with preview, cannot download', () => {
        const fileInfo = {
            id: 'file_id_1',
            has_preview_image: true,
        };

        const wrapper = shallow(
            <ImagePreview
                fileInfo={fileInfo}
                canDownloadFiles={false}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });
});
