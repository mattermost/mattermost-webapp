// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './GifPlayer.scss';

const GifPlayer = ({gif, still, playing, toggle, stopPropagation, playButton, ...rest}) => (
    <div
        className={classNames('gif_player', {playing})}
        onClick={stopPropagation ? undefined : toggle}
    >
        <div className={playButton ? 'play_button' : ''}/>
        <img
            {...rest}
            src={playing ? (gif || still) : (still || gif)}
        />
    </div>
);

GifPlayer.propTypes = {
    gif: PropTypes.string,
    still: PropTypes.string,
    playing: PropTypes.bool,
    toggle: PropTypes.func,
    stopPropagation: PropTypes.bool,
    playButton: PropTypes.bool,
};

export default GifPlayer;
