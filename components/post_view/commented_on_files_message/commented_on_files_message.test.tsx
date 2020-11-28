// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import CommentedOnFilesMessage from './commented_on_files_message';

describe('components/CommentedOnFilesMessage', () => {
    const baseProps = {
        parentPostId: 'parentPostId',
    };

    test('Snapshot when no files', () => {
        const wrapper = shallow(
            <CommentedOnFilesMessage {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for single file', () => {
        const props = {
            ...baseProps,
            fileInfos: [{
                id: 'file_id_1',
                name: 'image_1.png',
                extension: 'png',
                create_at: 1,
                user_id: '',
                update_at: 1,
                delete_at: 1,
                size: 1,
                mime_type: '',
                width: 100,
                height: 100,
                has_preview_image: false,
                clientId: '',
            }],
        };

        const wrapper = shallow(
            <CommentedOnFilesMessage {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for multiple files', () => {
        const fileInfos = [
            {
                id: 'file_id_3',
                name: 'image_3.png',
                extension: 'png',
                create_at: 3,
                user_id: '',
                update_at: 3,
                delete_at: 3,
                size: 1,
                mime_type: '',
                width: 100,
                height: 100,
                has_preview_image: false,
                clientId: '',
            },
            {
                id: 'file_id_2',
                name: 'image_2.png',
                extension: 'png',
                create_at: 2,
                user_id: '',
                update_at: 2,
                delete_at: 2,
                size: 1,
                mime_type: '',
                width: 100,
                height: 100,
                has_preview_image: false,
                clientId: '',
            },
            {
                id: 'file_id_3',
                name: 'image_3.png',
                extension: 'png',
                create_at: 3,
                user_id: '',
                update_at: 3,
                delete_at: 3,
                size: 1,
                mime_type: '',
                width: 100,
                height: 100,
                has_preview_image: false,
                clientId: '',
            },
        ];

        const props = {
            ...baseProps,
            fileInfos,
        };

        const wrapper = shallow(
            <CommentedOnFilesMessage {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
