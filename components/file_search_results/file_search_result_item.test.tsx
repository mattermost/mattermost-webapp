// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow, ShallowWrapper} from 'enzyme';
import React from 'react';

import Constants from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import FileSearchResultItem from './file_search_result_item';

describe('components/file_search_result/FileSearchResultItem', () => {
    const baseProps = {
        fileInfo: TestHelper.getFileInfoMock({}),
        channelDisplayName: '',
        channelType: Constants.OPEN_CHANNEL,
        teamName: 'test-team-name',
        onClick: jest.fn(),
    };

    test('should match snapshot', () => {
        const wrapper: ShallowWrapper<any, any, FileSearchResultItem> = shallow(
            <FileSearchResultItem {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with channel name', () => {
        const props = {
            ...baseProps,
            channelDisplayName: 'test',
        };

        const wrapper: ShallowWrapper<any, any, FileSearchResultItem> = shallow(
            <FileSearchResultItem {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with DM', () => {
        const props = {
            ...baseProps,
            channelDisplayName: 'test',
            channelType: Constants.DM_CHANNEL,
        };

        const wrapper: ShallowWrapper<any, any, FileSearchResultItem> = shallow(
            <FileSearchResultItem {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with GM', () => {
        const props = {
            ...baseProps,
            channelDisplayName: 'test',
            channelType: Constants.GM_CHANNEL,
        };

        const wrapper: ShallowWrapper<any, any, FileSearchResultItem> = shallow(
            <FileSearchResultItem {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
