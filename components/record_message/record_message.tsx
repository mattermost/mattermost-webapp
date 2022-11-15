// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {changeOpacity} from 'mattermost-redux/utils/theme_utils';

import {Theme} from 'packages/mattermost-redux/src/selectors/entities/preferences';

import './record_message.css';

function pad2(n: number) {
    const val = n | 0;
    return val < 10 ? `0${val}` : `${Math.min(val, 99)}`;
}

function pad2nozero(n: number) {
    const val = n | 0;
    return val < 10 ? `${val}` : `${Math.min(val, 99)}`;
}

export type Props = {
    theme: Theme;
    time: number;
    start: () => void;
    cancel: () => void;
    send: () => void;
};

type State = {

}

export default class RecordMessage extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
        };
    }

    componentDidMount(): void {
        this.props.start();
    }

    getDuration() {
        const msecs = this.props.time;
        const secs = Math.round(msecs / 1000);
        return pad2nozero(secs / 60) + ':' + pad2(secs % 60);
    }

    render() {
        const style = getStyle(this.props.theme);
        return (
            <div style={style.root}>
                <div style={style.rec}>
                    <span className='voice-recording-icon'>
                        <i
                            className='icon fa fa-microphone'
                            style={style.icon}
                        />
                    </span>
                    <span style={style.duration}>{this.getDuration()}</span>
                    <button
                        className='voice-recording-button'
                        onClick={this.props.cancel}
                        style={style.button}
                    >{'Cancel'}</button>
                    <button
                        className='voice-recording-button'
                        onClick={this.props.send}
                        style={style.button}
                    >{'Send'}</button>
                </div>
            </div>
        );
    }
}

const getStyle = (theme: Theme) => (
    {
        root: {
            position: 'absolute',
            display: 'flex',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2000,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        rec: {
            padding: '0.5em',
            backgroundColor: theme.centerChannelBg,
            color: theme.centerChannelColor,
            border: `1px solid ${changeOpacity(theme.centerChannelColor, 0.1)}`,
            fontSize: '1.3em',
        },
        button: {
            background: 'none',
            color: theme.linkColor,
            border: 'none',
            outline: 'inherit',
            padding: '0.5em',
        },
        icon: {
            color: 'red',
            padding: '0.5em',
        },
        duration: {
            padding: '0.5em',
        },
    }
);
