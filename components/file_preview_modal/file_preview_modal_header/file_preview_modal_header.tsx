// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import Post from '../../post_view/post/post';

import './file_preview_modal_header.scss';
import FilePreviewModalInfo from '../file_preview_modal_info/file_preview_modal_info';
import FilePreviewModalMainNav from '../file_preview_modal_main_nav/file_preview_modal_main_nav';
import FilePreviewModalMainActions from '../file_preview_modal_main_actions/file_preview_modal_main_actions';
import * as Utils from 'utils/utils.jsx';

interface Props {
    isMobile: boolean;
    fileIndex: number;
    totalFiles: number;
    filename: string;
    post: React.ComponentProps<typeof Post>;
    fileURL: string;
    showPublicLink?: boolean;
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

const FilePreviewModalHeader: React.FC<Props> = (props: Props) => {
    const keysToBeRemoved = ['fileIndex', 'totalFiles', 'post'];
    const actionProps = Utils.deleteKeysFromObject({...props}, keysToBeRemoved);
    return (
        <div className='file-preview-modal-header'>
            {!props.isMobile &&
            <FilePreviewModalInfo
                showFileName={true}
                post={props.post}
                filename={props.filename}
            />
            }
            <FilePreviewModalMainNav
                totalFiles={props.totalFiles}
                fileIndex={props.fileIndex}
                handlePrev={props.handlePrev}
                handleNext={props.handleNext}
            />
            <FilePreviewModalMainActions
                {...actionProps}
                showPublicLink={!props.isMobile}
                showDownload={!props.isMobile}
            />
        </div>
    );
};

export default memo(FilePreviewModalHeader);

