// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type SvgProps = {
    width: number;
    height: number;
};

const SuccessIconSvg = (props: SvgProps) => (
    <svg
        width={props.width ? props.width.toString() : '20'}
        height={props.height ? props.height.toString() : '20'}
        viewBox='0 0 20 20'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            className='icon-color'
            d='M19 5.00802L7 17.008L1.504 11.488L2.92 10.096L7 14.176L17.584 3.59202L19 5.00802Z'
            fill='var(--online-indicator)'
        />
    </svg>
);

export default SuccessIconSvg;
