// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {sortFileInfos} from 'mattermost-redux/utils/file_utils';
import {FileInfo} from 'mattermost-redux/types/files';
import {Post} from 'mattermost-redux/types/posts';

import {FileTypes, ModalIdentifiers} from 'utils/constants';
import {getFileType} from 'utils/utils';

import FileAttachment from 'components/file_attachment';
import SingleImageView from 'components/single_image_view';
import FilePreviewModal from 'components/file_preview_modal';

import type {OwnProps, PropsFromRedux} from './index';

type Props = OwnProps & PropsFromRedux;

export default class FileAttachmentList extends React.PureComponent<Props> {
    handleImageClick = (indexClicked: number, postId: Post['id'], fileInfos: FileInfo[]) => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.FILE_PREVIEW_MODAL,
            dialogType: FilePreviewModal,
            dialogProps: {
                postId,
                fileInfos,
                startIndex: indexClicked,
            },
        });
    }

    render() {
        const {
            compactDisplay,
            enableSVGs,
            fileInfos,
            fileCount,
            locale,
        } = this.props;

        if (fileInfos && fileInfos.length === 1) {
            const fileType = getFileType(fileInfos[0].extension);

            if (fileType === FileTypes.IMAGE || (fileType === FileTypes.SVG && enableSVGs)) {
                return (
                    <SingleImageView
                        fileInfo={fileInfos[0]}
                        isEmbedVisible={this.props.isEmbedVisible}
                        postId={this.props.post.id}
                        compactDisplay={compactDisplay}
                    />
                );
            }
        } else if (fileCount === 1 && this.props.isEmbedVisible) {
            return (
                <div style={style.minHeightPlaceholder}/>
            );
        }

        const sortedFileInfos = sortFileInfos(fileInfos, locale);
        const postFiles = [];
        if (sortedFileInfos && sortedFileInfos.length > 0) {
            for (let i = 0; i < sortedFileInfos.length; i++) {
                const fileInfo = sortedFileInfos[i];
                postFiles.push(
                    <FileAttachment
                        key={fileInfo.id}
                        fileInfo={sortedFileInfos[i]}
                        fileInfos={sortedFileInfos}
                        postId={this.props.post.id}
                        index={i}
                        handleImageClick={this.handleImageClick}
                        compactDisplay={compactDisplay}
                        handleFileDropdownOpened={this.props.handleFileDropdownOpened}
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
}

const style = {
    minHeightPlaceholder: {minHeight: '385px'},
};
