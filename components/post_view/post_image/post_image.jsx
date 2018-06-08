// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {postListScrollChange} from 'actions/global_actions.jsx';
import * as PostUtils from 'utils/post_utils.jsx';

export default class PostImageEmbed extends React.PureComponent {
    static propTypes = {

        /**
         * The link to load the image from
         */
        link: PropTypes.string.isRequired,

        /**
         * Function to call when image is loaded
         */
        onLinkLoaded: PropTypes.func,

        /**
         * The function to call if image load fails
         */
        onLinkLoadError: PropTypes.func,

        /**
         * The function to call if image is clicked
         */
        handleImageClick: PropTypes.func,

        /**
         * If an image proxy is enabled.
         */
        hasImageProxy: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);

        this.handleLoadComplete = this.handleLoadComplete.bind(this);
        this.handleLoadError = this.handleLoadError.bind(this);

        this.state = {
            loaded: false,
            errored: false,
        };
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        this.loadImg(this.props.link);
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (nextProps.link !== this.props.link) {
            this.setState({
                loaded: false,
                errored: false,
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (!this.state.loaded && prevProps.link !== this.props.link) {
            this.loadImg(this.props.link);
        }
    }

    loadImg(src) {
        const img = new Image();
        img.onload = this.handleLoadComplete;
        img.onerror = this.handleLoadError;
        img.src = PostUtils.getImageSrc(src, this.props.hasImageProxy);
    }

    handleLoadComplete() {
        this.setState({
            loaded: true,
            errored: false,
        });

        postListScrollChange();

        if (this.props.onLinkLoaded) {
            this.props.onLinkLoaded();
        }
    }

    handleLoadError() {
        this.setState({
            errored: true,
            loaded: true,
        });
        if (this.props.onLinkLoadError) {
            this.props.onLinkLoadError();
        }
    }

    onImageClick = (e) => {
        e.preventDefault();
        this.props.handleImageClick();
    };

    render() {
        if (this.state.errored || !this.state.loaded) {
            // scroll pop could be improved with a placeholder when !this.state.loaded
            return null;
        }

        return (
            <div
                className='post__embed-container'
            >
                <img
                    onClick={this.onImageClick}
                    className='img-div cursor--pointer'
                    src={PostUtils.getImageSrc(this.props.link, this.props.hasImageProxy)}
                />
            </div>
        );
    }
}
