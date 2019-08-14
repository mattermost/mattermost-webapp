// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import {getFileUrl} from 'mattermost-redux/utils/file_utils';

import FilePreview from './file_preview';

describe('FilePreview', () => {
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
    const uploadsProgressPercent = {
        clientID_1: {
            name: 'file',
            percent: 50,
            extension: 'image/png',
        },
    };

    const baseProps = {
        enableSVGs: false,
        fileInfos,
        uploadsInProgress,
        onRemove,
        uploadsProgressPercent,
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

    test('should call handleRemove when file removed', () => {
        const newOnRemove = jest.fn();
        const props = {...baseProps, onRemove: newOnRemove};
        const wrapper = shallow(
            <FilePreview {...props}/>
        );
        wrapper.instance().handleRemove();
        expect(newOnRemove).toHaveBeenCalled();
    });

    test('should not render an SVG when SVGs are disabled', () => {
        const fileId = 'file_id_1';
        const props = {
            ...baseProps,
            fileInfos: [{id: fileId, extension: 'svg'}],
        };

        const wrapper = shallow(
            <FilePreview {...props}/>
        );

        expect(wrapper.find('img').find({src: getFileUrl(fileId)}).exists()).toBe(false);
        expect(wrapper.find('div').find('.file-icon.generic').exists()).toBe(true);
    });

    test('should render an SVG when SVGs are enabled', () => {
        const fileId = 'file_id_1';
        const props = {
            ...baseProps,
            enableSVGs: true,
            fileInfos: [{id: fileId, extension: 'svg'}],
        };

        const wrapper = shallow(
            <FilePreview {...props}/>
        );

        expect(wrapper.find('img').find({src: getFileUrl(fileId)}).exists()).toBe(true);
        expect(wrapper.find('div').find('.file-icon.generic').exists()).toBe(false);
    });
});
