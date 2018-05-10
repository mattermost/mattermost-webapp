// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import {defineMessages, intlShape} from 'react-intl';
import 'jquery-dragster/jquery.dragster.js';

import Constants from 'utils/constants.jsx';
import DelayedAction from 'utils/delayed_action.jsx';
import {
    isIosChrome,
    isMobileApp,
} from 'utils/user_agent.jsx';
import {
    clearFileInput,
    cmdOrCtrlPressed,
    isKeyPressed,
    generateId,
    isFileTransfer,
    localizeMessage,
    sortFilesByName,
} from 'utils/utils.jsx';

import AttachmentIcon from 'components/svg/attachment_icon';

const holders = defineMessages({
    limited: {
        id: 'file_upload.limited',
        defaultMessage: 'Uploads limited to {count, number} files maximum. Please use additional posts for more files.',
    },
    filesAbove: {
        id: 'file_upload.filesAbove',
        defaultMessage: 'Files above {max}MB could not be uploaded: {filenames}',
    },
    fileAbove: {
        id: 'file_upload.fileAbove',
        defaultMessage: 'File above {max}MB could not be uploaded: {filename}',
    },
    zeroBytesFiles: {
        id: 'file_upload.zeroBytesFiles',
        defaultMessage: 'You are uploading empty files: {filenames}',
    },
    zeroBytesFile: {
        id: 'file_upload.zeroBytesFile',
        defaultMessage: 'You are uploading an empty file: {filename}',
    },
    pasted: {
        id: 'file_upload.pasted',
        defaultMessage: 'Image Pasted at ',
    },
});

const OVERLAY_TIMEOUT = 500;

export default class FileUpload extends PureComponent {
    static propTypes = {

        /**
         * Current channel's ID
         */
        currentChannelId: PropTypes.string.isRequired,

        /**
         * Number of files to attach
         */
        fileCount: PropTypes.number.isRequired,

        /**
         * Function to get file upload targeted input
         */
        getTarget: PropTypes.func.isRequired,

        /**
         * Function to be called when file upload input is clicked
         */
        onClick: PropTypes.func,

        /**
         * Function to be called when file upload is complete
         */
        onFileUpload: PropTypes.func,

        /**
         * Function to be called when file upload input's change event is fired
         */
        onFileUploadChange: PropTypes.func,

        /**
         * Function to be called when upload fails
         */
        onUploadError: PropTypes.func,

        /**
         * Function to be called when file upload starts
         */
        onUploadStart: PropTypes.func,

        /**
         * Type of the object which the uploaded file is attached to
         */
        postType: PropTypes.string,

        /**
         * Function to be called to upload file
         */
        uploadFile: PropTypes.func.isRequired,

        /**
         * The maximum uploaded file size.
         */
        maxFileSize: PropTypes.number,

        /**
         * Whether or not file upload is allowed.
         */
        canUploadFiles: PropTypes.bool.isRequired,
    };

    static contextTypes = {
        intl: intlShape,
    };

    constructor(props) {
        super(props);
        this.state = {
            requests: {},
        };
    }

    componentDidMount() {
        if (this.props.postType === 'post') {
            this.registerDragEvents('.row.main', '.center-file-overlay');
        } else if (this.props.postType === 'comment') {
            this.registerDragEvents('.post-right__container', '.right-file-overlay');
        }

        document.addEventListener('paste', this.pasteUpload);
        document.addEventListener('keydown', this.keyUpload);
    }

    componentWillUnmount() {
        let target;
        if (this.props.postType === 'post') {
            target = $('.row.main');
        } else {
            target = $('.post-right__container');
        }

        document.removeEventListener('paste', this.pasteUpload);
        document.removeEventListener('keydown', this.keyUpload);

        // jquery-dragster doesn't provide a function to unregister itself so do it manually
        target.off('dragenter dragleave dragover drop dragster:enter dragster:leave dragster:over dragster:drop');
    }

    fileUploadSuccess = (data) => {
        if (data) {
            this.props.onFileUpload(data.file_infos, data.client_ids, this.props.currentChannelId);

            const requests = Object.assign({}, this.state.requests);
            for (var j = 0; j < data.client_ids.length; j++) {
                Reflect.deleteProperty(requests, data.client_ids[j]);
            }
            this.setState({requests});
        }
    }

    fileUploadFail = (err, clientId) => {
        this.props.onUploadError(err, clientId, this.props.currentChannelId);
    }

