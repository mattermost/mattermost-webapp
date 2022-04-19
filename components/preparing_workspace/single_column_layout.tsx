// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import PageLine from './page_line';

import './single_column_layout.scss';

type Props = {
    children: React.ReactNode | React.ReactNodeArray;
    beforePath?: boolean;
    afterPath?: boolean;
    style?: React.CSSProperties;
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
    const lineLeft = props.lineLeft === undefined ? 99 : Math.abs(props.lineLeft);

    let children = props.children;
    if (React.Children.count(props.children) > 1) {
        children = <div>{props.children}</div>;
    }

    return (
        <div
            className='SingleColumnLayout'
            style={props.style}
        >
            {showBeforePath && (
                <PageLine
                    style={{
                        flexGrow: '1',
                        flexShrink: '1',
                        height: '50vh',
                        marginBottom: `${lineDistance}px`,
                        left: `${lineLeft}px`,
                    }}
                />
            )}
            {children}
            {showAfterPath && (
                <PageLine
                    style={{
                        flexGrow: '1',
                        flexShrink: '1',
                        height: '50vh',
                        marginTop: `${lineDistance}px`,
                        left: `${lineLeft}px`,
                    }}
                />
            )}
        </div>
    );
}
