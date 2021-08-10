// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {shallow} from 'enzyme';
import React from 'react';

import FilePreviewModalFooter from './file_preview_modal_footer';

describe('components/file_preview_modal/file_preview_modal_footer/FilePreviewModalFooter', () => {
    const defaultProps = {
        enablePublicLink: false,
        canDownloadFiles: true,
        fileURL: 'http://example.com/img.png',
        filename: 'img.png',
        isMobile: false,
        fileIndex: 1,
        totalFiles: 3,
        post: {},
        showPublicLink: false,
        isExternalFile: false,
        onGetPublicLink: jest.fn(),
        handlePrev: jest.fn(),
        handleNext: jest.fn(),
        handleModalClose: jest.fn(),
    };

    test('should match snapshot the desktop view', () => {
        const props = {
            ...defaultProps,
        };

        const wrapper = shallow(<FilePreviewModalFooter {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot the mobile view', () => {
        const props = {
            ...defaultProps,
            isMobile: true,
        };

        const wrapper = shallow(<FilePreviewModalFooter {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
