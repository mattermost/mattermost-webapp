// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';

import {Client4} from 'mattermost-redux/client';

import {changeOpacity} from 'mattermost-redux/utils/theme_utils';

import './component.css';

function pad2(n) {
    const val = n | 0;
    return val < 10 ? `0${val}` : `${Math.min(val, 99)}`;
}

function pad2nozero(n) {
    const val = n | 0;
    return val < 10 ? `${val}` : `${Math.min(val, 99)}`;
}

export default class PostType extends React.PureComponent {
  static propTypes = {
      post: PropTypes.object.isRequired,
      theme: PropTypes.object.isRequired,
  }

  constructor(props) {
      super(props);
      this.state = {
          player: null,
          currentTime: '0:00',
          duration: '',
          playing: false,
          played: false,
          progress: 0,
      };
  }

  componentDidMount() {
      const post = {...this.props.post};
      const player = document.getElementById(`voice_${post.id}`);

      const duration = player.duration > 0 ? player.duration : post.props.duration / 1000;

      player.addEventListener('timeupdate', (ev) => {
          const secs = Math.round(ev.target.currentTime);
          const progress = Math.round((ev.target.currentTime / duration) * 100);
          this.setState({
              currentTime: pad2nozero(secs / 60) + ':' + pad2(secs % 60),
              progress,
          });
      });

      player.addEventListener('play', () => {
          this.setState({
              playing: true,
              played: true,
          });
      });

      player.addEventListener('playing', () => {
          this.setState({
              playing: true,
          });
      });

      player.addEventListener('pause', () => {
          this.setState({
              playing: false,
          });
      });

      player.addEventListener('error', () => {
          this.setState({
              playing: false,
              played: false,
          });
      });

      player.addEventListener('ended', () => {
          this.setState({
              playing: false,
              played: false,
          });
      });

      this.setState({
          player,
          duration: pad2nozero(Math.round(duration) / 60) + ':' + pad2(Math.round(duration) % 60),
      });
  }

    play = () => {
        if (!this.state.player) {
            return;
        }
        this.state.player.play();
    }

    pause = () => {
        if (!this.state.player) {
            return;
        }
        this.state.player.pause();
    }

    onProgressClick = (ev) => {
        const post = {...this.props.post};
        const duration = this.state.player.duration > 0 ?
            this.state.player.duration : post.props.duration / 1000;
        const rect = ev.target.getBoundingClientRect();
        const seekPos = ev.clientX - rect.left;
        const seekValue = (seekPos / rect.width);
        const seekTime = (duration * seekValue);
        const progress = Math.round((seekTime / duration) * 100);
        const {player} = {...this.state};

        player.currentTime = seekTime;
        this.setState({player, progress});
    }

    render() {
        const theme = this.props.theme;

        const PlayIcon = styled.i`
            &:hover {
                color: ${theme.linkColor};
            }
        `;
        const Progress = styled.progress`
            -webkit-appearance: none;
            -moz-appearance: none;
            background: ${changeOpacity(theme.centerChannelColor, 0.1)};
            color: ${theme.linkColor};
            border: 1px solid ${changeOpacity(theme.centerChannelColor, 0.1)};
            &::-moz-progress-bar {
                background: ${theme.linkColor};
            }
            &::-webkit-progress-bar {
                background: ${changeOpacity(theme.centerChannelColor, 0.1)};
            }
            &::-webkit-progress-value {
                background: ${theme.linkColor};
            }
        `;

        const post = {...this.props.post};
        const recordUrl = Client4.getVoiceRecordRoute(post.id);

        let playIcon;

        if (this.state.playing) {
            playIcon = <PlayIcon onClick={this.pause} className='fa fa-pause'/>;
        } else {
            playIcon = <PlayIcon onClick={this.play} className='fa fa-play'/>;
        }

        let playbackInfo = '0:00';

        if (this.state.played) {
            playbackInfo = this.state.currentTime;
        } else {
            playbackInfo = this.state.duration;
        }

        const playerStyle = {
            backgroundColor: theme.centerChannelBg,
            color: changeOpacity(theme.centerChannelColor, 0.7),
            border: '1px solid ' + changeOpacity(theme.centerChannelColor, 0.2),
        };

        const buttonStyle = {
            width: '12px',
        };

        return (
            <div>
                <div
                    className='voice-player'
                    style={playerStyle}
                >

                    <div style={buttonStyle}>
                        <button className='voice-player-playbutton'>
                            { playIcon }
                        </button>
                    </div>
                    <Progress
                        onClick={this.onProgressClick}
                        className='voice-player-progress'
                        min='0'
                        max='100'
                        value={this.state.progress}
                    />
                    <span>{ playbackInfo }</span>
                </div>
                <audio
                    id={'voice_' + post.id}
                    preload='none'
                >
                    <source
                        src={recordUrl}
                        type='audio/mpeg'
                    />
                </audio>
            </div>
        );
    }
}
