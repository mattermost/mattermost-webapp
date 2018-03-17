// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {clearFileInput} from 'utils/utils';
import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import FileUpload from 'components/file_upload/file_upload.jsx';

jest.mock('utils/file_utils', () => {
    const original = require.requireActual('utils/file_utils');
    return {
        ...original,
        canDownloadFiles: jest.fn(() => true),
    };
});

jest.mock('utils/utils', () => {
    const original = require.requireActual('utils/utils');
    return {
        ...original,
        clearFileInput: jest.fn(),
        generateId: jest.fn(() => 'generated_id_1').mockImplementationOnce(() => 'generated_id_2'),
        sortFilesByName: jest.fn((files) => {
            return files.sort((a, b) => a.name.localeCompare(b.name, 'en', {numeric: true}));
        }),
    };
});

describe('components/FileUpload', () => {
    const MaxFileSize = 10;
    function emptyFunction() {} //eslint-disable-line no-empty-function

    const baseProps = {
        currentChannelId: 'channel_id',
        intl: {},
        fileCount: 1,
        getTarget: emptyFunction,
        onClick: emptyFunction,
        onFileUpload: emptyFunction,
        onFileUploadChange: emptyFunction,
        onUploadError: emptyFunction,
        onUploadStart: emptyFunction,
        postType: 'post',
        uploadFile: emptyFunction,
        maxFileSize: MaxFileSize,
        canUploadFiles: true,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <FileUpload {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call onClick when fileInput is clicked', () => {
        const onClick = jest.fn();
        const props = {...baseProps, onClick};

        const wrapper = shallow(
            <FileUpload {...props}/>
        );

        wrapper.find('input').simulate('click');
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('should props.onFileUpload when fileUploadSuccess is called', () => {
        const onFileUpload = jest.fn();
        const props = {...baseProps, onFileUpload};
        const data = {
            file_infos: 'file_infos',
            client_ids: {id1: 'id1'},
        };

        const wrapper = shallow(
            <FileUpload {...props}/>
        );

        wrapper.instance().fileUploadSuccess(data);

        expect(onFileUpload).toHaveBeenCalledTimes(1);
        expect(onFileUpload).toHaveBeenCalledWith(data.file_infos, data.client_ids, props.currentChannelId);
    });

    test('should props.onUploadError when fileUploadFail is called', () => {
        const onUploadError = jest.fn();
        const props = {...baseProps, onUploadError};
        const params = {
            err: 'error_message',
            clientId: 'client_id',
        };

        const wrapper = shallow(
            <FileUpload {...props}/>
        );

        wrapper.instance().fileUploadFail(params.err, params.clientId);

        expect(onUploadError).toHaveBeenCalledTimes(1);
        expect(onUploadError).toHaveBeenCalledWith(params.err, params.clientId, props.currentChannelId);
    });

    test('should have props.functions when uploadFiles is called', () => {
        const onUploadError = jest.fn();
        const uploadFile = jest.fn();
        const onUploadStart = jest.fn();
        const props = {...baseProps, onUploadError, uploadFile, onUploadStart};
        const files = [{name: 'file1.pdf'}, {name: 'file2.jpg'}];

        const wrapper = shallowWithIntl(
            <FileUpload {...props}/>
        );

        wrapper.instance().uploadFiles(files);

        expect(uploadFile).toHaveBeenCalledTimes(2);

        expect(onUploadStart).toHaveBeenCalledTimes(1);
        expect(onUploadStart).toHaveBeenCalledWith(['generated_id_2', 'generated_id_1'], props.currentChannelId);

        expect(onUploadError).toHaveBeenCalledTimes(1);
        expect(onUploadError).toHaveBeenCalledWith(null);
    });

    test('should error max upload files', () => {
        const onUploadError = jest.fn();
        const uploadFile = jest.fn();
        const onUploadStart = jest.fn();
        const fileCount = 5;
        const props = {...baseProps, fileCount, onUploadError, uploadFile, onUploadStart};
        const files = [{name: 'file1.pdf'}, {name: 'file2.jpg'}];

        const wrapper = shallowWithIntl(
            <FileUpload {...props}/>
        );

        wrapper.instance().uploadFiles(files);

        expect(uploadFile).not.toBeCalled();

        expect(onUploadStart).toBeCalledWith([], props.currentChannelId);

        expect(onUploadError).toHaveBeenCalledTimes(2);
        expect(onUploadError.mock.calls[0][0]).toEqual(null);
    });

    test('should error max upload files', () => {
        const onUploadError = jest.fn();
        const uploadFile = jest.fn();
        const onUploadStart = jest.fn();
        const fileCount = 5;
        const props = {...baseProps, fileCount, onUploadError, uploadFile, onUploadStart};
        const files = [{name: 'file1.pdf'}, {name: 'file2.jpg'}];

        const wrapper = shallowWithIntl(
            <FileUpload {...props}/>
        );

        wrapper.instance().uploadFiles(files);

        expect(uploadFile).not.toBeCalled();

        expect(onUploadStart).toBeCalledWith([], props.currentChannelId);

        expect(onUploadError).toHaveBeenCalledTimes(2);
        expect(onUploadError.mock.calls[0][0]).toEqual(null);
    });

    test('should error max too large files', () => {
        const onUploadError = jest.fn();
        const uploadFile = jest.fn();
        const onUploadStart = jest.fn();
        const props = {...baseProps, onUploadError, uploadFile, onUploadStart};
        const files = [{name: 'file1.pdf', size: MaxFileSize + 1}];

        const wrapper = shallowWithIntl(
            <FileUpload {...props}/>
        );

        wrapper.instance().uploadFiles(files);

        expect(uploadFile).not.toBeCalled();

        expect(onUploadStart).toBeCalledWith([], props.currentChannelId);

        expect(onUploadError).toHaveBeenCalledTimes(2);
        expect(onUploadError.mock.calls[0][0]).toEqual(null);
    });

    test('should functions when handleChange is called', () => {
        const onFileUploadChange = jest.fn();
        const props = {...baseProps, onFileUploadChange};

        const wrapper = shallow(
            <FileUpload {...props}/>
        );

        const e = {target: {files: [{name: 'file1.pdf'}]}};
        const instance = wrapper.instance();
        instance.uploadFiles = jest.fn();
        instance.handleChange(e);

        expect(instance.uploadFiles).toBeCalled();
        expect(instance.uploadFiles).toHaveBeenCalledWith(e.target.files);

        expect(clearFileInput).toBeCalled();
        expect(clearFileInput).toHaveBeenCalledWith(e.target);

        expect(onFileUploadChange).toBeCalled();
        expect(onFileUploadChange).toHaveBeenCalledWith();
    });

    test('should functions when handleDrop is called', () => {
        const onUploadError = jest.fn();
        const onFileUploadChange = jest.fn();
        const props = {...baseProps, onUploadError, onFileUploadChange};

        const wrapper = shallow(
            <FileUpload {...props}/>
        );

        const e = {originalEvent: {dataTransfer: {files: [{name: 'file1.pdf'}]}}};
        const instance = wrapper.instance();
        instance.uploadFiles = jest.fn();
        instance.handleDrop(e);

        expect(onUploadError).toBeCalled();
        expect(onUploadError).toHaveBeenCalledWith(null);

        expect(instance.uploadFiles).toBeCalled();
        expect(instance.uploadFiles).toHaveBeenCalledWith(e.originalEvent.dataTransfer.files);

        expect(onFileUploadChange).toBeCalled();
        expect(onFileUploadChange).toHaveBeenCalledWith();
    });
});
