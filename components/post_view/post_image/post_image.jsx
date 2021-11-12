// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {ModalIdentifiers} from 'utils/constants';

import ExternalImage from 'components/external_image';
import SizeAwareImage from 'components/size_aware_image';
import FilePreviewModal from 'components/file_preview_modal';

export default class PostImage extends React.PureComponent {
    static propTypes = {
        imageMetadata: PropTypes.object.isRequired,
        link: PropTypes.string.isRequired,
        post: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            openModal: PropTypes.func.isRequired,
        }).isRequired,
    }

    showModal = (e, link) => {
        e.preventDefault();

        this.props.actions.openModal({
            modalId: ModalIdentifiers.FILE_PREVIEW_MODAL,
            dialogType: FilePreviewModal,
            dialogProps: {
                post: this.props.post,
                startIndex: 0,
                fileInfos: [{
                    has_preview_image: false,
                    link,
                    extension: this.props.imageMetadata.format,
                    name: this.props.link,
                }],
            },
        });
    }

    render() {
        return (
            <div className='post__embed-container'>
                <ExternalImage
                    src={this.props.link}
                    imageMetadata={this.props.imageMetadata}
                >
                    {(safeLink) => (
                        <React.Fragment>
                            <SizeAwareImage
                                className='img-div attachment__image cursor--pointer'
                                src={safeLink}
                                dimensions={this.props.imageMetadata}
                                showLoader={true}
                                onClick={this.showModal}
                            />
                        </React.Fragment>
                    )}
                </ExternalImage>
            </div>
        );
    }
}
