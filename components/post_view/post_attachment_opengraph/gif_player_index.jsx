// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import PropTypes from 'prop-types';

import {polyfill} from 'react-lifecycles-compat';

import GifPlayer from './gif_player.jsx';

const preload = (src, callback) => {
    var img = new Image();
    if (typeof callback === 'function') {
        console.log(src)
        img.onload = () => callback(img);
        img.setAttribute('crossorigin', 'Anonymous');
    }
    img.src = src;
};

const firstGifFrameUrl = (img) => {
    const canvas = document.createElement('canvas');
    if (typeof canvas.getContext !== 'function') {
        return null;
    }
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL();
};

class GifPlayerContainer extends React.Component {
    static getDerivedStateFromProps(nextProps, prevState) {
        const prevGif = prevState.providedGif;
        const nextGif = nextProps.gif;
        const prevStill = prevState.providedStill;
        const nextStill = nextProps.still;
        if (prevGif === nextGif && prevStill === nextStill) {
            return null;
        }

        return {
            playing: nextGif && nextProps.autoplay && prevGif !== nextGif ?
                true :
                prevState.playing,
            providedGif: nextGif,
            providedStill: nextStill,
            actualGif: nextGif,
            actualStill: nextStill || prevGif !== nextGif ?
                nextStill :
                prevState.actualStill,
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            playing: Boolean(props.autoplay),
            providedGif: props.gif,
            providedStill: props.still,
            actualGif: props.gif,
            actualStill: props.still,
        };
        this.updateId = -1;
    }

    componentDidMount() {
        if (typeof this.props.pauseRef === 'function') {
            this.props.pauseRef(() => this.setState({playing: false}));
        }
        this.updateImages();
    }

    componentDidUpdate(prevProps, prevState) {
        this.updateImages(prevState);
        const {onTogglePlay} = this.props;
        if (prevState.playing !== this.state.playing && typeof onTogglePlay === 'function') {
            onTogglePlay(this.state.playing);
        }
    }

    updateImages(prevState = {}) {
        const {providedGif, providedStill} = this.state;
        if (
            providedGif &&
      !providedStill &&
      providedGif !== prevState.providedGif
        ) {
            const updateId = ++this.updateId;
            preload(providedGif, (img) => {
                if (this.updateId === updateId) {
                    const actualStill = firstGifFrameUrl(img);
                    if (actualStill) {
                        this.setState({actualStill});
                    }
                }
            });
        }
    }

    toggle() {
        this.setState({
            playing: !this.state.playing,
        });
    }

    render() {
        // extract these props but pass down the rest
        const {actualGif, actualStill, playing} = this.state;
        return (
            <GifPlayer
                gif={actualGif}
                still={actualStill}
                playing={playing}
                toggle={() => this.toggle()}
                stopPropagation={this.props.stopPropagation}
                playButton={this.props.playButton}
            />
        );
    }
}

polyfill(GifPlayerContainer);

GifPlayerContainer.propTypes = {
    gif: PropTypes.string,
    still: PropTypes.string,
    autoplay: PropTypes.bool,
    pauseRef: PropTypes.func,
    onTogglePlay: PropTypes.func,
    stopPropagation: PropTypes.bool,
    playButton: PropTypes.bool,
};

export default GifPlayerContainer;
