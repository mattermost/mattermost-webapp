// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import FilePreviewModalInfo from './file_preview_modal_info';

describe('components/FilePreviewModalInfo', () => {
    test('should match snapshot when link is empty', () => {
        const wrapper = shallow<typeof FilePreviewModalInfo>(
            <FilePreviewModalInfo
                post={{}}
                filename={''}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