    uploadFiles = (files) => {
        const sortedFiles = sortFilesByName(files);

        // clear any existing errors
        this.props.onUploadError(null);

        const {currentChannelId} = this.props;

        const uploadsRemaining = Constants.MAX_UPLOAD_FILES - this.props.fileCount;
        let numUploads = 0;

        // keep track of how many files have been too large
        const tooLargeFiles = [];
        const zeroFiles = [];
        const clientIds = [];

        for (let i = 0; i < sortedFiles.length && numUploads < uploadsRemaining; i++) {
            if (sortedFiles[i].size > this.props.maxFileSize) {
                tooLargeFiles.push(sortedFiles[i]);
                continue;
            }
            if (sortedFiles[i].size === 0) {
                zeroFiles.push(sortedFiles[i]);
            }

            // generate a unique id that can be used by other components to refer back to this upload
            const clientId = generateId();

            const request = this.props.uploadFile(
                sortedFiles[i],
                sortedFiles[i].name,
                currentChannelId,
                clientId,
                (data) => this.fileUploadSuccess(data),
                (e) => this.fileUploadFail(e, clientId)
            );

            const requests = this.state.requests;
            requests[clientId] = request;
            this.setState({requests});
            clientIds.push(clientId);

            numUploads += 1;
        }

        this.props.onUploadStart(clientIds, currentChannelId);

        const {formatMessage} = this.context.intl;
        const errors = [];
        if (sortedFiles.length > uploadsRemaining) {
            errors.push(formatMessage(holders.limited, {count: Constants.MAX_UPLOAD_FILES}));
        }

        if (tooLargeFiles.length > 1) {
            var tooLargeFilenames = tooLargeFiles.map((file) => file.name).join(', ');

            errors.push(formatMessage(holders.filesAbove, {max: (this.props.maxFileSize / 1048576), filenames: tooLargeFilenames}));
        } else if (tooLargeFiles.length > 0) {
            errors.push(formatMessage(holders.fileAbove, {max: (this.props.maxFileSize / 1048576), filename: tooLargeFiles[0].name}));
        }

        if (zeroFiles.length > 1) {
            var zeroFilenames = zeroFiles.map((file) => file.name).join(', ');

            errors.push(formatMessage(holders.zeroBytesFiles, {filenames: zeroFilenames}));
        } else if (zeroFiles.length > 0) {
            errors.push(formatMessage(holders.zeroBytesFile, {filename: zeroFiles[0].name}));
        }

        if (errors.length > 0) {
            this.props.onUploadError(errors.join(', '));
        }
    }

    handleChange = (e) => {
        if (e.target.files.length > 0) {
            this.uploadFiles(e.target.files);

            clearFileInput(e.target);
        }

        this.props.onFileUploadChange();
    }

    handleDrop = (e) => {
        if (!this.props.canUploadFiles) {
            this.props.onUploadError(localizeMessage('file_upload.disabled', 'File attachments are disabled.'));
            return;
        }

        this.props.onUploadError(null);

        var files = e.originalEvent.dataTransfer.files;

        if (typeof files !== 'string' && files.length) {
            this.uploadFiles(files);
        }

        this.props.onFileUploadChange();
    }

    registerDragEvents = (containerSelector, overlaySelector) => {
        const self = this;

        const overlay = $(overlaySelector);

        const dragTimeout = new DelayedAction(() => {
            if (!overlay.hasClass('hidden')) {
                overlay.addClass('hidden');
            }
        });

        let dragsterActions = {};
        if (this.props.canUploadFiles) {
            dragsterActions = {
                enter(dragsterEvent, e) {
                    var files = e.originalEvent.dataTransfer;

                    if (isFileTransfer(files)) {
                        $(overlaySelector).removeClass('hidden');
                    }
                },
                leave(dragsterEvent, e) {
                    var files = e.originalEvent.dataTransfer;

                    if (isFileTransfer(files) && !overlay.hasClass('hidden')) {
                        overlay.addClass('hidden');
                    }

                    dragTimeout.cancel();
                },
                over() {
                    dragTimeout.fireAfter(OVERLAY_TIMEOUT);
                },
                drop(dragsterEvent, e) {
                    if (!overlay.hasClass('hidden')) {
                        overlay.addClass('hidden');
                    }

                    dragTimeout.cancel();

                    self.handleDrop(e);
                },
            };
        } else {
            dragsterActions = {
                drop(dragsterEvent, e) {
                    self.handleDrop(e);
                },
            };
        }

        $(containerSelector).dragster(dragsterActions);
    }

