// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {getFileUrl} from 'mattermost-redux/utils/file_utils';

import AttachmentIcon from 'components/svg/attachment_icon';
import * as Utils from 'utils/utils.jsx';

export default class FilenameOverlay extends React.PureComponent {
    static propTypes = {

        /*
         * File detailed information
         */
        fileInfo: PropTypes.object.isRequired,

        /*
         * The index of this attachment preview in the parent FileAttachmentList
         */
        index: PropTypes.number.isRequired,

        /*
         * Handler for when the thumbnail is clicked passed the index above
         */
        handleImageClick: PropTypes.func,

        /*
         * Display in compact format
         */
        compactDisplay: PropTypes.bool,

        /*
         * If it should display link to download on file name
         */
        canDownload: PropTypes.bool
    };

    onAttachmentClick = (e) => {
        e.preventDefault();
        this.props.handleImageClick(this.props.index);
    }

    render() {
        const fileInfo = this.props.fileInfo;
        const fileName = fileInfo.name;
        const fileUrl = getFileUrl(fileInfo.id);

        let trimmedFilename;
        if (fileName.length > 35) {
            trimmedFilename = fileName.substring(0, Math.min(35, fileName.length)) + '...';
        } else {
            trimmedFilename = fileName;
        }

        let filenameOverlay;
        if (this.props.compactDisplay) {
            filenameOverlay = (
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    delayShow={1000}
                    placement='top'
                    overlay={<Tooltip id='file-name__tooltip'>{fileName}</Tooltip>}
                >
                    <a
                        href='#'
                        onClick={this.onAttachmentClick}
                        className='post-image__name'
                        rel='noopener noreferrer'
                    >
                        <AttachmentIcon className='icon'/>
                        {trimmedFilename}
                    </a>
                </OverlayTrigger>
            );
        } else if (this.props.canDownload) {
            filenameOverlay = (
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    delayShow={1000}
                    placement='top'
                    overlay={<Tooltip id='file-name__tooltip'>{Utils.localizeMessage('file_attachment.download', 'Download') + ' "' + fileName + '"'}</Tooltip>}
                >
                    <a
                        href={fileUrl}
                        download={fileName}
                        className='post-image__name'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        {trimmedFilename}
                    </a>
                </OverlayTrigger>
            );
        } else {
            filenameOverlay = (
                <span className='post-image__name'>
                    {trimmedFilename}
                </span>
            );
        }

        return (filenameOverlay);
    }
}
