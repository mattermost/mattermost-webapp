// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {shallow} from 'enzyme';
import React from 'react';

import FilePreviewModalImageControls, {ZoomValue} from './file_preview_modal_image_controls';

describe('components/file_preview_modal/file_preview_modal_image_controls/FilePreviewModalImageControls', () => {
    const defaultProps = {
        toolbarZoom: 'A' as ZoomValue,
        setToolbarZoom: jest.fn(),
    };

    test('should have called setToolbarZoom zoom in button click', () => {
        const setToolbarZoom = jest.fn();
        const toolbarZoom = 1.5;
        const props = {...defaultProps, setToolbarZoom, toolbarZoom};
        const wrapper = shallow(
            <FilePreviewModalImageControls {...props}/>,
        );

        wrapper.find('#zoomInButton').simulate('click');
        expect(setToolbarZoom).toHaveBeenCalled();
        expect(setToolbarZoom).toHaveBeenCalledWith(1.6);
    });

    test('should have called setToolbarZoom zoom out button click', () => {
        const setToolbarZoom = jest.fn();
        const toolbarZoom = 1.5;
        const props = {...defaultProps, setToolbarZoom, toolbarZoom};
        const wrapper = shallow(
            <FilePreviewModalImageControls {...props}/>,
        );

        wrapper.find('#zoomOutButton').simulate('click');
        expect(setToolbarZoom).toHaveBeenCalled();
        expect(setToolbarZoom).toHaveBeenCalledWith(1.4);
    });
});
