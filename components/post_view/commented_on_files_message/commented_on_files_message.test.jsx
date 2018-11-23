// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import CommentedOnFilesMessage from './commented_on_files_message.jsx';

describe('components/CommentedOnFilesMessage', () => {
    const parentPostId = 'parentPostId';
    const actions = {getFilesForPost: jest.fn()};

    const baseProps = {
        parentPostId,
        actions,
    };

    test('Should call snapshot when no files and call getFilesForPost', () => {
        const wrapper = shallow(
            <CommentedOnFilesMessage {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(actions.getFilesForPost).toHaveBeenCalledTimes(1);
    });

    test('should match snapshot for single file', () => {
        const props = {
            ...baseProps,
            fileInfos: [{id: 'file_id_1', name: 'image_1.png', extension: 'png', create_at: 1}],
        };

        const wrapper = shallow(
            <CommentedOnFilesMessage {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for multiple files', () => {
        const fileInfos = [
            {id: 'file_id_3', name: 'image_3.png', extension: 'png', create_at: 3},
            {id: 'file_id_2', name: 'image_2.png', extension: 'png', create_at: 2},
            {id: 'file_id_1', name: 'image_1.png', extension: 'png', create_at: 1},
        ];

        const props = {
            ...baseProps,
            fileInfos,
        };

        const wrapper = shallow(
            <CommentedOnFilesMessage {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
