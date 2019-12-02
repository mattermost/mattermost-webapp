// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import {defineMessages, intlShape, FormattedMessage} from 'react-intl';

import dragster from 'utils/dragster';
import Constants from 'utils/constants';
import DelayedAction from 'utils/delayed_action';
import {t} from 'utils/i18n';
import {
    isIosChrome,
    isMobileApp,
} from 'utils/user_agent';
import {getTable} from 'utils/paste';
import {
    clearFileInput,
    cmdOrCtrlPressed,
    isKeyPressed,
    generateId,
    isFileTransfer,
    isUriDrop,
    localizeMessage,
} from 'utils/utils.jsx';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';

import AttachmentIcon from 'components/widgets/icons/attachment_icon';

const holders = defineMessages({
    limited: {
        id: t('file_upload.limited'),
        defaultMessage: 'Uploads limited to {count, number} files maximum. Please use additional posts for more files.',
    },
    filesAbove: {
        id: t('file_upload.filesAbove'),
        defaultMessage: 'Files above {max}MB could not be uploaded: {filenames}',
    },
    fileAbove: {
        id: t('file_upload.fileAbove'),
        defaultMessage: 'File above {max}MB could not be uploaded: {filename}',
    },
    zeroBytesFiles: {
        id: t('file_upload.zeroBytesFiles'),
        defaultMessage: 'You are uploading empty files: {filenames}',
    },
    zeroBytesFile: {
        id: t('file_upload.zeroBytesFile'),
        defaultMessage: 'You are uploading an empty file: {filename}',
    },
    pasted: {
        id: t('file_upload.pasted'),
        defaultMessage: 'Image Pasted at ',
    },
    uploadFile: {
        id: t('file_upload.upload_files'),
        defaultMessage: 'Upload files',
    },
});

const OVERLAY_TIMEOUT = 500;

const customStyles = {
    left: 'inherit',
    right: 0,
    bottom: '100%',
    top: 'auto',
};

export default class FileUpload extends PureComponent {
    static propTypes = {

        /**
         * Current channel's ID
         */
        currentChannelId: PropTypes.string.isRequired,

        /**
         * Current root post's ID
         */
        rootId: PropTypes.string,

        /**
         * Number of files to attach
         */
        fileCount: PropTypes.number.isRequired,

        /**
         * Function to get file upload targeted input
         */
        getTarget: PropTypes.func.isRequired,

        locale: PropTypes.string.isRequired,

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
         * The maximum uploaded file size.
         */
        maxFileSize: PropTypes.number,

        /**
         * Whether or not file upload is allowed.
         */
        canUploadFiles: PropTypes.bool.isRequired,

        /**
         * Plugin file upload methods to be added
         */
        pluginFileUploadMethods: PropTypes.arrayOf(PropTypes.object),
        pluginFilesWillUploadHooks: PropTypes.arrayOf(PropTypes.object),

        /**
         * Function called when superAgent fires progress event.
         */
        onUploadProgress: PropTypes.func.isRequired,
        actions: PropTypes.shape({

            /**
             * Function to be called to upload file
             */
            uploadFile: PropTypes.func.isRequired,

            /**
             * Function to be called when file is uploaded or failed
             */
            handleFileUploadEnd: PropTypes.func.isRequired,
        }).isRequired,
    };

    static contextTypes = {
        intl: intlShape,
    };

    static defaultProps = {
        pluginFileUploadMethods: [],
        pluginFilesWillUploadHooks: [],
    };

    constructor(props) {
        super(props);
        this.state = {
            requests: {},
            menuOpen: false,
        };
        this.fileInput = React.createRef();
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
        document.removeEventListener('paste', this.pasteUpload);
        document.removeEventListener('keydown', this.keyUpload);

        this.unbindDragsterEvents();
    }

    fileUploadSuccess = (data, channelId, currentRootId) => {
        if (data) {
            this.props.onFileUpload(data.file_infos, data.client_ids, channelId, currentRootId);

            const requests = Object.assign({}, this.state.requests);
            for (var j = 0; j < data.client_ids.length; j++) {
                Reflect.deleteProperty(requests, data.client_ids[j]);
            }
            this.setState({requests});
        }
    }

    fileUploadFail = (err, clientId, channelId, currentRootId) => {
        this.props.onUploadError(err, clientId, channelId, currentRootId);
    }

    pluginUploadFiles = (files) => {
        // clear any existing errors
        this.props.onUploadError(null);
        this.uploadFiles(files);
    }

