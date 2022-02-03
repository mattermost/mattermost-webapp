// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type SvgProps = {
    width: number;
    height: number;
};

const WarningSvg = (props: SvgProps) => (
    <svg
        width={props.width ? props.width.toString() : '40'}
        height={props.height ? props.height.toString() : '40'}
        viewBox='0 0 40 40'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            className='icon-color'
            d='M16.016 2.00005H23.984L22.016 23.984H17.984L16.016 2.00005ZM23.984 34.016C23.984 35.104 23.6 36.032 22.832 36.8C22.064 37.6 21.12 38 20 38C18.912 38 17.968 37.6 17.168 36.8C16.4 36.032 16.016 35.104 16.016 34.016C16.016 32.896 16.4 31.952 17.168 31.184C17.968 30.384 18.912 29.984 20 29.984C21.088 29.984 22.016 30.384 22.784 31.184C23.584 31.952 23.984 32.896 23.984 34.016Z'
            fill={'var(--dnd-indicator)'}
        />
    </svg>
);

export default WarningSvg;
