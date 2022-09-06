// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import GifPlayer from 'react-gif-player';
import PropTypes from 'prop-types';

class GIFPlayer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.pauseGif = React.createRef();
        this.state = {
            isPlaying: false,
        };
    }
    static propTypes = {
        src: PropTypes.string,
    }
    render() {
        return (
            <GifPlayer
                gif={this.props.src}
                pauseRef={(pause) => {
                    this.pauseGif = pause;
                }}
                onTogglePlay={(isPlaying) => this.setState({isPlaying})}
                autoplay={false}
            />
        );
    }
}

export default GIFPlayer;
