// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import PageLine from './page_line';

import './single_column_layout.scss';

type Props = {
    children: React.ReactNode | React.ReactNodeArray;
    beforePath?: boolean;
    afterPath?: boolean;
    style?: Record<string, string>;
    lineDistance?: number;
    lineLeft?: number;
};

export default function SingleColumnLayout(props: Props) {
    let showBeforePath = true;
    if (props.beforePath === false) {
        showBeforePath = false;
    }

    let showAfterPath = true;
    if (props.afterPath === false) {
        showAfterPath = false;
    }

    const lineDistance = props.lineDistance === undefined ? 40 : Math.abs(props.lineDistance);
    const lineLeft = props.lineLeft === undefined ? 68 : Math.abs(props.lineLeft);

    return (
        <div
            className='SingleColumnLayout'
            style={props.style}
        >
            <div className='SingleColumnLayout__inner'>
                {showBeforePath && (
                    <PageLine
                        style={{
                            height: '50vh',
                            position: 'absolute',
                            transform: 'translateY(-100%)',
                            top: `-${lineDistance}px`,
                            left: `${lineLeft}px`,
                        }}
                    />
                )}
                {props.children}
                {showAfterPath && (
                    <PageLine
                        style={{
                            height: '50vh',
                            position: 'absolute',
                            top: `calc(100% + ${lineDistance}px)`,
                            left: `${lineLeft}px`,
                        }}
                    />
                )}
            </div>
        </div>
    );
}
