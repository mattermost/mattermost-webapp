// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';
import {FileInfo} from 'mattermost-redux/types/files';

import OverlayTrigger from 'components/overlay_trigger';
import AttachmentIcon from 'components/widgets/icons/attachment_icon';
import {trimFilename} from 'utils/file_utils';
import {localizeMessage} from 'utils/utils.jsx';

type Props = {

    /*
     * File detailed information
     */
    fileInfo: FileInfo;

    /*
     * Handler for when the thumbnail is clicked passed the index above
     */
    handleImageClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;

    /*
     * Display in compact format
     */
    compactDisplay?: boolean;

    /*
     * If it should display link to download on file name
     */
    canDownload?: boolean;

    /*
     * Optional children like download icon
     */
    children?: React.ReactNode;

    /*
     * Optional class like for icon
     */
    iconClass?: string;
}

export default class FilenameOverlay extends React.PureComponent<Props> {
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
                        id='file-attachment-link'
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
                    <OverlayTrigger
                        delayShow={1000}
                        placement='top'
                        overlay={
                            <Tooltip id='file-name__tooltip'>
                                {localizeMessage('view_image_popover.download', 'Download')}
                            </Tooltip>
                        }
                    >
                        <a
                            href={getFileDownloadUrl(fileInfo.id)}
                            aria-label={localizeMessage('view_image_popover.download', 'Download').toLowerCase()}
                            download={fileName}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            {children || trimmedFilename}
                        </a>
                    </OverlayTrigger>
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
