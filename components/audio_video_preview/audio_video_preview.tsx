// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FileInfo} from '@mattermost/types/files';

import FileInfoPreview from 'components/file_info_preview';

import Constants from 'utils/constants';

type Props = {
    fileInfo: FileInfo;
    fileUrl: string;
    isMobileView: boolean;
}

type State = {
    canPlay: boolean;
}

export default class AudioVideoPreview extends React.PureComponent<Props, State> {
    sourceRef = React.createRef<HTMLSourceElement>();
    videoRef = React.createRef<HTMLVideoElement>();

    constructor(props: Props) {
        super(props);

        this.state = {
            canPlay: true,
        };
    }

    componentDidMount() {
        this.handleFileInfoChanged(this.props.fileInfo);

        if (this.sourceRef.current) {
            this.sourceRef.current.addEventListener('error', this.handleLoadError, {once: true});
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.fileUrl !== prevProps.fileUrl) {
            this.handleFileInfoChanged(this.props.fileInfo);
        }

        if (this.sourceRef.current) {
            this.sourceRef.current.addEventListener('error', this.handleLoadError, {once: true});
        }
    }

    handleFileInfoChanged = (fileInfo: FileInfo) => {
        let video = this.videoRef.current;
        if (!video) {
            video = document.createElement('video');
        }

        // rewriting the mimetype for quicktime to allow for playback in chrome browsers.
        // mov files are encoded with MPEG-4 but the mimetype is set to quicktime.
        const mimeType = (fileInfo.mime_type === 'video/quicktime') ? 'video/mp4' : fileInfo.mime_type;

        const canPlayType = video.canPlayType(mimeType);

        this.setState({
            canPlay: canPlayType === 'probably' || canPlayType === 'maybe',
        });
    }

    handleLoadError = () => {
        this.setState({
            canPlay: false,
        });
    }

    stop = () => {
        if (this.videoRef.current) {
            const video = this.videoRef.current;
            video.pause();
            video.currentTime = 0;
        }
    }

    render() {
        if (!this.state.canPlay) {
            return (
                <FileInfoPreview
                    fileInfo={this.props.fileInfo}
                    fileUrl={this.props.fileUrl}
                />
            );
        }

        let width = Constants.WEB_VIDEO_WIDTH;
        let height = Constants.WEB_VIDEO_HEIGHT;
        if (this.props.isMobileView) {
            width = Constants.MOBILE_VIDEO_WIDTH;
            height = Constants.MOBILE_VIDEO_HEIGHT;
        }

        // add a key to the video to prevent React from using an old video source while a new one is loading
        return (
            <video
                key={this.props.fileInfo.id}
                ref={this.videoRef}
                data-setup='{}'
                controls={true}
                width={width}
                height={height}
            >
                <source
                    ref={this.sourceRef}
                    src={this.props.fileUrl}
                />
            </video>
        );
    }
}
