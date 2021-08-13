// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import Post from '../../post_view/post/post';

import './file_preview_modal_header.scss';
import FilePreviewModalInfo from '../file_preview_modal_info/file_preview_modal_info';
import FilePreviewModalMainNav from '../file_preview_modal_main_nav/file_preview_modal_main_nav';
import FilePreviewModalMainActions from '../file_preview_modal_main_actions/file_preview_modal_main_actions';
import {FileInfo} from 'mattermost-redux/types/files';

interface Props {
    isMobile: boolean;
    fileIndex: number;
    fileInfo: FileInfo;
    totalFiles: number;
    filename: string;
    post: React.ComponentProps<typeof Post>;
    fileURL: string;
    showPublicLink?: boolean;
    enablePublicLink: boolean;
    canDownloadFiles: boolean;
    isExternalFile: boolean;
    handlePrev: () => void;
    handleNext: () => void;
    handleModalClose: () => void;
}

const FilePreviewModalHeader: React.FC<Props> = ({post, totalFiles, fileIndex, ...actionProps}: Props) => {
    let mainActions = (<div/>);
    if (totalFiles > 1) {
        mainActions = (
            <FilePreviewModalMainNav
                totalFiles={totalFiles}
                fileIndex={fileIndex}
                handlePrev={actionProps.handlePrev}
                handleNext={actionProps.handleNext}
            />
        );
    }
    const actions = (
        <FilePreviewModalMainActions
            {...actionProps}
            showOnlyClose={actionProps.isMobile}
            usedInside='Header'
        />);
    return (
        <div className='file-preview-modal-header'>
            {actionProps.isMobile && actions}
            {!actionProps.isMobile &&
            <FilePreviewModalInfo
                showFileName={true}
                post={post}
                filename={actionProps.filename}
            />
            }
            {mainActions}
            {!actionProps.isMobile && actions}
        </div>
    );
};

export default memo(FilePreviewModalHeader);

