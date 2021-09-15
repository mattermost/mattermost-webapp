// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';
import {createIntl, useIntl} from 'react-intl';

import FileUploadOverlay from 'components/file_upload_overlay';

jest.mock('react-intl', () => ({
    ...jest.requireActual('react-intl'),
    useIntl: jest.fn(),
}));

describe('components/FileUploadOverlay', () => {
    useIntl.mockImplementation(() => createIntl({locale: 'en', messages: {}, defaultLocale: 'en'}));

    test('should match snapshot when file upload is showing with no overlay type', () => {
        const wrapper = shallow(
            <FileUploadOverlay
                overlayType=''
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when file upload is showing with overlay type of right', () => {
        const wrapper = shallow(
            <FileUploadOverlay
                overlayType='right'
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when file upload is showing with overlay type of center', () => {
        const wrapper = shallow(
            <FileUploadOverlay
                overlayType='center'
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
