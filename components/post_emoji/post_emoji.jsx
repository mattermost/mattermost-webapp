// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import ReactFreezeframe from './emoji_player';

export default class PostEmoji extends React.PureComponent {
    constructor(props) {
        super(props);
        this.freeze = React.createRef();
        this.state = {
            isPlaying: false,
        };
    }

    render() {
        const start = (e) => {
            this.setState({isPlaying: true});
            this.freeze.current.start();
        };

        const stop = (e) => {
            this.setState({isPlaying: false});
            this.freeze.current.stop();
        };
        const emojiText = ':' + this.props.name + ':';

        if (!this.props.imageUrl) {
            return emojiText;
        }
        return (
            this.props.autoplayGifAndEmojis === 'true' && (!this.props.imageUrl.includes('static') || this.props.imageUrl.includes('static')) ? (
                <span
                    alt={emojiText}
                    className='emoticon'
                    title={emojiText}
                    style={{backgroundImage: 'url(' + this.props.imageUrl + ')'}}
                >
                    {emojiText}
                </span>
            ) : this.props.autoplayGifAndEmojis !== 'true' && this.props.imageUrl.includes('static') ? (
                <span
                    alt={emojiText}
                    className='emoticon'
                    title={emojiText}
                    style={{backgroundImage: 'url(' + this.props.imageUrl + ')'}}
                >
                    {emojiText}
                </span>
            ) : (
                <>
                    <ReactFreezeframe
                        ref={this.freeze}
                        options={{
                            trigger: 'click',
                        }}
                    >
                        <img
                            title={emojiText}
                            style={{marginTop: '-21px'}}
                            src={this.props.imageUrl}
                            alt={emojiText}
                        />
                    </ReactFreezeframe>
                    {this.props.autoplayGifAndEmojis !== 'true' &&
                    <i
                        onClick={() => (this.state.isPlaying ?
                            stop() : start())}
                        className='icon-file-gif'
                        style={{color: 'white', position: 'absolute', marginTop: '-7px', marginLeft: '7px', zIndex: 1}}
                    />
                    }
                </>
            )
        );
    }
}
