// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import FileAttachment from './file_attachment';

jest.mock('utils/utils.jsx', () => {
    const original = jest.requireActual('utils/utils.jsx');
    return {
        ...original,
        loadImage: jest.fn((id, callback) => callback()),
    };
});

describe('FileAttachment', () => {
    const baseFileInfo = {
        id: 'thumbnail_id',
        extension: 'pdf',
        name: 'test.pdf',
        size: 100,
        width: 100,
        height: 80,
        has_preview_image: true,
        user_id: '',
        create_at: 0,
        update_at: 0,
        delete_at: 0,
        mime_type: '',
        clientId: '',
    };

    const baseProps = {
        fileInfo: baseFileInfo,
        handleImageClick: jest.fn(),
        index: 3,
        canDownloadFiles: true,
        enableSVGs: false,
    };

    test('should match snapshot, regular file', () => {
        const wrapper = shallow(<FileAttachment {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, regular image', () => {
        const fileInfo = {
            ...baseFileInfo,
            extension: 'png',
            name: 'test.png',
            width: 600,
            height: 400,
            size: 100,
        };
        const props = {...baseProps, fileInfo};
        const wrapper = shallow(<FileAttachment {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, small image', () => {
        const fileInfo = {
            ...baseFileInfo,
            extension: 'png',
            name: 'test.png',
            width: 16,
            height: 16,
            size: 100,
        };
        const props = {...baseProps, fileInfo};
        const wrapper = shallow(<FileAttachment {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, svg image', () => {
        const fileInfo = {
            ...baseFileInfo,
            extension: 'svg',
            name: 'test.svg',
            width: 600,
            height: 400,
            size: 100,
        };
        const props = {...baseProps, fileInfo};
        const wrapper = shallow(<FileAttachment {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, after change from file to image', () => {
        const fileInfo = {
            ...baseFileInfo,
            extension: 'png',
            name: 'test.png',
            width: 600,
            height: 400,
            size: 100,
        };
        const wrapper = shallow(<FileAttachment {...baseProps}/>);
        wrapper.setProps({...baseProps, fileInfo});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with compact display', () => {
        const props = {...baseProps, compactDisplay: true};
        const wrapper = shallow(<FileAttachment {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, without compact display and without can download', () => {
        const props = {...baseProps, canDownloadFiles: false};
        const wrapper = shallow(<FileAttachment {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, file with long name', () => {
        const fileInfo = {
            ...baseFileInfo,
            extension: 'pdf',
            name: 'a-quite-long-filename-to-test-the-filename-shortener.pdf',

        };
        const props = {...baseProps, fileInfo};
        const wrapper = shallow(<FileAttachment {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, when file is not loaded', () => {
        const wrapper = shallow(<FileAttachment {...baseProps}/>);
        wrapper.setState({loaded: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should blur file attachment link after click', () => {
        const props = {...baseProps, compactDisplay: true};
        const wrapper = mountWithIntl(<FileAttachment {...props}/>);
        const e = {
            preventDefault: jest.fn(),
            target: {blur: jest.fn()},
        };

        const a = wrapper.find('#file-attachment-link');
        a.simulate('click', e);
        expect(e.target.blur).toHaveBeenCalled();
    });
});
