// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import RecordMessage from 'components/record_message';

const audioType = 'audio/*';

//must be changed to .tsx file // rootId is empty

class Recorder extends React.PureComponent {
    static propTypes = {
        visible: PropTypes.bool.isRequired,
        channelId: PropTypes.string.isRequired,
        rootId: PropTypes.string.isRequired,
        mimeTypeToUseWhenRecording: PropTypes.object,
        actions: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            time: 0,
            recording: false,
            medianotFound: false,
            stream: null,
        };
        this.timer = 0;
        this.startTimer = this.startTimer.bind(this);
        this.countDown = this.countDown.bind(this);
    }

    startTimer() {
        this.timer = setInterval(this.countDown, 100);
    }

    countDown() {
        this.setState((prevState) => {
            const time = prevState.time + 100;
            return ({time});
        });
    }

    async initRecorder() {
        navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
        if (navigator.mediaDevices) {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            if (this.props.mimeTypeToUseWhenRecording) {
                this.mediaRecorder = new MediaRecorder(stream, {mimeType: this.props.mimeTypeToUseWhenRecording});
            } else {
                this.mediaRecorder = new MediaRecorder(stream);
            }
            this.chunks = [];
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    this.chunks.push(e.data);
                }
            };

            this.stream = stream;
        } else {
            this.setState({medianotFound: true});
            console.log('Media Decives will work only with SSL.....');
        }
    }

    async startRecording() {
        this.chunks = [];
        await this.initRecorder();
        this.mediaRecorder.start(10);
        this.startTimer();
        this.setState({recording: true});
    }

    resetRecording() {
        this.setState({
            time: 0,
            miliseconds: 0,
            recording: false,
            medianotFound: false,
        });
        clearInterval(this.timer);
        this.mediaRecorder.stop();
    }

    cancelRecording() {
        this.props.actions.cancel();
        this.resetRecording();
    }

    async sendRecord() {
        const blob = new Blob(this.chunks, {type: audioType});
        await this.props.actions.send(this.props.channelId, this.props.rootId, blob, this.state.time);
        this.resetRecording();
    }

    render() {
        return (
            <>
                {this.props.visible &&
                    <RecordMessage
                        cancel={() => this.cancelRecording()}
                        start={() => this.startRecording()}
                        send={() => this.sendRecord()}
                        time={this.state.time}
                    />
                }
            </>
        );
    }
}

export default Recorder;
