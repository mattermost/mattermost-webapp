// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {General} from 'mattermost-redux/constants';

import {clearFileInput} from 'utils/utils';
import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import FileUpload from 'components/file_upload/file_upload.jsx';

const generatedIdRegex = /[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/;

jest.mock('utils/file_utils', () => {
    const original = jest.requireActual('utils/file_utils');
    return {
        ...original,
        canDownloadFiles: jest.fn(() => true),
    };
});

jest.mock('utils/utils', () => {
    const original = jest.requireActual('utils/utils');
    return {
        ...original,
        clearFileInput: jest.fn(),
        sortFilesByName: jest.fn((files) => {
            return files.sort((a, b) => a.name.localeCompare(b.name, 'en', {numeric: true}));
        }),
    };
});

const RealDate = Date;
const RealFile = File;

beforeEach(() => {
    global.Date.prototype.getDate = () => 1;
    global.Date.prototype.getFullYear = () => 2000;
    global.Date.prototype.getHours = () => 1;
    global.Date.prototype.getMinutes = () => 1;
    global.Date.prototype.getMonth = () => 1;
});

afterEach(() => {
    global.Date = RealDate;
    global.File = RealFile;
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
            <FileUpload {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call onClick when fileInput is clicked', () => {
        const wrapper = shallowWithIntl(
            <FileUpload {...baseProps}/>,
        );

        wrapper.find('input').simulate('click');
        expect(baseProps.onClick).toHaveBeenCalledTimes(1);
    });

    test('should prevent event default and progogation on call of onTouchEnd on fileInput', () => {
        const wrapper = shallowWithIntl(
            <FileUpload {...baseProps}/>,
        );
        const instance = wrapper.instance();
        instance.handleLocalFileUploaded = jest.fn();
        instance.fileInput = {
            current: {
                click: () => instance.handleLocalFileUploaded(),
            },
        };

        const event = {stopPropagation: jest.fn(), preventDefault: jest.fn()};
        wrapper.find('button').simulate('touchend', event);

        expect(event.stopPropagation).toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
        expect(instance.handleLocalFileUploaded).toHaveBeenCalled();
    });

    test('should prevent event default and progogation on call of onClick on fileInput', () => {
        const wrapper = shallowWithIntl(
            <FileUpload {...baseProps}/>,
        );
        const instance = wrapper.instance();
        instance.handleLocalFileUploaded = jest.fn();
        instance.fileInput = {
            current: {
                click: () => instance.handleLocalFileUploaded(),
            },
        };

        const event = {stopPropagation: jest.fn(), preventDefault: jest.fn()};
        wrapper.find('button').simulate('click', event);

        expect(event.stopPropagation).toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
        expect(instance.handleLocalFileUploaded).toHaveBeenCalled();
    });

    test('should match state and call handleMaxUploadReached or props.onClick on handleLocalFileUploaded', () => {
        const wrapper = shallowWithIntl(
            <FileUpload
                {...baseProps}
                fileCount={4}
            />,
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
            <FileUpload {...baseProps}/>,
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
            <FileUpload {...baseProps}/>,
        );

        wrapper.instance().fileUploadFail(params.err, params.clientId, params.channelId, params.rootId);

        expect(baseProps.onUploadError).toHaveBeenCalledTimes(1);
        expect(baseProps.onUploadError).toHaveBeenCalledWith(params.err, params.clientId, params.channelId, params.rootId);
    });

    test.each([
        ['File constructor is supported', true],
        ['File constructor is not supported', false],
    ])('should upload file on paste when %s', (_, fileSupported) => {
        const expectedFileName = 'Image Pasted at 2000-2-1 01-01';

        const event = new Event('paste');
        event.preventDefault = jest.fn();
        const getAsFile = jest.fn().mockReturnValue(new File(['test'], 'test'));
        const file = {getAsFile, kind: 'file', name: 'test'};
        event.clipboardData = {items: [file], types: ['image/png']};

        const wrapper = shallowWithIntl(
            <FileUpload
                {...baseProps}
            />,
        );
        jest.spyOn(wrapper.instance(), 'containsEventTarget').mockReturnValue(true);
        const spy = jest.spyOn(wrapper.instance(), 'checkPluginHooksAndUploadFiles');

        if (!fileSupported) {
            global.File = undefined;
        }
        document.dispatchEvent(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith([expect.objectContaining({name: expectedFileName})]);
        expect(spy.mock.calls[0][0][0]).toBeInstanceOf(Blob); // first call, first arg, first item in array
        expect(baseProps.onFileUploadChange).toHaveBeenCalled();
    });

    test('should not prevent paste event default if no file in clipboard', () => {
        const event = new Event('paste');
        event.preventDefault = jest.fn();
        const getAsString = jest.fn();
        event.clipboardData = {items: [{getAsString, kind: 'string', type: 'text/plain'}], types: ['text/plain']};

        const wrapper = shallowWithIntl(
            <FileUpload
                {...baseProps}
            />,
        );
        const spy = jest.spyOn(wrapper.instance(), 'containsEventTarget').mockReturnValue(true);

        document.dispatchEvent(event);

        expect(spy).toHaveBeenCalled();
        expect(event.preventDefault).not.toHaveBeenCalled();
    });

    test('should have props.functions when uploadFiles is called', () => {
        const files = [{name: 'file1.pdf'}, {name: 'file2.jpg'}];

        const wrapper = shallowWithIntl(
            <FileUpload {...baseProps}/>,
        );

        wrapper.instance().checkPluginHooksAndUploadFiles(files);

        expect(uploadFile).toHaveBeenCalledTimes(2);

        expect(baseProps.onUploadStart).toHaveBeenCalledTimes(1);
        expect(baseProps.onUploadStart).toHaveBeenCalledWith(
            Array(2).fill(expect.stringMatching(generatedIdRegex)),
            baseProps.currentChannelId,
        );

        expect(baseProps.onUploadError).toHaveBeenCalledTimes(1);
        expect(baseProps.onUploadError).toHaveBeenCalledWith(null);
    });

    test('should error max upload files', () => {
        const fileCount = 5;
        const props = {...baseProps, fileCount};
        const files = [{name: 'file1.pdf'}, {name: 'file2.jpg'}];

        const wrapper = shallowWithIntl(
            <FileUpload {...props}/>,
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
            <FileUpload {...props}/>,
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
            <FileUpload {...baseProps}/>,
        );

        wrapper.instance().checkPluginHooksAndUploadFiles(files);

        expect(uploadFile).not.toBeCalled();

        expect(baseProps.onUploadStart).toBeCalledWith([], baseProps.currentChannelId);

        expect(baseProps.onUploadError).toHaveBeenCalledTimes(2);
        expect(baseProps.onUploadError.mock.calls[0][0]).toEqual(null);
    });

    test('should functions when handleChange is called', () => {
        const wrapper = shallowWithIntl(
            <FileUpload {...baseProps}/>,
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
            <FileUpload {...baseProps}/>,
        );

        const e = {dataTransfer: {files: [{name: 'file1.pdf'}]}};
        const instance = wrapper.instance();
        instance.uploadFiles = jest.fn();
        instance.handleDrop(e);

        expect(baseProps.onUploadError).toBeCalled();
        expect(baseProps.onUploadError).toHaveBeenCalledWith(null);

        expect(instance.uploadFiles).toBeCalled();
        expect(instance.uploadFiles).toHaveBeenCalledWith(e.dataTransfer.files);

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
            <FileUpload {...props}/>,
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
            <FileUpload {...props}/>,
        );

        wrapper.instance().checkPluginHooksAndUploadFiles(files);

        expect(uploadFile).toHaveBeenCalledTimes(1);

        expect(baseProps.onUploadStart).toHaveBeenCalledTimes(1);
        expect(baseProps.onUploadStart).toHaveBeenCalledWith([expect.stringMatching(generatedIdRegex)], props.currentChannelId);

        expect(baseProps.onUploadError).toHaveBeenCalledTimes(1);
        expect(baseProps.onUploadError).toHaveBeenCalledWith(null);
    });
});
