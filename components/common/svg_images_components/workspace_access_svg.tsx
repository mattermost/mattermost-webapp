// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type SvgProps = {
    width: number;
    height: number;
};

const WorkspaceAccessSvg = (props: SvgProps) => (
    <svg
        width={props.width ? props.width.toString() : '20'}
        height={props.height ? props.height.toString() : '20'}
        viewBox='0 0 20 20'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            d='M6.992 6.00802V5.00002H5V6.00802H6.992ZM6.992 15.992H5V17H6.992V15.992ZM14 5.00002V6.00802H9.008V5.00002H14ZM14 15.992H9.008V17H14V15.992ZM21.008 3.00802C21.008 2.44802 20.808 1.97602 20.408 1.59202C20.024 1.19202 19.552 0.992024 18.992 0.992024H3.008C2.464 0.992024 1.992 1.19202 1.592 1.59202C1.192 1.97602 0.992 2.44802 0.992 3.00802V8.00002C0.992 8.54402 1.184 9.01602 1.568 9.41602C1.968 9.80002 2.448 9.99202 3.008 9.99202H18.992C19.552 9.99202 20.024 9.80002 20.408 9.41602C20.808 9.01602 21.008 8.54402 21.008 8.00002V3.00802ZM18.992 3.00802V8.00002H3.008V3.00802H18.992ZM21.008 14V18.992C21.008 19.536 20.808 20.008 20.408 20.408C20.024 20.808 19.552 21.008 18.992 21.008H3.008C2.464 21.008 1.992 20.808 1.592 20.408C1.192 20.008 0.992 19.536 0.992 18.992V14C0.992 13.456 1.184 12.992 1.568 12.608C1.968 12.208 2.448 12.008 3.008 12.008H18.992C19.552 12.008 20.024 12.208 20.408 12.608C20.808 12.992 21.008 13.456 21.008 14ZM18.992 14H3.008V18.992H18.992V14Z'
            fill='var(--center-channel-color)'
            fillOpacity='0.56'
        />
    </svg>
);

export default WorkspaceAccessSvg;
