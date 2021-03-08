// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow, ShallowWrapper} from 'enzyme';
import React from 'react';

import {TestHelper} from 'utils/test_helper';

import FileSearchResultItem from './file_search_result_item';

describe('components/file_search_result/FileSearchResultItem', () => {
    const baseProps = {
        fileInfo: TestHelper.getFileInfoMock({}),
        teamName: 'test-team-name',
        onClick: jest.fn(),
    };

    test('should match snapshot', () => {
        const wrapper: ShallowWrapper<any, any, FileSearchResultItem> = shallow(
            <FileSearchResultItem {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