    pasteUpload = (e) => {
        const {formatMessage} = this.context.intl;

        if (!e.clipboardData || !e.clipboardData.items) {
            return;
        }

        const textarea = ReactDOM.findDOMNode(this.props.getTarget());
        if (!textarea || !textarea.contains(e.target)) {
            return;
        }

        this.props.onUploadError(null);

        const items = [];
        for (let i = 0; i < e.clipboardData.items.length; i++) {
            const item = e.clipboardData.items[i];

            if (item.kind !== 'file') {
                continue;
            }

            items.push(item);
        }

        // This looks redundant, but must be done this way due to
        // setState being an asynchronous call
        if (items && items.length > 0) {
            if (!this.props.canUploadFiles) {
                this.props.onUploadError(localizeMessage('file_upload.disabled', 'File attachments are disabled.'));
                return;
            }
            const uploadsRemaining = Constants.MAX_UPLOAD_FILES - this.props.fileCount;
            var numToUpload = Math.min(uploadsRemaining, items.length);

            if (items.length > numToUpload) {
                this.props.onUploadError(formatMessage(holders.limited, {count: Constants.MAX_UPLOAD_FILES}));
            }

            const {currentChannelId} = this.props;

            for (var i = 0; i < items.length && i < numToUpload; i++) {
                var file = items[i].getAsFile();
                if (!file) {
                    continue;
                }

                // generate a unique id that can be used by other components to refer back to this file upload
                const clientId = generateId();

                var d = new Date();
                let hour = d.getHours();
                hour = hour < 10 ? `0${hour}` : `${hour}`;

                let minute = d.getMinutes();
                minute = minute < 10 ? `0${minute}` : `${minute}`;

                var ext = '';
                if (file.name) {
                    if (file.name.includes('.')) {
                        ext = file.name.substr(file.name.lastIndexOf('.'));
                    }
                } else if (items[i].type.includes('/')) {
                    ext = '.' + items[i].type.split('/')[1].toLowerCase();
                }

                const name = formatMessage(holders.pasted) + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + hour + '-' + minute + ext;

                const request = this.props.uploadFile(
                    file,
                    name,
                    currentChannelId,
                    clientId,
                    (data) => this.fileUploadSuccess(data),
                    (err) => this.fileUploadFail(err, clientId)
                );

                const requests = this.state.requests;
                requests[clientId] = request;
                this.setState({requests});

                this.props.onUploadStart([clientId], currentChannelId);
            }

            if (numToUpload > 0) {
                this.props.onFileUploadChange();
            }
        }
    }

    keyUpload = (e) => {
        if (cmdOrCtrlPressed(e) && isKeyPressed(e, Constants.KeyCodes.U)) {
            e.preventDefault();

            if (!this.props.canUploadFiles) {
                this.props.onUploadError(localizeMessage('file_upload.disabled', 'File attachments are disabled.'));
                return;
            }
            const postTextbox = this.props.postType === 'post' && document.activeElement.id === 'post_textbox';
            const commentTextbox = this.props.postType === 'comment' && document.activeElement.id === 'reply_textbox';
            if (postTextbox || commentTextbox) {
                $(this.refs.fileInput).focus().trigger('click');
            }
        }
    }

    cancelUpload = (clientId) => {
        const requests = Object.assign({}, this.state.requests);
        const request = requests[clientId];

        if (request) {
            request.abort();

            Reflect.deleteProperty(requests, clientId);
            this.setState({requests});
        }
    }

    handleMaxUploadReached = (e) => {
        e.preventDefault();

        const {onUploadError} = this.props;
        const {formatMessage} = this.context.intl;

        onUploadError(formatMessage(holders.limited, {count: Constants.MAX_UPLOAD_FILES}));
    }

    render() {
        let multiple = true;
        if (isMobileApp()) {
            // iOS WebViews don't upload videos properly in multiple mode
            multiple = false;
        }

        let accept = '';
        if (isIosChrome()) {
            // iOS Chrome can't upload videos at all
            accept = 'image/*';
        }

        const uploadsRemaining = Constants.MAX_UPLOAD_FILES - this.props.fileCount;
        const onClick = uploadsRemaining > 0 ? this.props.onClick : this.handleMaxUploadReached;

        return (
            <span
                ref='input'
                className={uploadsRemaining <= 0 ? ' btn-file__disabled' : ''}
            >
                {this.props.canUploadFiles &&
                <div
                    id='fileUploadButton'
                    className='icon icon--attachment'
                >
                    <AttachmentIcon/>
                    <input
                        ref='fileInput'
                        type='file'
                        onChange={this.handleChange}
                        onClick={onClick}
                        multiple={multiple}
                        accept={accept}
                    />
                </div>
                }
            </span>
        );
    }
}
