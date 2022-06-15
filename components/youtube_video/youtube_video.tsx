// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {getVideoId, ytRegex, handleYoutubeTime} from 'utils/youtube';

import ExternalImage from 'components/external_image';
import {OpenGraphMetadata} from '@mattermost/types/posts';

type Props = {
    postId: string;
    link: string;
    show: boolean;
    metadata?: OpenGraphMetadata;
}

type State = {
    playing: boolean;
}

export default class YoutubeVideo extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            playing: false,
        };
    }

    static getDerivedStateFromProps(props: Props, state: State): State | null {
        if (!props.show && state.playing) {
            return {playing: false};
        }
        return null;
    }

    play = () => {
        this.setState({playing: true});
    }

    stop = () => {
        this.setState({playing: false});
    }

    render() {
        const {metadata, link} = this.props;

        const videoId = getVideoId(link);
        const time = handleYoutubeTime(link);

        const header = (
            <h4>
                <span className='video-type'>{'YouTube - '}</span>
                <span className='video-title'>
                    <a
                        href={this.props.link}
                        target='blank'
                        rel='noopener noreferrer'
                    >
                        {metadata?.title || 'unknown'}
                    </a>
                </span>
            </h4>
        );

        let content;

        if (this.state.playing) {
            content = (
                <iframe
                    src={'https://www.youtube.com/embed/' + videoId + '?autoplay=1&autohide=1&border=0&wmode=opaque&fs=1&enablejsapi=1' + time}
                    width='480px'
                    height='360px'
                    frameBorder='0'
                    allowFullScreen={true}
                />
            );
        } else {
            const image = metadata?.images[0];

            content = (
                <div className='embed-responsive video-div__placeholder'>
                    <div className='video-thumbnail__container'>
                        <ExternalImage src={image?.secure_url || image?.url || ''}>
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

    public static isYoutubeLink(link: string): boolean {
        return Boolean(link.trim().match(ytRegex));
    }
}
