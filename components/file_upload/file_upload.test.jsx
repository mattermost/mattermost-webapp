// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {General} from 'mattermost-redux/constants';

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
    let baseProps;
    let uploadFile;
    beforeEach(() => {
        uploadFile = jest.fn(() => ({
            end: emptyFunction,
            on: emptyFunction,
        }));

        baseProps = {
            currentChannelId: 'channel_id',
            intl: {},
            fileCount: 1,
            getTarget: emptyFunction,
            locale: General.DEFAULT_LOCALE,
            onClick: jest.fn(),
            onFileUpload: jest.fn(),
            onFileUploadChange: jest.fn(),
            onUploadError: jest.fn(),
            onUploadStart: jest.fn(),
            onUploadProgress: jest.fn(),
            postType: 'post',
            maxFileSize: MaxFileSize,
            canUploadFiles: true,
            rootId: 'root_id',
            actions: {
                uploadFile,
                handleFileUploadEnd: jest.fn(),
            },
        };
    });

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <FileUpload {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call onClick when fileInput is clicked', () => {
        const wrapper = shallowWithIntl(
            <FileUpload {...baseProps}/>
        );

        wrapper.find('input').simulate('click');
        expect(baseProps.onClick).toHaveBeenCalledTimes(1);
    });

    test('should match state and call handleMaxUploadReached or props.onClick on handleLocalFileUploaded', () => {
        const wrapper = shallowWithIntl(
            <FileUpload
                {...baseProps}
                fileCount={4}
            />
        );

        const evt = {preventDefault: jest.fn()};
        wrapper.instance().handleMaxUploadReached = jest.fn();

        // allow file upload
        wrapper.setState({menuOpen: true});
        wrapper.instance().handleLocalFileUploaded(evt);
        expect(baseProps.onClick).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().handleMaxUploadReached).not.toBeCalled();
        expect(wrapper.state('menuOpen')).toEqual(false);

        // not allow file upload, max limit has been reached
        wrapper.setState({menuOpen: true});
        wrapper.setProps({fileCount: 5});
        wrapper.instance().handleLocalFileUploaded(evt);
        expect(baseProps.onClick).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().handleMaxUploadReached).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().handleMaxUploadReached).toBeCalledWith(evt);
        expect(wrapper.state('menuOpen')).toEqual(false);
    });

    test('should props.onFileUpload when fileUploadSuccess is called', () => {
        const data = {
            file_infos: 'file_infos',
            client_ids: {id1: 'id1'},
        };

        const wrapper = shallowWithIntl(
            <FileUpload {...baseProps}/>
        );

        wrapper.instance().fileUploadSuccess(data, 'channel_id', 'root_id');

        expect(baseProps.onFileUpload).toHaveBeenCalledTimes(1);
        expect(baseProps.onFileUpload).toHaveBeenCalledWith(data.file_infos, data.client_ids, 'channel_id', 'root_id');
    });

    test('should props.onUploadError when fileUploadFail is called', () => {
        const params = {
            err: 'error_message',
            clientId: 'client_id',
            channelId: 'channel_id',
            rootId: 'root_id',
        };

        const wrapper = shallowWithIntl(
            <FileUpload {...baseProps}/>
        );

        wrapper.instance().fileUploadFail(params.err, params.clientId, params.channelId, params.rootId);

        expect(baseProps.onUploadError).toHaveBeenCalledTimes(1);
        expect(baseProps.onUploadError).toHaveBeenCalledWith(params.err, params.clientId, params.channelId, params.rootId);
    });

    test('should have props.functions when uploadFiles is called', () => {
        const files = [{name: 'file1.pdf'}, {name: 'file2.jpg'}];

        const wrapper = shallowWithIntl(
            <FileUpload {...baseProps}/>
        );

        wrapper.instance().checkPluginHooksAndUploadFiles(files);

        expect(uploadFile).toHaveBeenCalledTimes(2);

        expect(baseProps.onUploadStart).toHaveBeenCalledTimes(1);
        expect(baseProps.onUploadStart).toHaveBeenCalledWith(['generated_id_2', 'generated_id_1'], baseProps.currentChannelId);

        expect(baseProps.onUploadError).toHaveBeenCalledTimes(1);
        expect(baseProps.onUploadError).toHaveBeenCalledWith(null);
    });

    test('should error max upload files', () => {
        const fileCount = 5;
        const props = {...baseProps, fileCount};
        const files = [{name: 'file1.pdf'}, {name: 'file2.jpg'}];

        const wrapper = shallowWithIntl(
            <FileUpload {...props}/>
        );

        wrapper.instance().checkPluginHooksAndUploadFiles(files);

        expect(uploadFile).not.toBeCalled();

        expect(baseProps.onUploadStart).toBeCalledWith([], props.currentChannelId);

        expect(baseProps.onUploadError).toHaveBeenCalledTimes(2);
        expect(baseProps.onUploadError.mock.calls[0][0]).toEqual(null);
    });

    test('should error max upload files', () => {
        const fileCount = 5;
        const props = {...baseProps, fileCount};
        const files = [{name: 'file1.pdf'}, {name: 'file2.jpg'}];

        const wrapper = shallowWithIntl(
            <FileUpload {...props}/>
        );

        wrapper.instance().checkPluginHooksAndUploadFiles(files);

        expect(uploadFile).not.toBeCalled();

        expect(baseProps.onUploadStart).toBeCalledWith([], props.currentChannelId);

        expect(baseProps.onUploadError).toHaveBeenCalledTimes(2);
        expect(baseProps.onUploadError.mock.calls[0][0]).toEqual(null);
    });

    test('should error max too large files', () => {
        const files = [{name: 'file1.pdf', size: MaxFileSize + 1}];

        const wrapper = shallowWithIntl(
            <FileUpload {...baseProps}/>
        );

        wrapper.instance().checkPluginHooksAndUploadFiles(files);

        expect(uploadFile).not.toBeCalled();

        expect(baseProps.onUploadStart).toBeCalledWith([], baseProps.currentChannelId);

        expect(baseProps.onUploadError).toHaveBeenCalledTimes(2);
        expect(baseProps.onUploadError.mock.calls[0][0]).toEqual(null);
    });

    test('should functions when handleChange is called', () => {
        const wrapper = shallowWithIntl(
            <FileUpload {...baseProps}/>
        );

        const e = {target: {files: [{name: 'file1.pdf'}]}};
        const instance = wrapper.instance();
        instance.uploadFiles = jest.fn();
        instance.handleChange(e);

        expect(instance.uploadFiles).toBeCalled();
        expect(instance.uploadFiles).toHaveBeenCalledWith(e.target.files);

        expect(clearFileInput).toBeCalled();
        expect(clearFileInput).toHaveBeenCalledWith(e.target);

        expect(baseProps.onFileUploadChange).toBeCalled();
        expect(baseProps.onFileUploadChange).toHaveBeenCalledWith();
    });

    test('should functions when handleDrop is called', () => {
        const wrapper = shallowWithIntl(
            <FileUpload {...baseProps}/>
        );

        const e = {originalEvent: {dataTransfer: {files: [{name: 'file1.pdf'}]}}};
        const instance = wrapper.instance();
        instance.uploadFiles = jest.fn();
        instance.handleDrop(e);

        expect(baseProps.onUploadError).toBeCalled();
        expect(baseProps.onUploadError).toHaveBeenCalledWith(null);

        expect(instance.uploadFiles).toBeCalled();
        expect(instance.uploadFiles).toHaveBeenCalledWith(e.originalEvent.dataTransfer.files);

        expect(baseProps.onFileUploadChange).toBeCalled();
        expect(baseProps.onFileUploadChange).toHaveBeenCalledWith();
    });

    test('FilesWillUploadHook - should reject all files', () => {
        const pluginHook = () => {
            return {files: null};
        };
        const props = {...baseProps, pluginFilesWillUploadHooks: [{hook: pluginHook}]};
        const files = [{name: 'file1.pdf'}, {name: 'file2.jpg'}];

        const wrapper = shallowWithIntl(
            <FileUpload {...props}/>
        );

        wrapper.instance().checkPluginHooksAndUploadFiles(files);

        expect(uploadFile).toHaveBeenCalledTimes(0);

        expect(baseProps.onUploadStart).toHaveBeenCalledTimes(0);

        expect(baseProps.onUploadError).toHaveBeenCalledTimes(1);
        expect(baseProps.onUploadError).toHaveBeenCalledWith(null);
    });

    test('FilesWillUploadHook - should reject one file and allow one file', () => {
        const pluginHook = (files) => {
            return {files: files.filter((f) => f.name === 'file1.pdf')};
        };
        const props = {...baseProps, pluginFilesWillUploadHooks: [{hook: pluginHook}]};
        const files = [{name: 'file1.pdf'}, {name: 'file2.jpg'}];

        const wrapper = shallowWithIntl(
            <FileUpload {...props}/>
        );

        wrapper.instance().checkPluginHooksAndUploadFiles(files);

        expect(uploadFile).toHaveBeenCalledTimes(1);

        expect(baseProps.onUploadStart).toHaveBeenCalledTimes(1);
        expect(baseProps.onUploadStart).toHaveBeenCalledWith(['generated_id_1'], props.currentChannelId);

        expect(baseProps.onUploadError).toHaveBeenCalledTimes(1);
        expect(baseProps.onUploadError).toHaveBeenCalledWith(null);
    });
});
