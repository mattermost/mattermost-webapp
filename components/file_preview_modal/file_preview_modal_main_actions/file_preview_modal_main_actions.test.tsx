// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {shallow} from 'enzyme';
import React, {ComponentProps} from 'react';

import {Tooltip} from 'react-bootstrap';

import * as redux from 'react-redux';

import OverlayTrigger from 'components/overlay_trigger';

import {GlobalState} from '../../../types/store';

import {TestHelper} from '../../../utils/test_helper';

import FilePreviewModalMainActions from './file_preview_modal_main_actions';

const mockDispatch = jest.fn();
let mockState: GlobalState;
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux') as typeof import('react-redux'),
    useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
    useDispatch: () => mockDispatch,
}));

describe('components/file_preview_modal/file_preview_modal_main_actions/FilePreviewModalMainActions', () => {
    let defaultProps: ComponentProps<typeof FilePreviewModalMainActions>;
    beforeEach(() => {
        defaultProps = {
            fileInfo: TestHelper.getFileInfoMock({}),
            enablePublicLink: false,
            canDownloadFiles: true,
            fileURL: 'http://example.com/img.png',
            filename: 'img.png',
            handleModalClose: jest.fn(),
        };

        mockState = {
            entities: {
                general: {config: {}},
                users: {profiles: {}},
                channels: {channels: {}},
                preferences: {
                    myPreferences: {

                    },
                },
                files: {
                    filePublicLink: 'http://example.com/img.png',
                },
            },
        } as GlobalState;
    });

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
        const overlayWrapper = wrapper.find(OverlayTrigger).first();
        expect(overlayWrapper.prop('overlay').type).toEqual(Tooltip);
        expect(overlayWrapper.prop('children')).toMatchSnapshot();
    });

    test('should call public link callback', () => {
        const spy = jest.spyOn(redux, 'useSelector');
        const props = {
            ...defaultProps,
            enablePublicLink: true,
        };
        const wrapper = shallow(<FilePreviewModalMainActions {...props}/>);
        expect(wrapper.find(OverlayTrigger)).toHaveLength(3);
        const overlayWrapper = wrapper.find(OverlayTrigger).first().children('a');
        overlayWrapper.simulate('click');
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
