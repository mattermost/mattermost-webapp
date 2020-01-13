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
        height: PropTypes.number,
        width: PropTypes.number,
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
            loaded: false,
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

    isHeaderChangeMessage = () => {
        return this.props.postType &&
            this.props.postType === Constants.PostTypes.HEADER_CHANGE;
    }

    componentDidUpdate(prevProps) {
        this.onUpdated(prevProps.src);
    }

    onUpdated = (prevSrc) => {
        if (this.props.src && this.props.src !== prevSrc) {
            this.setState({loadFailed: false});
        }
    }

    handleImageLoaded = ({height, width}) => {
        this.setState({
            loaded: true,
        }, () => { // Call onImageLoaded prop only after state has already been set
            if (this.props.onImageLoaded) {
                this.props.onImageLoaded({height, width});
            }
        });
    }

    render() {
        const {imageMetadata, src, alt, imageIsLink} = this.props;
        if (src === '' || this.state.loadFailed) {
            let className = 'markdown-inline-img broken-image';
            if (this.isHeaderChangeMessage()) {
                className += ' broken-image--scaled-down';
            }

            return (
                <div style={{display: 'inline-block'}}>
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

                    const getFileExtensionFromUrl = (url) => {
                        const index = url.lastIndexOf('.');
                        return index > 0 ? url.substring(index + 1) : null;
                    };
                    const extension = getFileExtensionFromUrl(safeSrc);

                    let className = '';
                    if (this.state.loaded) {
                        className = imageIsLink || !extension ?
                            `${this.props.className} markdown-inline-img--hover markdown-inline-img--no-border` :
                            `${this.props.className} markdown-inline-img--hover cursor--pointer a11y--active`;

                        if (this.isHeaderChangeMessage()) {
                            className += ' markdown-inline-img--scaled-down';
                        }
                    } else {
                        const loadingClass = this.isHeaderChangeMessage() ?
                            'markdown-inline-img--scaled-down-loading' : 'markdown-inline-img--loading';
                        className = `${this.props.className} ${loadingClass}`;
                    }

                    const {height, width, title} = this.props;
                    return (
                        <>
                            <SizeAwareImage
                                alt={alt}
                                className={className}
                                src={safeSrc}
                                height={height}
                                width={width}
                                title={title}
                                dimensions={imageMetadata}
                                showLoader={false}
                                onClick={this.showModal}
                                onImageLoadFail={this.handleLoadFail}
                                onImageLoaded={this.handleImageLoaded}
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
