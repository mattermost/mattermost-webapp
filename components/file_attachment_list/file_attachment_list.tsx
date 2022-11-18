// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';

import {sortFileInfos} from 'mattermost-redux/utils/file_utils';

import Constants, {FileTypes, ModalIdentifiers} from 'utils/constants';
import {getFileType} from 'utils/utils';

import FileAttachment from 'components/file_attachment';
import SingleImageView from 'components/single_image_view';
import FilePreviewModal from 'components/file_preview_modal';
import VoiceMessageAttachmentPlayer from 'components/voice_message_attachment_player';

import type {OwnProps, PropsFromRedux} from './index';

type Props = OwnProps & PropsFromRedux;

export default function FileAttachmentList(props: Props) {
    const handleImageClick = (indexClicked: number) => {
        props.actions.openModal({
            modalId: ModalIdentifiers.FILE_PREVIEW_MODAL,
            dialogType: FilePreviewModal,
            dialogProps: {
                postId: props.post.id,
                fileInfos: props.fileInfos,
                startIndex: indexClicked,
            },
        });
    };

    const {
        compactDisplay,
        enableSVGs,
        fileInfos,
        fileCount,
        locale,
        isInPermalink,
        post,
    } = props;

    const sortedFileInfos = useMemo(() => sortFileInfos(fileInfos ? [...fileInfos] : [], locale), [fileInfos, locale]);

    if (post.type === Constants.PostTypes.VOICE && fileInfos.length === 1) {
        return (
            <VoiceMessageAttachmentPlayer
                postId={post.id}
                fileId={fileInfos?.[0]?.id ?? ''}
                inPost={true}
            />
        );
    } else if (fileInfos && fileInfos.length === 1 && !fileInfos[0].archived) {
        const fileType = getFileType(fileInfos[0].extension);

        if (fileType === FileTypes.IMAGE || (fileType === FileTypes.SVG && enableSVGs)) {
            return (
                <SingleImageView
                    fileInfo={fileInfos[0]}
                    isEmbedVisible={props.isEmbedVisible}
                    postId={props.post.id}
                    compactDisplay={compactDisplay}
                    isInPermalink={isInPermalink}
                />
            );
        }
    } else if (fileCount === 1 && props.isEmbedVisible && !fileInfos?.[0]) {
        return (
            <div style={style.minHeightPlaceholder}/>
        );
    }

    const postFiles = [];
    if (sortedFileInfos && sortedFileInfos.length > 0) {
        for (let i = 0; i < sortedFileInfos.length; i++) {
            const fileInfo = sortedFileInfos[i];
            postFiles.push(
                <FileAttachment
                    key={fileInfo.id}
                    fileInfo={sortedFileInfos[i]}
                    index={i}
                    handleImageClick={handleImageClick}
                    compactDisplay={compactDisplay}
                    handleFileDropdownOpened={props.handleFileDropdownOpened}
                />,
            );
        }
    } else if (fileCount > 0) {
        for (let i = 0; i < fileCount; i++) {
            // Add a placeholder to avoid pop-in once we get the file infos for this post
            postFiles.push(
                <div
                    key={`fileCount-${i}`}
                    className='post-image__column post-image__column--placeholder'
                />,
            );
        }
    }

    return (
        <div
            data-testid='fileAttachmentList'
            className='post-image__columns clearfix'
        >
            {postFiles}
        </div>
    );
}

const style = {
    minHeightPlaceholder: {minHeight: '385px'},
};
