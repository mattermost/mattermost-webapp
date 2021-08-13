// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import Post from '../../post_view/post/post';
import FilePreviewModalInfo from '../file_preview_modal_info/file_preview_modal_info';
import FilePreviewModalMainActions from '../file_preview_modal_main_actions/file_preview_modal_main_actions';

import './file_preview_modal_footer.scss';
import {FileInfo} from 'mattermost-redux/types/files';

interface Props {
    fileInfo: FileInfo;
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

const FilePreviewModalFooter: React.FC<Props> = ({post, ...actionProps}: Props) => {
    return (
        <div className='file-preview-modal-footer'>
            <FilePreviewModalInfo
                showFileName={false}
                post={post}
                filename={actionProps.filename}
            />
            <FilePreviewModalMainActions
                {...actionProps}
                showClose={false}
                usedInside='Footer'
                showOnlyClose={false}
            />
        </div>
    );
};
export default memo(FilePreviewModalFooter);
