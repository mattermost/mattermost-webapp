// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import Constants from 'utils/constants.jsx';
import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import FileUpload from 'components/file_upload/file_upload.jsx';

describe('components/FileUpload', () => {
    global.window.mm_config = {};
    const MaxFileSize = 10;

    beforeEach(() => {
        global.window.mm_config.EnableFileAttachments = 'true';
        global.window.mm_config.MaxFileSize = MaxFileSize;
    });

    afterEach(() => {
        global.window.mm_config = {};
    });

    test('should match snapshot', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallowWithIntl(
            <FileUpload
                onUploadError={emptyFunction}
                getFileCount={emptyFunction}
                getTarget={emptyFunction}
                onClick={emptyFunction}
                onFileUpload={emptyFunction}
                onUploadStart={emptyFunction}
                onFileUploadChange={emptyFunction}
                channelId='channel id'
                postType='post'
                currentChannelId='current channel id'
                uploadFile={emptyFunction}
            />
        ).dive({disableLifecycleMethods: true});

        expect(wrapper).toMatchSnapshot();
    });

    test('should call onClick when fileInput is clicked', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const onClick = jest.fn();
        const getFileCount = jest.fn();
        getFileCount.mockReturnValue(0);

        const wrapper = shallowWithIntl(
            <FileUpload
                onUploadError={emptyFunction}
                getFileCount={getFileCount}
                getTarget={emptyFunction}
                onClick={onClick}
                onFileUpload={emptyFunction}
                onUploadStart={emptyFunction}
                onFileUploadChange={emptyFunction}
                channelId='channel id'
                postType='post type'
                currentChannelId='current channel id'
                uploadFile={emptyFunction}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find('#fileUploadButton > input').simulate('click');
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('should call onUploadError when fileInput is clicked and max. upload reached', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const onUploadError = jest.fn();
        const getFileCount = jest.fn();
        const preventDefault = jest.fn();
        getFileCount.mockReturnValue(Constants.MAX_UPLOAD_FILES);

        const wrapper = shallowWithIntl(
            <FileUpload
                onUploadError={onUploadError}
                getFileCount={getFileCount}
                getTarget={emptyFunction}
                onClick={emptyFunction}
                onFileUpload={emptyFunction}
                onUploadStart={emptyFunction}
                onFileUploadChange={emptyFunction}
                channelId='channel id'
                postType='post type'
                currentChannelId='current channel id'
                uploadFile={emptyFunction}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find('#fileUploadButton > input').simulate('click', {preventDefault});
        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(onUploadError).toHaveBeenCalledTimes(1);
    });

    test('should call onFileUploadChange, onUploadError, getFileCount and onUploadStart when fileInput is change', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const onFileUploadChange = jest.fn();
        const onUploadError = jest.fn();
        const getFileCount = jest.fn();
        getFileCount.mockReturnValue(0);
        const onUploadStart = jest.fn();
        const uploadFile = jest.fn();
        const files = [{
            name: 'file1.txt'
        }];

        const wrapper = shallowWithIntl(
            <FileUpload
                onUploadError={onUploadError}
                getFileCount={getFileCount}
                getTarget={emptyFunction}
                onClick={emptyFunction}
                onFileUpload={emptyFunction}
                onUploadStart={onUploadStart}
                onFileUploadChange={onFileUploadChange}
                channelId='channel id'
                postType='post type'
                currentChannelId='current channel id'
                uploadFile={uploadFile}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find('#fileUploadButton > input').simulate('change', {target: {files}});
        expect(onFileUploadChange).toHaveBeenCalledTimes(1);

        expect(onUploadError).toHaveBeenCalledTimes(1);
        expect(onUploadError).toHaveBeenCalledWith(null);
        expect(getFileCount).toHaveBeenCalledTimes(2);
        expect(getFileCount).toHaveBeenCalledWith('channel id');
        expect(onUploadStart).toHaveBeenCalledTimes(1);
        expect(uploadFile).toHaveBeenCalledTimes(1);
    });

    test('should call onUploadStart > 1 time when fileInput is change with > 1 files', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const getFileCount = jest.fn();
        getFileCount.mockReturnValue(0);
        const onUploadStart = jest.fn();
        const files = [{
            name: 'file 1'
        },
        {
            name: 'file 2'
        }];

        const wrapper = shallowWithIntl(
            <FileUpload
                onUploadError={emptyFunction}
                getFileCount={getFileCount}
                getTarget={emptyFunction}
                onClick={emptyFunction}
                onFileUpload={emptyFunction}
                onUploadStart={onUploadStart}
                onFileUploadChange={emptyFunction}
                channelId='channel id'
                postType='post type'
                currentChannelId='current channel id'
                uploadFile={emptyFunction}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find('#fileUploadButton > input').simulate('change', {target: {files}});
        expect(onUploadStart).toHaveBeenCalledTimes(2);
    });

    test('should call onUploadError when fileInput is change no. of files > max. upload files', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const onUploadError = jest.fn();
        const getFileCount = jest.fn();
        getFileCount.mockReturnValue(Constants.MAX_UPLOAD_FILES + 1);
        const files = [{
            name: 'file 1'
        }];

        const wrapper = shallowWithIntl(
            <FileUpload
                onUploadError={onUploadError}
                getFileCount={getFileCount}
                getTarget={emptyFunction}
                onClick={emptyFunction}
                onFileUpload={emptyFunction}
                onUploadStart={emptyFunction}
                onFileUploadChange={emptyFunction}
                channelId='channel id'
                postType='post type'
                currentChannelId='current channel id'
                uploadFile={emptyFunction}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find('#fileUploadButton > input').simulate('change', {target: {files}});
        expect(onUploadError).toHaveBeenCalledTimes(2);
    });

    test('should call onUploadError when fileInput is change with 1 file with size > max. file size', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const onUploadError = jest.fn();
        const getFileCount = jest.fn();
        getFileCount.mockReturnValue(Constants.MAX_UPLOAD_FILES);
        const files = [{
            name: 'file 1',
            size: MaxFileSize + 1
        }];

        const wrapper = shallowWithIntl(
            <FileUpload
                onUploadError={onUploadError}
                getFileCount={emptyFunction}
                getTarget={emptyFunction}
                onClick={emptyFunction}
                onFileUpload={emptyFunction}
                onUploadStart={emptyFunction}
                onFileUploadChange={emptyFunction}
                channelId='channel id'
                postType='post type'
                currentChannelId='current channel id'
                uploadFile={emptyFunction}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find('#fileUploadButton > input').simulate('change', {target: {files}});
        expect(onUploadError).toHaveBeenCalledTimes(1);
    });

    test('should call onUploadError when fileInput is change with > 1 file with size > max. file size', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const onUploadError = jest.fn();
        const getFileCount = jest.fn();
        getFileCount.mockReturnValue(Constants.MAX_UPLOAD_FILES);
        const files = [{
            name: 'file 1',
            size: MaxFileSize + 1
        }, {
            name: 'file 2',
            size: MaxFileSize + 1
        }];

        const wrapper = shallowWithIntl(
            <FileUpload
                onUploadError={onUploadError}
                getFileCount={emptyFunction}
                getTarget={emptyFunction}
                onClick={emptyFunction}
                onFileUpload={emptyFunction}
                onUploadStart={emptyFunction}
                onFileUploadChange={emptyFunction}
                channelId='channel id'
                postType='post type'
                currentChannelId='current channel id'
                uploadFile={emptyFunction}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find('#fileUploadButton > input').simulate('change', {target: {files}});
        expect(onUploadError).toHaveBeenCalledTimes(1);
    });

    test('should call onFileUploadChange when fileInput is change when channelId is null', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const onFileUploadChange = jest.fn();
        const onUploadError = jest.fn();
        const getFileCount = jest.fn();
        getFileCount.mockReturnValue(0);
        const files = [{
            name: 'file 1'
        }];

        const wrapper = shallowWithIntl(
            <FileUpload
                onUploadError={onUploadError}
                getFileCount={getFileCount}
                getTarget={emptyFunction}
                onClick={emptyFunction}
                onFileUpload={emptyFunction}
                onUploadStart={emptyFunction}
                onFileUploadChange={onFileUploadChange}
                channelId={null}
                postType='post type'
                currentChannelId='current channel id'
                uploadFile={emptyFunction}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find('#fileUploadButton > input').simulate('change', {target: {files}});
        expect(onFileUploadChange).toHaveBeenCalledTimes(1);
        expect(onUploadError).toHaveBeenCalledTimes(1);
        expect(onUploadError).toHaveBeenCalledWith(null);
        expect(getFileCount).toHaveBeenCalledTimes(2);
        expect(getFileCount).toHaveBeenCalledWith('current channel id');
    });
});
