import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './GifPlayer.scss';

const GifPlayer = ({ gif, still, playing, toggle,stopPropagation, ...rest }) => (
  <div
    className={classNames('gif_player', { 'playing': playing })}
    onClick={stopPropagation ? undefined : toggle}
  >
    <div className="play_button" />
    <img {...rest} src={playing ? (gif || still) : (still || gif)} />
  </div>
);

GifPlayer.propTypes = {
  gif: PropTypes.string,
  still: PropTypes.string,
  playing: PropTypes.bool,
  toggle: PropTypes.func,
  stopPropagation: PropTypes.bool,
};

export default GifPlayer;