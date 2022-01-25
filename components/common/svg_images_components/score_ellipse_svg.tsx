// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type SvgProps = {
    width: number;
    height: number;
};

const ScoreEllipseSvg = (props: SvgProps) => (
    <svg
        width={props.width ? props.width.toString() : '140'}
        height={props.height ? props.height.toString() : '140'}
        viewBox='0 0 140 140'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='circular-chart'
    >
        <path
            className='circle-bg'
            d='M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831'
        />
        <path
            className='circle'
            strokeDasharray='60, 100'
            d='M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831'
        />
        <text
            x='18'
            y='20.35'
            className='percentage'
        >
            {60}
        </text>
    </svg>
);

export default ScoreEllipseSvg;
