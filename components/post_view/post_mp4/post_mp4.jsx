// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import loadingGif from 'images/load.gif';
import {postListScrollChange} from 'actions/global_actions.jsx';
import {changeToJPGSrc, changeToMp4Src} from 'utils/post_utils.jsx';

export default class PostMp4 extends React.PureComponent {
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
    };

    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            errored: false,
        };
    }

    componentWillMount() {
        this.loadVideo(
            changeToMp4Src(this.props.link, this.props.hasImageProxy)
        );
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.link !== this.props.link) {
            this.setState({
                loaded: false,
                errored: false,
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (!this.state.loaded && prevProps.link !== this.props.link) {
            this.loadVideo(
                changeToMp4Src(this.props.link, this.props.hasImageProxy)
            );
        }
    }

    loadVideo(src) {
        const video = document.createElement('video');
        video.onerror = this.handleLoadError;
        video.load = this.handleLoadComplete;
        video.src = src;
        video.load();
    }

    handleLoadComplete = () => {
        this.setState({
            loaded: true,
            errored: false,
        });

        postListScrollChange();

        if (this.props.onLinkLoaded) {
            this.props.onLinkLoaded();
        }
    };

    handleLoadError = () => {
        this.setState({
            errored: true,
            loaded: false,
        });
        if (this.props.onLinkLoadError) {
            this.props.onLinkLoadError();
        }
    };

    onImageClick = (e) => {
        e.preventDefault();
        if (this.props.handleImageClick) {
            this.props.handleImageClick();
        }
    };

    render() {
        if (this.state.errored || !this.state.loaded) {
            return (
                <div className='post__embed-container'>
                    <img
                        className='loader-image'
                        src={loadingGif}
                    />
                </div>
            );
        }
        return (
            <div className='post__embed-container'>
                <video
                    poster={changeToJPGSrc(
                        this.props.link,
                        this.props.hasImageProxy
                    )}
                    preload='auto'
                    autoPlay='autoPlay'
                    muted='true'
                    loop='true'
                    onClick={this.onImageClick}
                    className='img-div cursor--pointer'
                >
                    <source
                        src={changeToMp4Src(
                            this.props.link,
                            this.props.hasImageProxy
                        )}
                        type='video/mp4'
                    />
                </video>
            </div>
        );
    }
}
