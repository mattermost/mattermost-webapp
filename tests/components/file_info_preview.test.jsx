// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import FileInfoPreview from 'components/file_info_preview.jsx';

describe('components/FileInfoPreview', () => {
    const requiredProps = {
        fileUrl: 'https://pre-release.mattermost.com/api/v4/files/rqir81f7a7ft8m6j6ej7g1txuo',
        fileInfo: {name: 'Test Image', size: 100, extension: 'jpg'},
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <FileInfoPreview {...requiredProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should receive props', () => {
        const wrapper = shallow(
            <FileInfoPreview {...requiredProps}/>
        );

        const instance = wrapper.instance();

        expect(instance.props.fileUrl).toBe(requiredProps.fileUrl);
        expect(wrapper.find('.file-details__name').text()).toBe(requiredProps.fileInfo.name);
    });
});