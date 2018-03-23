// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import FilePreview from 'components/file_preview.jsx';

describe('component/FilePreview', () => {
    const onRemove = jest.fn();
    const fileInfos = [
        {
            id: 'file_id_1',
            create_at: '1',
            width: 100,
            height: 100,
            extension: 'jpg',
        },
    ];
    const uploadsInProgress = ['clientID_1'];
    const baseProps = {
        fileInfos,
        uploadsInProgress,
        onRemove,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <FilePreview {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when props are changed', () => {
        const wrapper = shallow(
            <FilePreview {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
        const fileInfo2 = {
            id: 'file_id_2',
            create_at: '2',
            width: 100,
            height: 100,
            extension: 'jpg',
        };
        const newFileInfos = [...fileInfos, fileInfo2];
        wrapper.setProps({
            fileInfos: newFileInfos,
            uploadsInProgress: [],
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot', () => {
        const newOnRemove = jest.fn();
        const props = {...baseProps, onRemove: newOnRemove};
        const wrapper = shallow(
            <FilePreview {...props}/>
        );
        wrapper.instance().handleRemove();
        expect(newOnRemove).toHaveBeenCalled();
    });
});
