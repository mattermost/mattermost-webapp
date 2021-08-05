// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import Post from '../../post_view/post/post';
import FilePreviewModalInfo from '../file_preview_modal_info/file_preview_modal_info';
import FilePreviewModalMainActions from '../file_preview_modal_main_actions/file_preview_modal_main_actions';
import * as Utils from '../../../utils/utils';

import './file_preview_modal_footer.scss';

interface Props {
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

const FilePreviewModalFooter: React.FC<Props> = (props: Props) => {
    const keysToBeRemoved = ['fileIndex', 'totalFiles', 'post'];
    const actionProps = Utils.deleteKeysFromObject({...props}, keysToBeRemoved);
    return (
        <div className='file-preview-modal-footer'>
            <FilePreviewModalInfo
                showFileName={false}
                post={props.post}
                filename={props.filename}
            />
            <FilePreviewModalMainActions
                {...actionProps}
                showClose={false}
            />
        </div>
    );
};
export default memo(FilePreviewModalFooter);
