// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import ExternalImage from 'components/external_image';

const ytRegex = /(?:http|https):\/\/(?:www\.|m\.)?(?:(?:youtube\.com\/(?:(?:v\/)|(?:(?:watch|embed\/watch)(?:\/|.*v=))|(?:embed\/)|(?:user\/[^/]+\/u\/[0-9]\/)))|(?:youtu\.be\/))([^#&?]*)/;

export default class YoutubeVideo extends React.PureComponent {
    static propTypes = {
        link: PropTypes.string.isRequired,
        show: PropTypes.bool.isRequired,
        metadata: PropTypes.object,
    }

    constructor(props) {
        super(props);

        this.state = {
            playing: false,
        };
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        this.updateStateFromProps(this.props);
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        this.updateStateFromProps(nextProps);
    }

    updateStateFromProps = (props) => {
        const link = props.link;

        const match = link.trim().match(ytRegex);
        if (!match || match[1].length !== 11) {
            return;
        }

        if (props.show === false) {
            this.stop();
        }

        this.setState({
            videoId: match[1],
            time: this.handleYoutubeTime(link),
        });
    }

    handleYoutubeTime(link) {
        const timeRegex = /[\\?&](t|start|time_continue)=([0-9]+h)?([0-9]+m)?([0-9]+s?)/;

        const time = link.match(timeRegex);
        if (!time || !time[0]) {
            return '';
        }

        const hours = time[2] ? time[2].match(/([0-9]+)h/) : null;
        const minutes = time[3] ? time[3].match(/([0-9]+)m/) : null;
        const seconds = time[4] ? time[4].match(/([0-9]+)s?/) : null;

        let ticks = 0;

        if (hours && hours[1]) {
            ticks += parseInt(hours[1], 10) * 3600;
        }

        if (minutes && minutes[1]) {
            ticks += parseInt(minutes[1], 10) * 60;
        }

        if (seconds && seconds[1]) {
            ticks += parseInt(seconds[1], 10);
        }

        return '&start=' + ticks.toString();
    }

    play = () => {
        this.setState({playing: true});
    }

    stop = () => {
        this.setState({playing: false});
    }

    render() {
        const {metadata} = this.props;

        const header = (
            <h4>
                <span className='video-type'>{'YouTube - '}</span>
                <span className='video-title'>
                    <a
                        href={this.props.link}
                        target='blank'
                        rel='noopener noreferrer'
                    >
                        {metadata.title}
                    </a>
                </span>
            </h4>
        );

        let content;

        if (this.state.playing) {
            content = (
                <iframe
                    src={'https://www.youtube.com/embed/' + this.state.videoId + '?autoplay=1&autohide=1&border=0&wmode=opaque&fs=1&enablejsapi=1' + this.state.time}
                    width='480px'
                    height='360px'
                    type='text/html'
                    frameBorder='0'
                    allowFullScreen='allowfullscreen'
                />
            );
        } else {
            const image = metadata.images[0];

            content = (
                <div className='embed-responsive video-div__placeholder'>
                    <div className='video-thumbnail__container'>
                        <ExternalImage src={image.secure_url || image.url}>
                            {(safeUrl) => (
                                <img
                                    src={safeUrl}
                                    alt='youtube video thumbnail'
                                    className='video-thumbnail'
                                />
                            )}
                        </ExternalImage>
                        <div className='block'>
                            <span className='play-button'><span/></span>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div
                className='post__embed-container'
            >
                <div>
                    {header}
                    <div
                        className='video-div embed-responsive-item'
                        onClick={this.play}
                    >
                        {content}
                    </div>
                </div>
            </div>
        );
    }

    static isYoutubeLink(link) {
        return link.trim().match(ytRegex);
    }
}
