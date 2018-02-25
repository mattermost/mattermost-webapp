// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {getFileThumbnailUrl, getFileUrl} from 'mattermost-redux/utils/file_utils';

import FilenameOverlay from 'components/file_attachment/filename_overlay.jsx';
import Constants, {FileTypes} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import loadingGif from 'images/load.gif';

export default class FilePreview extends React.PureComponent {
    static propTypes = {
        onRemove: PropTypes.func.isRequired,
        fileInfos: PropTypes.arrayOf(PropTypes.object).isRequired,
        uploadsInProgress: PropTypes.array,
    };

    static defaultProps = {
        fileInfos: [],
        uploadsInProgress: [],
    };

    constructor(props) {
        super(props);

        this.handleRemove = this.handleRemove.bind(this);
        this.state = {
            fileInfos: [...this.props.fileInfos],
        };
    }

    componentDidUpdate() {
        if (this.props.uploadsInProgress.length > 0) {
            this.refs[this.props.uploadsInProgress[0]].scrollIntoView();
        }
    }

    componentWillReceiveProps(newProps) {
        if (!Utils.areObjectsEqual(this.props.fileInfos, newProps.fileInfos)) {
            this.setState({
                fileInfos: [...newProps.fileInfos],
            });
        }
    }

    handleRemove(id) {
        this.props.onRemove(id);
    }

    render() {
        const previews = [];
        const fileInfos = this.state.fileInfos.sort((a, b) => a.create_at - b.create_at);
        fileInfos.forEach((info, idx) => {
            const type = Utils.getFileType(info.extension);

            let className = 'file-preview post-image__column';
            let previewImage;
            if (type === FileTypes.SVG) {
                previewImage = (
                    <img
                        className='post-image normal'
                        src={getFileUrl(info.id)}
                    />
                );
            } else if (type === FileTypes.IMAGE) {
                let imageClassName = 'post-image';

                if (info.width < Constants.THUMBNAIL_WIDTH && info.height < Constants.THUMBNAIL_HEIGHT) {
                    imageClassName += ' small';
                } else {
                    imageClassName += ' normal';
                }

                let thumbnailUrl = getFileThumbnailUrl(info.id);
                if (Utils.isGIFImage(info.extension) && !info.has_preview_image) {
                    thumbnailUrl = getFileUrl(info.id);
                }

                previewImage = (
                    <div
                        className={imageClassName}
                        style={{
                            backgroundImage: `url(${thumbnailUrl})`,
                            backgroundSize: 'cover',
                        }}
                    />
                );
            } else {
                className += ' custom-file';
                previewImage = <div className={'file-icon ' + Utils.getIconClassName(type)}/>;
            }

            previews.push(
                <div
                    key={info.id}
                    className={className}
                >
                    <div className='post-image__thumbnail'>
                        {previewImage}
                    </div>
                    <div className='post-image__details'>
                        <div className='post-image__detail_wrapper'>
                            <div className='post-image__detail'>
                                <FilenameOverlay
                                    fileInfo={info}
                                    index={idx}
                                    handleImageClick={null}
                                    compactDisplay={false}
                                    canDownload={false}
                                />
                                <span className='post-image__type'>{info.extension.toUpperCase()}</span>
                                <span className='post-image__size'>{Utils.fileSizeToString(info.size)}</span>
                            </div>
                        </div>
                        <div>
                            <a
                                className='file-preview__remove'
                                onClick={this.handleRemove.bind(this, info.id)}
                            >
                                <i className='fa fa-remove'/>
                            </a>
                        </div>
                    </div>
                </div>
            );
        });

        this.props.uploadsInProgress.forEach((clientId) => {
            previews.push(
                <div
                    ref={clientId}
                    key={clientId}
                    className='file-preview'
                    data-client-id={clientId}
                >
                    <img
                        className='spinner'
                        src={loadingGif}
                    />
                    <a
                        className='file-preview__remove'
                        onClick={this.handleRemove.bind(this, clientId)}
                    >
                        <i className='fa fa-remove'/>
                    </a>
                </div>
            );
        });

        return (
            <div
                className='file-preview__container'
                ref='container'
            >
                {previews}
            </div>
        );
    }
}
