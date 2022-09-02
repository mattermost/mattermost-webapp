// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import GifPlayer from 'react-gif-player';
export default class PostEmoji extends React.PureComponent {
    static propTypes = {

        name: PropTypes.string,
        imageUrl: PropTypes.string,
        autoplayGifAndEmojis: PropTypes.string,
    }
    constructor(props) {
        super(props);
        this.pauseGif = React.createRef();
        this.state = {
            isPlaying: false,
        };
    }

    render() {
        const emojiText = ':' + this.props.name + ':';

        if (!this.props.imageUrl) {
            return emojiText;
        }

        if (this.props.autoplayGifAndEmojis === 'true') {
            return (
                <span
                    alt={emojiText}
                    className='emoticon'
                    title={emojiText}
                    style={{backgroundImage: 'url(' + this.props.imageUrl + ')'}}
                >
                    {emojiText}
                </span>
            );
        }
        return (
            <span
                className='emoticon'
                alt={emojiText}
                title={emojiText}
            >
                <GifPlayer
                    gif={this.props.imageUrl}
                    pauseRef={(pause) => {
                        this.pauseGif = pause;
                    }}
                    onTogglePlay={(isPlaying) => this.setState({isPlaying})}
                    autoplay={false}
                />
            </span>
        );
    }
}
