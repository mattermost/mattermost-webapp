// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {sortFileInfos} from 'mattermost-redux/utils/file_utils';

import {FileTypes} from 'utils/constants.jsx';
import {getFileType} from 'utils/utils';

import FileAttachment from 'components/file_attachment';
import SingleImageView from 'components/single_image_view';
import ViewImageModal from 'components/view_image';

export default class FileAttachmentList extends React.Component {
    static propTypes = {

        /*
         * The post the files are attached to
         */
        post: PropTypes.object.isRequired,

        /*
         * The number of files attached to the post
         */
        fileCount: PropTypes.number.isRequired,

        /*
         * Sorted array of metadata for each file attached to the post
         */
        fileInfos: PropTypes.arrayOf(PropTypes.object),

        /*
         * Set to render compactly
         */
        compactDisplay: PropTypes.bool,

        isEmbedVisible: PropTypes.bool,

        locale: PropTypes.string.isRequired,

        actions: PropTypes.shape({

            /*
             * Function to get file metadata for a post
             */
            getMissingFilesForPost: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.handleImageClick = this.handleImageClick.bind(this);

        this.state = {showPreviewModal: false, startImgIndex: 0};
    }

    componentDidMount() {
        if (this.props.post.file_ids || this.props.post.filenames) {
            this.props.actions.getMissingFilesForPost(this.props.post.id);
        }
    }

    handleImageClick(indexClicked) {
        this.setState({showPreviewModal: true, startImgIndex: indexClicked});
    }

    hidePreviewModal = () => {
        this.setState({showPreviewModal: false});
    }

    render() {
        const {
            compactDisplay,
            fileInfos,
            fileCount,
            locale,
        } = this.props;

        if (compactDisplay === false) {
            if (fileInfos && fileInfos.length === 1) {
                const fileType = getFileType(fileInfos[0].extension);

                if (fileType === FileTypes.IMAGE || fileType === FileTypes.SVG) {
                    return (
                        <SingleImageView
                            fileInfo={fileInfos[0]}
                            isEmbedVisible={this.props.isEmbedVisible}
                            post={this.props.post}
                        />
                    );
                }
            } else if (fileCount === 1 && this.props.isEmbedVisible) {
                return (
                    <div style={style.minHeightPlaceholder}/>
                );
            }
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
                    />
                );
            }
        } else if (fileCount > 0) {
            for (let i = 0; i < fileCount; i++) {
                // Add a placeholder to avoid pop-in once we get the file infos for this post
                postFiles.push(
                    <div
                        key={`fileCount-${i}`}
                        className='post-image__column post-image__column--placeholder'
                    />
                );
            }
        }

        return (
            <React.Fragment>
                <div className='post-image__columns clearfix'>
                    {postFiles}
                </div>
                <ViewImageModal
                    show={this.state.showPreviewModal}
                    onModalDismissed={this.hidePreviewModal}
                    startIndex={this.state.startImgIndex}
                    fileInfos={sortedFileInfos}
                />
            </React.Fragment>
        );
    }
}

const style = {
    minHeightPlaceholder: {minHeight: '385px'},
};