    checkPluginHooksAndUploadFiles = (files) => {
        // clear any existing errors
        this.props.onUploadError(null);

        let sortedFiles = Array.from(files).sort((a, b) => a.name.localeCompare(b.name, this.props.locale, {numeric: true}));

        const willUploadHooks = this.props.pluginFilesWillUploadHooks;
        for (const h of willUploadHooks) {
            const result = h.hook(sortedFiles, this.pluginUploadFiles);

            // Display an error message if there is one but don't reject the upload
            if (result.message) {
                this.props.onUploadError(result.message);
            }

            sortedFiles = result.files;
        }

        if (sortedFiles) {
            this.uploadFiles(sortedFiles);
        }
    }

    uploadFiles = (sortedFiles) => {
        const {currentChannelId, rootId} = this.props;

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

            const request = this.props.actions.uploadFile(
                sortedFiles[i],
                sortedFiles[i].name,
                currentChannelId,
                rootId,
                clientId,
            );

            request.on('progress', (progressEvent) => {
                this.props.onUploadProgress({
                    clientId,
                    name: sortedFiles[i].name,
                    percent: progressEvent.percent,
                    type: sortedFiles[i].type,
                });
            });

            request.end((err, res) => {
                const {error, data} = this.props.actions.handleFileUploadEnd(
                    sortedFiles[i],
                    sortedFiles[i].name,
                    currentChannelId,
                    rootId,
                    clientId,
                    {err, res},
                );

                if (error) {
                    this.fileUploadFail(error, clientId, currentChannelId, rootId);
                } else if (data) {
                    this.fileUploadSuccess(data, currentChannelId, rootId);
                }
            });

            this.setState({requests: {...this.state.requests, [clientId]: request}});
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
            this.checkPluginHooksAndUploadFiles(e.target.files);

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

        const items = e.dataTransfer.items || [];
        const droppedFiles = e.dataTransfer.files;
        const files = [];
        Array.from(droppedFiles).forEach((file, index) => {
            const item = items[index];
            if (item && item.webkitGetAsEntry && (item.webkitGetAsEntry() === null || item.webkitGetAsEntry().isDirectory)) {
                return;
            }
            files.push(file);
        });

        const types = e.dataTransfer.types;
        if (types) {
            if (isUriDrop(e.dataTransfer)) {
                return;
            }

            // For non-IE browsers
            if (types.includes && !types.includes('Files')) {
                return;
            }

            // For IE browsers
            if (types.contains && !types.contains('Files')) {
                return;
            }
        }

        if (files.length === 0) {
            this.props.onUploadError(localizeMessage('file_upload.drag_folder', 'Folders cannot be uploaded. Please drag all files separately.'));
            return;
        }

        if (files.length) {
            this.checkPluginHooksAndUploadFiles(files);
        }

        this.props.onFileUploadChange();
    }

    registerDragEvents = (containerSelector, overlaySelector) => {
        const self = this;

        const overlay = document.querySelector(overlaySelector);

        const dragTimeout = new DelayedAction(() => {
            overlay.classList.add('hidden');
        });

        let dragsterActions = {};
        if (this.props.canUploadFiles) {
            dragsterActions = {
                enter(e) {
                    var files = e.detail.dataTransfer;
                    if (!isUriDrop(files) && isFileTransfer(files)) {
                        overlay.classList.remove('hidden');
                    }
                },
                leave(e) {
                    var files = e.detail.dataTransfer;

                    if (!isUriDrop(files) && isFileTransfer(files)) {
                        overlay.classList.add('hidden');
                    }

                    dragTimeout.cancel();
                },
                over() {
                    dragTimeout.fireAfter(OVERLAY_TIMEOUT);
                },
                drop(e) {
                    overlay.classList.add('hidden');
                    dragTimeout.cancel();

                    self.handleDrop(e.detail);
                },
            };
        } else {
            dragsterActions = {
                drop(e) {
                    self.handleDrop(e.detail);
                },
            };
        }

        this.unbindDragsterEvents = dragster(containerSelector, dragsterActions);
    }

    containsEventTarget = (targetElement, eventTarget) => targetElement && targetElement.contains(eventTarget);

