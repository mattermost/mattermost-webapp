// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import FileAttachment from './file_attachment';

jest.mock('utils/utils.jsx', () => {
    const original = require.requireActual('utils/utils.jsx');
    return {
        ...original,
        loadImage: jest.fn((id, callback) => callback()),
    };
});

function createComponent({fileInfo, handleImageClick, index, compactDisplay, canDownloadFiles = true, enableSVGs = false} = {}) { //eslint-disable-line react/prop-types
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
            canDownloadFiles={canDownloadFiles}
            enableSVGs={enableSVGs}
        />
    );
}

describe('FileAttachment', () => {
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
        const wrapper = shallow(createComponent({canDownloadFiles: false}));
        expect(wrapper).toMatchSnapshot();
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

    test('should blur file attachment link after click', () => {
        const wrapper = mountWithIntl(createComponent({compactDisplay: true}));
        const e = {
            preventDefault: jest.fn(),
            target: {blur: jest.fn()},
        };

        const a = wrapper.find('#file-attachment-link');
        a.simulate('click', e);
        expect(e.target.blur).toHaveBeenCalled();
    });
});
