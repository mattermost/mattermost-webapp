// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type SvgProps = {
    width: number;
    height: number;
};

const SecuritySvg = (props: SvgProps) => (
    <svg
        width={props.width ? props.width.toString() : '22'}
        height={props.height ? props.height.toString() : '22'}
        viewBox='0 0 22 22'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            d='M19 9.99202C19 11.832 18.608 13.6 17.824 15.296C17.04 16.96 15.976 18.384 14.632 19.568C13.24 20.768 11.696 21.576 10 21.992C8.304 21.576 6.76 20.768 5.368 19.568C4.024 18.384 2.96 16.96 2.176 15.296C1.392 13.6 1 11.832 1 9.99202V3.99202L10 0.00802374L19 3.99202V9.99202ZM10 20C11.232 19.664 12.392 18.992 13.48 17.984C14.536 16.976 15.384 15.792 16.024 14.432C16.68 13.024 17.008 11.616 17.008 10.208V5.28802L10 2.16802L2.992 5.28802V10.208C2.992 11.616 3.32 13.024 3.976 14.432C4.616 15.792 5.464 16.976 6.52 17.984C7.608 18.992 8.768 19.664 10 20ZM8.992 6.00802H11.008V12.008H8.992V6.00802ZM8.992 14H11.008V15.992H8.992V14Z'
            fill='var(--center-channel-color)'
            fillOpacity='0.56'
        />
    </svg>
);

export default SecuritySvg;
