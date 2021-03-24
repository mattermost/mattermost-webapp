// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {sortFileInfos} from 'mattermost-redux/utils/file_utils';

import {FileInfo} from 'mattermost-redux/types/files';
import {Post} from 'mattermost-redux/types/posts';

import {FileTypes} from 'utils/constants';
import {getFileType} from 'utils/utils';

import FileAttachment from 'components/file_attachment';
import SingleImageView from 'components/single_image_view';
import ViewImageModal from 'components/view_image';

export type Props = {

    /*
     * The post the files are attached to
     */
    post: Post;
    fileCount: number;

    /*
     * Sorted array of metadata for each file attached to the post
     */
    fileInfos: FileInfo[];

    compactDisplay?: boolean;
    enableSVGs?: boolean;
    isEmbedVisible?: boolean;
    locale: string;

}

type State = {
    showPreviewModal: boolean;
    startImgIndex: number;
}

export default class FileAttachmentList extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {showPreviewModal: false, startImgIndex: 0};
    }

    handleImageClick = (indexClicked: number) => {
        this.setState({showPreviewModal: true, startImgIndex: indexClicked});
    }

    hidePreviewModal = () => {
        this.setState({showPreviewModal: false});
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
                        index={i}
                        handleImageClick={this.handleImageClick}
                        compactDisplay={compactDisplay}
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
            <>
                <div
                    data-testid='fileAttachmentList'
                    className='post-image__columns clearfix'
                >
                    {postFiles}
                </div>
                <ViewImageModal
                    show={this.state.showPreviewModal}
                    onModalDismissed={this.hidePreviewModal}
                    startIndex={this.state.startImgIndex}
                    fileInfos={sortedFileInfos}
                    postId={this.props.post.id}
                />
            </>
        );
    }
}

const style = {
    minHeightPlaceholder: {minHeight: '385px'},
};
