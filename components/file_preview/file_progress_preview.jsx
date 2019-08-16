// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {ProgressBar} from 'react-bootstrap';

import FilenameOverlay from 'components/file_attachment/filename_overlay.jsx';
import RemoveIcon from 'components/widgets/icons/fa_remove_icon';
import {getFileTypeFromMime} from 'utils/file_utils';
import * as Utils from 'utils/utils.jsx';

export default class FileProgressPreview extends React.PureComponent {
    static propTypes = {
        handleRemove: PropTypes.func.isRequired,
        clientId: PropTypes.string.isRequired,
        fileInfo: PropTypes.object,
    };

    handleRemove = () => {
        this.props.handleRemove(this.props.clientId);
    }

    render() {
        let percent = 0;
        let fileNameComponent;
        let previewImage;
        const {fileInfo, clientId} = this.props;

        if (fileInfo) {
            percent = fileInfo.percent;
            const percentTxt = percent && ` (${percent.toFixed(0)}%)`;
            const fileType = getFileTypeFromMime(fileInfo.type);
            previewImage = <div className={'file-icon ' + Utils.getIconClassName(fileType)}/>;

            fileNameComponent = (
                <React.Fragment>
                    <FilenameOverlay
                        fileInfo={fileInfo}
                        index={clientId}
                        handleImageClick={null}
                        compactDisplay={false}
                        canDownload={false}
                    />
                    <span className='post-image__uploadingTxt'>
                        {percent === 100 ? (
                            <FormattedMessage
                                id='create_post.fileProcessing'
                                defaultMessage='Processing...'
                            />
                        ) : (
                            <React.Fragment>
                                <FormattedMessage
                                    id='admin.plugin.uploading'
                                    defaultMessage='Uploading...'
                                />
                                <span>{percentTxt}</span>
                            </React.Fragment>
                        )}
                    </span>
                    {percent && (
                        <ProgressBar
                            className='post-image__progressBar'
                            now={percent}
                            active={percent === 100}
                        />
                    )}
                </React.Fragment>
            );
        }

        return (
            <div
                ref={clientId}
                key={clientId}
                className='file-preview post-image__column'
                data-client-id={clientId}
            >
                <div className='post-image__thumbnail'>
                    {previewImage}
                </div>
                <div className='post-image__details'>
                    <div className='post-image__detail_wrapper'>
                        <div className='post-image__detail'>
                            {fileNameComponent}
                        </div>
                    </div>
                    <div>
                        <a
                            className='file-preview__remove'
                            onClick={this.handleRemove}
                        >
                            <RemoveIcon/>
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}
