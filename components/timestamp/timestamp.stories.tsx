// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties} from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, text} from '@storybook/addon-knobs';

import moment from 'moment';

import Timestamp from './index';

const containerStyle: CSSProperties = {
    width: 600,
    height: 180,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    alignItems: 'center',
    border: '1px solid #eeeeee',
    borderRadius: 5,
    margin: 10,
};

const labelStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    fontFamily: 'monospace',
    background: '#eee',
    padding: '5px 10px',
    borderRadius: '0 0 3px'
};

storiesOf('Timestamp', module).
    addDecorator(withKnobs).
    add('absolute',
        () => {
            const value = text('value', new Date().toISOString());
            return (
                <div style={{display: 'flex', width: '100%', flexWrap: 'wrap'}}>
                    <div style={containerStyle}>
                        <span style={labelStyle}>{'Date + Time'}</span>
                        <Timestamp value={value}/>
                    </div>
                    <div style={containerStyle}>
                        <span style={labelStyle}>{'Time'}</span>
                        <Timestamp
                            value={value}
                            useDate={false}
                        />
                    </div>
                    <div style={containerStyle}>
                        <span style={labelStyle}>{'Date'}</span>
                        <Timestamp
                            useTime={false}
                            value={value}
                        />
                    </div>
                </div>
            );
        }
    ).
    add('relative',
        () => {
            return (
                <div style={{display: 'flex', width: '100%', flexWrap: 'wrap'}}>
                    <div style={containerStyle}>
                        <span style={labelStyle}>{'Hours'}</span>
                        <Timestamp
                            unit='hour'
                            value={moment().subtract(1, 'hour').toDate()}
                        />
                    </div>
                    <div style={containerStyle}>
                        <span style={labelStyle}>{'Minutes'}</span>
                        <Timestamp
                            unit='minute'
                            value={moment().subtract(25, 'minute').toDate()}
                        />
                    </div>
                </div>
            );
        }
    );
