// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import ReactFreezeframe from 'react-freezeframe';
export default class PostEmoji extends React.PureComponent {
    static propTypes = {

        name: PropTypes.string,
        imageUrl: PropTypes.string,
        autoplayGifAndEmojis: PropTypes.string,
    }
    constructor(props) {
        super(props);
        this.freeze = React.createRef();
        this.state = {
            isPlaying: false,
        };
    }

    render() {
        const start = () => {
            this.setState({isPlaying: true});
            this.freeze.current.start();
        };

        const stop = () => {
            this.setState({isPlaying: false});
            this.freeze.current.stop();
        };
        const emojiText = ':' + this.props.name + ':';

        if (!this.props.imageUrl) {
            return emojiText;
        }
        if (this.props.autoplayGifAndEmojis === 'true' && (!this.props.imageUrl.includes('static') || this.props.imageUrl.includes('static'))) {
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
        } else if (this.props.autoplayGifAndEmojis !== 'true' && this.props.imageUrl.includes('static')) {
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
            <div style={{width: '32px', height: '32px'}}>
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
                    style={{color: 'white', position: 'absolute', marginTop: '-34px', marginLeft: '7px', zIndex: 1}}
                />
                }
            </div>
        );
    }
}
