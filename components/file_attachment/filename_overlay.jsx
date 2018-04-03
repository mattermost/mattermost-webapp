// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import AttachmentIcon from 'components/svg/attachment_icon';
import {trimFilename} from 'utils/file_utils';
import {localizeMessage} from 'utils/utils.jsx';

export default class FilenameOverlay extends React.PureComponent {
    static propTypes = {

        /*
         * File detailed information
         */
        fileInfo: PropTypes.object.isRequired,

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
        canDownload: PropTypes.bool,

        /**
         * Optional children like download icon
         */
        children: PropTypes.element,

        /**
         * Optional class like for icon
         */
        iconClass: PropTypes.string,
    };

    render() {
        const {
            canDownload,
            children,
            compactDisplay,
            fileInfo,
            handleImageClick,
            iconClass,
        } = this.props;

        const fileName = fileInfo.name;
        const trimmedFilename = trimFilename(fileName);

        let filenameOverlay;
        if (compactDisplay) {
            filenameOverlay = (
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    delayShow={1000}
                    placement='top'
                    overlay={<Tooltip id='file-name__tooltip'>{fileName}</Tooltip>}
                >
                    <a
                        href='#'
                        onClick={handleImageClick}
                        className='post-image__name'
                        rel='noopener noreferrer'
                    >
                        <AttachmentIcon className='icon'/>
                        {trimmedFilename}
                    </a>
                </OverlayTrigger>
            );
        } else if (canDownload) {
            filenameOverlay = (
                <a
                    href={getFileDownloadUrl(fileInfo.id)}
                    download={fileName}
                    className={iconClass || 'post-image__name'}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <OverlayTrigger
                        trigger={['hover', 'focus']}
                        delayShow={1000}
                        placement='top'
                        overlay={
                            <Tooltip id='file-name__tooltip'>
                                {localizeMessage('file_attachment.download', 'Download')}
                            </Tooltip>
                        }
                    >
                        {children || trimmedFilename}
                    </OverlayTrigger>
                </a>
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
