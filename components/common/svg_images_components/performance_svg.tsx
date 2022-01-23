// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type SvgProps = {
    width: number;
    height: number;
};

const PerformanceSvg = (props: SvgProps) => (
    <svg
        width={props.width ? props.width.toString() : '22'}
        height={props.height ? props.height.toString() : '22'}
        viewBox='0 0 22 22'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            d='M15.008 9.78402L19.232 2.44002L20.96 3.44802L15.752 12.496L9.224 8.75202L4.472 17.008H21.008V19H0.992V1.00002H3.008V15.544L8.504 5.99202L15.008 9.78402Z'
            fill='var(--center-channel-color)'
            fillOpacity='0.56'
        />
    </svg>
);

export default PerformanceSvg;
