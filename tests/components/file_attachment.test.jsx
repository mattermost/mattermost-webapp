// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow, mount} from 'enzyme';

import FileAttachment from 'components/file_attachment.jsx';

jest.mock('utils/utils.jsx', () => {
    const original = require.requireActual('utils/utils.jsx');
    return {
        ...original,
        loadImage: jest.fn((id, callback) => callback()),
    };
});

jest.mock('utils/file_utils', () => {
    const original = require.requireActual('utils/file_utils');
    return {
        ...original,
        canDownloadFiles: jest.fn(() => true),
    };
});

function createComponent({fileInfo, handleImageClick, index, compactDisplay} = {}) {
    const fileInfoProp = fileInfo || {
        id: 1,
        extension: 'pdf',
        name: 'test.pdf',
        size: 100,
    };
    const indexProp = index || 3;
    const handleImageClickProp = handleImageClick || jest.fn();
    return (
        <FileAttachment
            fileInfo={fileInfoProp}
            handleImageClick={handleImageClickProp}
            index={indexProp}
            compactDisplay={compactDisplay}
        />
    );
}

describe('component/FileAttachment', () => {
    test('should match snapshot, regular file', () => {
        const wrapper = shallow(createComponent());
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, regular image', () => {
        const fileInfo = {
            id: 1,
            extension: 'png',
            name: 'test.png',
            width: 600,
            height: 400,
            size: 100,
        };
        const wrapper = shallow(createComponent({fileInfo}));
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, small image', () => {
        const fileInfo = {
            id: 1,
            extension: 'png',
            name: 'test.png',
            width: 16,
            height: 16,
            size: 100,
        };
        const wrapper = shallow(createComponent({fileInfo}));
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, svg image', () => {
        const fileInfo = {
            id: 1,
            extension: 'svg',
            name: 'test.svg',
            width: 600,
            height: 400,
            size: 100,
        };
        const wrapper = shallow(createComponent({fileInfo}));
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, after change from file to image', () => {
        const fileInfo = {
            id: 2,
            extension: 'png',
            name: 'test.png',
            width: 600,
            height: 400,
            size: 100,
        };
        const wrapper = shallow(createComponent());
        wrapper.setProps({fileInfo});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with compact display', () => {
        const wrapper = shallow(createComponent({compactDisplay: true}));
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, without compact display and without can download', () => {
        const fileUtilsMock = require.requireMock('utils/file_utils');
        fileUtilsMock.canDownloadFiles.mockImplementation(() => false);
        const wrapper = shallow(createComponent());
        expect(wrapper).toMatchSnapshot();
        fileUtilsMock.canDownloadFiles.mockImplementation(() => true);
    });

    test('should match snapshot, file with long name', () => {
        const fileInfo = {
            id: 1,
            extension: 'pdf',
            name: 'a-quite-long-filename-to-test-the-filename-shortener.pdf',
            size: 100,
        };
        const wrapper = shallow(createComponent({fileInfo}));
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, when file is not loaded', () => {
        const wrapper = shallow(createComponent());
        wrapper.setState({loaded: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should call the handleImageClick on attachment clicked', () => {
        const handleImageClick = jest.fn();
        const wrapper = mount(createComponent({handleImageClick}));
        wrapper.find('.post-image__thumbnail').simulate('click');
        expect(handleImageClick).toBeCalled();
    });
});
