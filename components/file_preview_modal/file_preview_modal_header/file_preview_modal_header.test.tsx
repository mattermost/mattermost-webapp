// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {shallow} from 'enzyme';
import React from 'react';

import {Post} from '@mattermost/types/posts';
import {ZoomValue} from '../file_preview_modal_image_controls/file_preview_modal_image_controls';

import {TestHelper} from '../../../utils/test_helper';

import FilePreviewModalHeader from './file_preview_modal_header';

describe('components/file_preview_modal/file_preview_modal_header/FilePreviewModalHeader', () => {
    const defaultProps = {
        enablePublicLink: false,
        canDownloadFiles: true,
        fileURL: 'http://example.com/img.png',
        filename: 'img.png',
        fileInfo: TestHelper.getFileInfoMock({}),
        fileType: 'image',
        isMobileView: false,
        fileIndex: 1,
        totalFiles: 3,
        toolbarZoom: 'A' as ZoomValue,
        post: {} as Post,
        showPublicLink: false,
        isExternalFile: false,
        setToolbarZoom: jest.fn(),
        onGetPublicLink: jest.fn(),
        handlePrev: jest.fn(),
        handleNext: jest.fn(),
        handleModalClose: jest.fn(),
    };

    test('should match snapshot the desktop view', () => {
        const props = {
            ...defaultProps,
        };

        const wrapper = shallow(<FilePreviewModalHeader {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot the mobile view', () => {
        const props = {
            ...defaultProps,
            isMobileView: true,
        };

        const wrapper = shallow(<FilePreviewModalHeader {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with width zoom', () => {
        const props = {
            ...defaultProps,
            toolbarZoom: 'W' as ZoomValue,
        };

        const wrapper = shallow(<FilePreviewModalHeader {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with height zoom', () => {
        const props = {
            ...defaultProps,
            toolbarZoom: 'H' as ZoomValue,
        };

        const wrapper = shallow(<FilePreviewModalHeader {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with scale zoom', () => {
        const props = {
            ...defaultProps,
            toolbarZoom: 1.25 as ZoomValue,
        };

        const wrapper = shallow(<FilePreviewModalHeader {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with arbitrary zoom', () => {
        const props = {
            ...defaultProps,
            toolbarZoom: 1.33 as ZoomValue,
        };

        const wrapper = shallow(<FilePreviewModalHeader {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
