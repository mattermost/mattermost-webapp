// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import AttachmentIcon from 'components/widgets/icons/attachment_icon';
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
                <div className={iconClass || 'post-image__name'}>
                    <a
                        href={getFileDownloadUrl(fileInfo.id)}
                        aria-label={localizeMessage('view_image_popover.download', 'Download').toLowerCase()}
                        download={fileName}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        <OverlayTrigger
                            delayShow={1000}
                            placement='top'
                            overlay={
                                <Tooltip id='file-name__tooltip'>
                                    {localizeMessage('view_image_popover.download', 'Download').toLowerCase()}
                                </Tooltip>
                            }
                        >
                            {children || trimmedFilename}
                        </OverlayTrigger>
                    </a>
                </div>
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
