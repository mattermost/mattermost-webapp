// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import {Tooltip} from 'react-bootstrap';

import {FormattedMessage} from 'react-intl';

import OverlayTrigger from '../../overlay_trigger';
import Constants from '../../../utils/constants';

import './file_preview_modal_main_actions.scss';

interface DownloadLinkProps {
    download?: string;
}

interface Props {
    showClose?: boolean;
    showDownload?: boolean;
    showPublicLink?: boolean;
    filename: string;
    fileURL: string;
    enablePublicLink: boolean;
    canDownloadFiles: boolean;
    isExternalFile: boolean;
    onGetPublicLink?: () => void;
    handlePrev: () => void;
    handleNext: () => void;
    handleModalClose: () => void;
    children?: string;
    disabled?: boolean;
    className?: string;
}

const FilePreviewModalMainActions: React.FC<Props> = (props: Props) => {
    const closeButton = (
        <OverlayTrigger
            delayShow={Constants.OVERLAY_TIME_DELAY}
            key='publicLink'
            placement='bottom'
            overlay={
                <Tooltip id='close-icon-tooltip'>
                    <FormattedMessage
                        id='full_screen_modal.close'
                        defaultMessage='Close'
                    />
                </Tooltip>
            }
        >
            <button
                className='file-preview-modal-main-actions__action-item'
                onClick={props.handleModalClose}
            >
                <i className='icon icon-close'/>
            </button>
        </OverlayTrigger>
    );
    const publicLink = (
        <OverlayTrigger
            delayShow={Constants.OVERLAY_TIME_DELAY}
            key='filePreviewPublicLink'
            placement='bottom'
            overlay={
                <Tooltip id='link-variant-icon-tooltip'>
                    <FormattedMessage
                        id='view_image_popover.publicLink'
                        defaultMessage='Get a public link'
                    />
                </Tooltip>
            }
        >
            <a
                href='#'
                className='file-preview-modal-main-actions__action-item'
                onClick={props.handleModalClose}
            >
                <i className='icon icon-link-variant'/>
            </a>
        </OverlayTrigger>
    );
    const downloadLinkProps: DownloadLinkProps = {};
    downloadLinkProps.download = props.filename;
    const download = (
        <OverlayTrigger
            delayShow={Constants.OVERLAY_TIME_DELAY}
            key='download'
            placement='bottom'
            overlay={
                <Tooltip id='download-icon-tooltip'>
                    <FormattedMessage
                        id='view_image_popover.download'
                        defaultMessage='Download'
                    />
                </Tooltip>
            }
        >
            <a
                href={props.fileURL}
                className='file-preview-modal-main-actions__action-item'
                target='_blank'
                rel='noopener noreferrer'
                download={props.filename}
            >
                <i className='icon icon-download-outline'/>
            </a>
        </OverlayTrigger>
    );
    return (
        <div className='file-preview-modal-main-actions__actions'>
            {props.showPublicLink && publicLink}
            {props.showDownload && download}
            {props.showClose && closeButton}
        </div>
    );
};

FilePreviewModalMainActions.defaultProps = {
    showClose: true,
    showDownload: true,
    showPublicLink: true,
};

export default memo(FilePreviewModalMainActions);
