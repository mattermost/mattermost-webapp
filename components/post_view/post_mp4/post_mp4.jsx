// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

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
        hasImageProxy: PropTypes.bool.isRequired
    }

    constructor(props) {
        super(props);

        this.handleLoadComplete = this.handleLoadComplete.bind(this);
        this.handleLoadError = this.handleLoadError.bind(this);

        this.state = {
            loaded: false,
            errored: false
        };
    }

    componentWillMount() {
        this.loadVideo(PostUtils.changeToMp4Src(this.props.link, this.props.hasImageProxy));
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.link !== this.props.link) {
            this.setState({
                loaded: false,
                errored: false
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (!this.state.loaded && prevProps.link !== this.props.link) {
            this.loadVideo(PostUtils.changeToMp4Src(this.props.link, this.props.hasImageProxy));
        }
    }

    loadVideo(src) {
        const video = document.createElement('video');
        video.onerror = this.handleLoadError;
        video.load = this.handleLoadComplete;
        video.src = src;
        video.load();
    }

    handleLoadComplete() {
        this.setState({
            loaded: true,
            errored: false
        });

        postListScrollChange();

        if (this.props.onLinkLoaded) {
            this.props.onLinkLoaded();
        }
    }

    handleLoadError() {
        this.setState({
            errored: true,
            loaded: true
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
                <video
                    poster={PostUtils.changeToJPGSrc(this.props.link, this.props.hasImageProxy)}
                    preload='auto'
                    autoPlay='autoPlay'
                    muted='true'
                    loop='true'
                    onClick={this.onImageClick}
                    className='img-div cursor--pointer'
                >
                    <source
                        src={PostUtils.changeToMp4Src(this.props.link, this.props.hasImageProxy)}
                        type='video/mp4'
                    />
                </video>
            </div>
        );
    }
}
