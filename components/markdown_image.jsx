// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import ExternalImage from 'components/external_image';
import SizeAwareImage from 'components/size_aware_image';
import ViewImageModal from 'components/view_image';

export default class MarkdownImage extends React.PureComponent {
    static defaultProps = {
        imageMetadata: {},
    };

    static propTypes = {
        alt: PropTypes.string,
        imageMetadata: PropTypes.object,
        src: PropTypes.string.isRequired,
        title: PropTypes.string,
        className: PropTypes.string.isRequired,
        postId: PropTypes.string.isRequired,
        imageIsLink: PropTypes.bool.isRequired,
        onImageLoaded: PropTypes.func,
    }

    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
        };
    }

    showModal = (e) => {
        if (!this.props.imageIsLink) {
            e.preventDefault();
            this.setState({showModal: true});
        }
    }

    hideModal = () => {
        this.setState({showModal: false});
    }

    render() {
        const {imageMetadata, src, imageIsLink} = this.props;

        return (
            <ExternalImage
                src={src}
                imageMetadata={imageMetadata}
            >
                {(safeSrc) => {
                    if (!safeSrc) {
                        return (
                            <a
                                className='theme markdown__link'
                                href={src}
                                rel='noopener noreferrer'
                                target='_blank'
                                title={this.props.title}
                            >
                                {this.props.alt}
                            </a>
                        );
                    }

                    const getFileExtentionFromUrl = (url) => {
                        const index = url.lastIndexOf('.');
                        return index > 0 ? url.substring(index + 1) : null;
                    };
                    const extension = getFileExtentionFromUrl(safeSrc);

                    const className = imageIsLink || !extension ?
                        this.props.className :
                        `${this.props.className} markdown-inline-img--hover cursor--pointer a11y--active`;

                    return (
                        <>
                            <SizeAwareImage
                                alt={this.props.alt}
                                className={className}
                                src={safeSrc}
                                dimensions={imageMetadata}
                                showLoader={true}
                                onClick={this.showModal}
                                onImageLoaded={this.props.onImageLoaded}
                                handleSmallImageContainer={!imageIsLink}
                            />
                            {!imageIsLink && extension &&
                                <ViewImageModal
                                    show={this.state.showModal}
                                    onModalDismissed={this.hideModal}
                                    postId={this.props.postId}
                                    startIndex={0}
                                    fileInfos={[{
                                        has_preview_image: false,
                                        link: safeSrc,
                                        extension: imageMetadata.format || extension,
                                        name: this.props.alt,
                                    }]}
                                />
                            }
                        </>
                    );
                }}
            </ExternalImage>
        );
    }
}