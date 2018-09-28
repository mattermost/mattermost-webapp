// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import FileUploadProgress from 'components/file_preview/file_upload_progress.jsx';

describe('component/file_preview/file_upload_progress', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <FileUploadProgress percent={50}/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
