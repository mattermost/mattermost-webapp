// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Constants from 'utils/constants.jsx';

import ExternalImage from 'components/external_image';
import SizeAwareImage from 'components/size_aware_image';
import ViewImageModal from 'components/view_image';

import brokenImageIcon from 'images/icons/brokenimage.png';

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
        postType: PropTypes.string,
    }

    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
            loadFailed: false,
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

    handleLoadFail = () => {
        this.setState({loadFailed: true});
    }

    handleImageLoaded = ({height, width}) => {
        if (this.state.loadFailed) {
            this.setState({loadFailed: false});
        }
        this.props.onImageLoaded({height, width});
    }

    isHeaderChangeMessage = () => {
        return this.props.postType &&
            this.props.postType === Constants.PostTypes.HEADER_CHANGE;
    }

    render() {
        const {imageMetadata, src, alt, imageIsLink} = this.props;
        if (src === '' || this.state.loadFailed) {
            let className = 'markdown-inline-img broken-image';
            if (this.isHeaderChangeMessage()) {
                className += ' broken-image--scaled-down';
            }

            return (
                <div className={'style--none'}>
                    <img
                        className={className}
                        alt={alt}
                        src={brokenImageIcon}
                    />
                </div>
            );
        }
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
                                {alt}
                            </a>
                        );
                    }

                    const getFileExtentionFromUrl = (url) => {
                        const index = url.lastIndexOf('.');
                        return index > 0 ? url.substring(index + 1) : null;
                    };
                    const extension = getFileExtentionFromUrl(safeSrc);

                    let className = imageIsLink || !extension ?
                        `${this.props.className} markdown-inline-img--hover markdown-inline-img--no-border` :
                        `${this.props.className} markdown-inline-img--hover cursor--pointer a11y--active`;

                    if (this.isHeaderChangeMessage()) {
                        className += ' markdown-inline-img--scaled-down';
                    }

                    return (
                        <>
                            <SizeAwareImage
                                alt={alt}
                                className={className}
                                src={safeSrc}
                                dimensions={imageMetadata}
                                showLoader={false}
                                onClick={this.showModal}
                                onImageLoadFail={this.handleLoadFail}
                                onImageLoaded={this.props.onImageLoaded}
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
                                    name: alt,
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
