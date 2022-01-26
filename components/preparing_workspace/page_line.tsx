// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './page_line.scss';

type Props = {
    height?: string;
    noLeft?: boolean;
}
const PageLine = (props: Props) => {
    let className = 'PageLine';
    if (props.noLeft) {
        className += ' PageLine--no-left';
    }
    return (
        <div
            className={className}
            style={{height: props.height}}
        />
    );
};

export default PageLine;
