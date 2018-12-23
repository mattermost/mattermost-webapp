// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import FileProgressPreview from './file_progress_preview.jsx';

describe('component/file_preview/file_progress_preview', () => {
    const handleRemove = jest.fn();

    const fileInfo = {
        name: 'file',
        percent: 50,
        type: 'image/png',
    };

    const baseProps = {
        clientId: 'clientId',
        fileInfo,
        handleRemove,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <FileProgressPreview {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('snapshot for percent value undefined', () => {
        const props = {
            ...baseProps,
            fileInfo: {
                ...fileInfo,
                percent: undefined,
            },
        };

        const wrapper = shallow(
            <FileProgressPreview {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
