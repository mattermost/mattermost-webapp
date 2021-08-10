// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {shallow} from 'enzyme';
import React from 'react';

import FilePreviewModalMainActions from './file_preview_modal_main_actions';

describe('components/file_preview_modal/file_preview_modal_main_actions/FilePreviewModalMainActions', () => {
    const defaultProps = {
        enablePublicLink: false,
        canDownloadFiles: true,
        fileURL: 'http://example.com/img.png',
        filename: 'img.png',
        handleModalClose: jest.fn(),
    };

    test('should match snapshot with public links disabled', () => {
        const props = {
            ...defaultProps,
            enablePublicLink: false,
        };

        const wrapper = shallow(<FilePreviewModalMainActions {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with public links enabled', () => {
        const props = {
            ...defaultProps,
            enablePublicLink: true,
        };

        const wrapper = shallow(<FilePreviewModalMainActions {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should call public link callback', () => {
        const mockOnClick = jest.fn();
        const props = {
            ...defaultProps,
            enablePublicLink: true,
            onGetPublicLink: mockOnClick,
        };

        const wrapper = shallow(<FilePreviewModalMainActions {...props}/>);
        wrapper.find('a.public-link').first().simulate('click');
        expect(mockOnClick).toHaveBeenCalled();
    });
});