    pasteUpload = (e) => {
        const {formatMessage} = this.context.intl;

        if (!e.clipboardData || !e.clipboardData.items || getTable(e.clipboardData)) {
            return;
        }

        const target = this.props.getTarget();
        const textarea = ReactDOM.findDOMNode(target);
        if (!this.containsEventTarget(textarea, e.target)) {
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

        if (items && items.length > 0) {
            if (!this.props.canUploadFiles) {
                this.props.onUploadError(localizeMessage('file_upload.disabled', 'File attachments are disabled.'));
                return;
            }

            const files = [];

            for (let i = 0; i < items.length; i++) {
                const file = items[i].getAsFile();
                if (!file) {
                    continue;
                }

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

                const newFile = new Blob([file], {type: file.type});
                newFile.name = name;
                files.push(newFile);
            }

            if (files.length > 0) {
                this.checkPluginHooksAndUploadFiles(files);
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
                this.fileInput.current.focus();
                this.fileInput.current.click();
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
        if (e) {
            e.preventDefault();
        }

        const {onUploadError} = this.props;
        const {formatMessage} = this.context.intl;

        onUploadError(formatMessage(holders.limited, {count: Constants.MAX_UPLOAD_FILES}));
    }

    toggleMenu = (open) => {
        this.setState({menuOpen: open});
    }

    handleLocalFileUploaded = (e) => {
        const uploadsRemaining = Constants.MAX_UPLOAD_FILES - this.props.fileCount;
        if (uploadsRemaining > 0) {
            if (this.props.onClick) {
                this.props.onClick();
            }
        } else {
            this.handleMaxUploadReached(e);
        }
        this.setState({menuOpen: false});
    }

    simulateInputClick = () => {
        this.fileInput.current.click();
    }

    render() {
        const {formatMessage} = this.context.intl;
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

        let bodyAction;
        const ariaLabel = formatMessage({id: 'accessibility.button.attachment', defaultMessage: 'attachment'});

        if (this.props.pluginFileUploadMethods.length === 0) {
            bodyAction = (
                <div>
                    <button
                        type='button'
                        id='fileUploadButton'
                        aria-label={ariaLabel}
                        className='style--none post-action icon icon--attachment'
                        onClick={this.simulateInputClick}
                        onTouchEnd={this.simulateInputClick}
                    >
                        <AttachmentIcon/>
                    </button>
                    <input
                        id='fileUploadInput'
                        tabIndex='-1'
                        aria-label={formatMessage(holders.uploadFile)}
                        ref={this.fileInput}
                        type='file'
                        onChange={this.handleChange}
                        onClick={this.handleLocalFileUploaded}
                        multiple={multiple}
                        accept={accept}
                    />
                </div>
            );
        } else {
            const pluginFileUploadMethods = this.props.pluginFileUploadMethods.map((item) => {
                return (
                    <li
                        key={item.pluginId + '_fileuploadpluginmenuitem'}
                        onClick={() => {
                            if (item.action) {
                                item.action(this.checkPluginHooksAndUploadFiles);
                            }
                            this.setState({menuOpen: false});
                        }}
                    >
                        <a href='#'>
                            <span className='margin-right'>{item.icon}</span>
                            {item.text}
                        </a>
                    </li>
                );
            });
            bodyAction = (
                <div>
                    <input
                        tabIndex='-1'
                        aria-label={formatMessage(holders.uploadFile)}
                        ref={this.fileInput}
                        type='file'
                        className='file-attachment-menu-item-input'
                        onChange={this.handleChange}
                        onClick={this.handleLocalFileUploaded}
                        multiple={multiple}
                        accept={accept}
                    />
                    <MenuWrapper>
                        <button
                            type='button'
                            aria-label={ariaLabel}
                            className='style--none post-action'
                        >
                            <div
                                id='fileUploadButton'
                                className='icon icon--attachment'
                            >
                                <AttachmentIcon/>
                            </div>
                        </button>
                        <Menu
                            openLeft={true}
                            openUp={true}
                            ariaLabel={formatMessage({id: 'file_upload.menuAriaLabel', defaultMessage: 'Upload type selector'})}
                            customStyles={customStyles}
                        >
                            <li>
                                <a
                                    href='#'
                                    onClick={this.simulateInputClick}
                                    onTouchEnd={this.simulateInputClick}
                                >
                                    <span className='margin-right'><i className='fa fa-laptop'/></span>
                                    <FormattedMessage
                                        id='yourcomputer'
                                        defaultMessage='Your computer'
                                    />
                                </a>
                            </li>
                            {pluginFileUploadMethods}
                        </Menu>
                    </MenuWrapper>
                </div>
            );
        }

        if (!this.props.canUploadFiles) {
            bodyAction = null;
        }

        return (
            <div className={uploadsRemaining <= 0 ? ' style--none btn-file__disabled' : 'style--none'}>
                {bodyAction}
            </div>
        );
    }
}
