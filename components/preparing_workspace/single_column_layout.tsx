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
                            top: '-20px',
                            left: '100px',
                        }}
                    />
                )}
                {props.children}
                {showAfterPath && (
                    <PageLine
                        style={{
                            height: '50vh',
                            position: 'absolute',
                            top: '100%',
                            left: '100px',
                        }}
                    />
                )}
            </div>
        </div>
    );
}
