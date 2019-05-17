// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import SizeAwareImage from 'components/size_aware_image';
import ViewImageModal from 'components/view_image';

import * as PostUtils from 'utils/post_utils.jsx';

export default class PostImage extends React.PureComponent {
    static propTypes = {
        hasImageProxy: PropTypes.bool.isRequired,
        imageMetadata: PropTypes.object.isRequired,
        link: PropTypes.string.isRequired,
        post: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
        };
    }

    showModal = (e) => {
        e.preventDefault();

        this.setState({showModal: true});
    }

    hideModal = () => {
        this.setState({showModal: false});
    }

    render() {
        const link = PostUtils.getImageSrc(this.props.link, this.props.hasImageProxy);

        return (
            <div className='post__embed-container'>
                <SizeAwareImage
                    className='img-div attachment__image cursor--pointer'
                    src={link}
                    dimensions={this.props.imageMetadata}
                    showLoader={true}
                    onClick={this.showModal}
                />
                <ViewImageModal
                    show={this.state.showModal}
                    onModalDismissed={this.hideModal}
                    post={this.props.post}
                    startIndex={0}
                    fileInfos={[{
                        has_preview_image: false,
                        link,
                        extension: this.props.imageMetadata.format,
                    }]}
                />
            </div>
        );
    }
}
