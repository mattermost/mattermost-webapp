// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow, ShallowWrapper} from 'enzyme';
import React from 'react';

import MessagesOrFilesSelector from 'components/search_results/messages_or_files_selector';

describe('components/search_results/MessagesOrFilesSelector', () => {
    test('should match snapshot, on messages selected', () => {
        const wrapper: ShallowWrapper<any, any, any> = shallow(
            <MessagesOrFilesSelector
                selected='messages'
                selectedFilter='code'
                messagesCounter='5'
                filesCounter='10'
                onChange={jest.fn()}
                onFilter={jest.fn()}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on files selected', () => {
        const wrapper: ShallowWrapper<any, any, any> = shallow(
            <MessagesOrFilesSelector
                selected='files'
                selectedFilter='code'
                messagesCounter='5'
                filesCounter='10'
                onChange={jest.fn()}
                onFilter={jest.fn()}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
