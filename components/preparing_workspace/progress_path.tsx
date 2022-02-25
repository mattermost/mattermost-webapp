// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import PageLine from './page_line';

import './progress_path.scss';

type Props = {
    children: React.ReactNode | React.ReactNodeArray;
    beforePath?: boolean;
    afterPath?: boolean;
    style?: React.CSSProperties;
    lineDistance?: number;
    lineLeft?: number;
}

export default function ProgressPath(props: Props) {
    let showBeforePath = true;
    if (props.beforePath === false) {
        showBeforePath = false;
    }

    let showAfterPath = true;
    if (props.afterPath === false) {
        showAfterPath = false;
    }

    const lineDistance = props.lineDistance === undefined ? 15 : Math.abs(props.lineDistance);
    const lineLeft = props.lineLeft === undefined ? 99 : Math.abs(props.lineLeft);

    let children = props.children;
    if (React.Children.count(props.children) > 1) {
        children = <div>{props.children}</div>;
    }

    return (
        <div
            className='ProgressPath'
            style={props.style}
        >
            {showBeforePath && (
                <PageLine
                    style={{
                        height: '40vh',
                        left: `${lineLeft}px`,
                        position: 'absolute',
                        transform: `translateY(calc(-100% - ${lineDistance}px))`,
                    }}
                />
            )}
            {children}
            {showAfterPath && (
                <PageLine
                    style={{
                        height: '56vh',
                        transform: `translateY(${lineDistance}px)`,
                        left: `${lineLeft}px`,
                        position: 'absolute',
                    }}
                />
            )}
        </div>
    );
}
