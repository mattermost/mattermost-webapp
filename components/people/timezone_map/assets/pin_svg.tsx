// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type SvgProps = {
    width: number;
    height: number;
};

const FileSvg = (props: SvgProps) => (
    <svg
        width={props.width ? props.width.toString() : '20'}
        height={props.height ? props.height.toString() : '32'}
        viewBox='0 0 20 32'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M10.1351 0.268738C3.1173 0.268738 -1.7925 7.2507 1.12993 13.6311C1.72723 14.9351 2.33335 16.1886 2.92499 17.3109C5.44311 22.0877 10.1351 31.7312 10.1351 31.7312C10.1351 31.7312 14.8272 22.0877 17.3453 17.3109C17.9369 16.1886 18.5431 14.9351 19.1404 13.6311C22.0628 7.2507 17.153 0.268738 10.1351 0.268738ZM10.1349 13.3781C12.3069 13.3781 14.0677 11.6173 14.0677 9.4453C14.0677 7.27327 12.3069 5.51249 10.1349 5.51249C7.96285 5.51249 6.20207 7.27327 6.20207 9.4453C6.20207 11.6173 7.96285 13.3781 10.1349 13.3781Z'
            fill='#D24B4E'
        />
    </svg>
);

export default FileSvg;
