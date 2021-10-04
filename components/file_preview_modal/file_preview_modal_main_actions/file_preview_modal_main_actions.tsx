// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Tooltip} from 'react-bootstrap';

import {FormattedMessage} from 'react-intl';

import OverlayTrigger from '../../overlay_trigger';
import Constants from '../../../utils/constants';

import './file_preview_modal_main_actions.scss';

import {GlobalState} from '../../../types/store';
import {getFilePublicLink} from 'mattermost-redux/actions/files';
import {getFilePublicLink as selectFilePublicLink} from 'mattermost-redux/selectors/entities/files';
import {copyToClipboard} from '../../../utils/utils';
import {FileInfo} from 'mattermost-redux/types/files';

interface DownloadLinkProps {
    download?: string;
}

interface Props {
    usedInside?: 'Header' | 'Footer';
    showOnlyClose?: boolean;
    showClose?: boolean;
    filename: string;
    fileURL: string;
    fileInfo: FileInfo;
    enablePublicLink: boolean;
    canDownloadFiles: boolean;
    handleModalClose: () => void;
}

const FilePreviewModalMainActions: React.FC<Props> = (props: Props) => {
    const tooltipPlacement = props.usedInside === 'Header' ? 'bottom' : 'top';
    const selectedFilePublicLink = useSelector((state: GlobalState) => selectFilePublicLink(state)?.link);
    const dispatch = useDispatch();
    const [publicLinkCopied, setPublicLinkCopied] = useState(false);

    useEffect(() => {
        dispatch(getFilePublicLink(props.fileInfo.id));
    }, [props.fileInfo]);
    const copyPublicLink = () => {
        copyToClipboard(selectedFilePublicLink ?? '');
        setPublicLinkCopied(true);
    };

    const closeButton = (
        <OverlayTrigger
            delayShow={Constants.OVERLAY_TIME_DELAY}
            key='publicLink'
            placement={tooltipPlacement}
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
    let publicTooltipMessage = (
        <FormattedMessage
            id='view_image_popover.publicLink'
            defaultMessage='Get a public link'
        />
    );
    if (publicLinkCopied) {
        publicTooltipMessage = (
            <FormattedMessage
                id='file_preview_modal_main_actions.public_link-copied'
                defaultMessage='Public link copied'
            />
        );
    }
    const publicLink = (
        <OverlayTrigger
            delayShow={Constants.OVERLAY_TIME_DELAY}
            key='filePreviewPublicLink'
            placement={tooltipPlacement}
            shouldUpdatePosition={true}
            onExit={() => setPublicLinkCopied(false)}
            overlay={
                <Tooltip id='link-variant-icon-tooltip'>
                    {publicTooltipMessage}
                </Tooltip>
            }
        >
            <a
                href='#'
                className='file-preview-modal-main-actions__action-item'
                onClick={copyPublicLink}
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
            placement={tooltipPlacement}
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
            {!props.showOnlyClose && props.enablePublicLink && publicLink}
            {!props.showOnlyClose && props.canDownloadFiles && download}
            {props.showClose && closeButton}
        </div>
    );
};

FilePreviewModalMainActions.defaultProps = {
    showOnlyClose: false,
    usedInside: 'Header',
    showClose: true,
};

export default memo(FilePreviewModalMainActions);
