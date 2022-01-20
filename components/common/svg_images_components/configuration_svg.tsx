// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type SvgProps = {
    width: number;
    height: number;
};

const ConfigurationSvg = (props: SvgProps) => (
    <svg
        width={props.width ? props.width.toString() : '20'}
        height={props.height ? props.height.toString() : '20'}
        viewBox='0 0 20 20'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            d='M1 14.992V17.008H7V14.992H1ZM1 2.99202V5.00802H11.008V2.99202H1ZM11.008 19V17.008H19V14.992H11.008V13H8.992V19H11.008ZM5.008 7.00002V8.99202H1V11.008H5.008V13H7V7.00002H5.008ZM19 11.008V8.99202H8.992V11.008H19ZM13 7.00002H14.992V5.00802H19V2.99202H14.992V1.00002H13V7.00002Z'
            fill='var(--center-channel-color)'
            fillOpacity='0.56'
        />
    </svg>
);

export default ConfigurationSvg;
