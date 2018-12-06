// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import FileThumbnail from 'components/file_attachment/file_thumbnail.jsx';

describe('components/file_attachment/FileThumbnail', () => {
    const fileInfo = {
        id: 'thumbnail_id',
        extension: 'jpg',
        width: 100,
        height: 80,
        has_preview_image: true,
    };

    test('should match snapshot, small size image', () => {
        const wrapper = shallow(
            <FileThumbnail fileInfo={fileInfo}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, normal size image', () => {
        const newFileInfo = {...fileInfo, height: 150, width: 150};
        const wrapper = shallow(
            <FileThumbnail fileInfo={newFileInfo}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, svg', () => {
        const newFileInfo = {...fileInfo, extension: 'svg'};
        const wrapper = shallow(
            <FileThumbnail fileInfo={newFileInfo}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, pdf', () => {
        const newFileInfo = {...fileInfo, extension: 'pdf'};
        const wrapper = shallow(
            <FileThumbnail fileInfo={newFileInfo}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
