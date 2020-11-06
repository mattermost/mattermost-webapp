// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

export default function InviteIcon(props) {
    const {formatMessage} = useIntl();
    return (
        <span {...props}>
            <svg
                width='126px'
                height='32px'
                viewBox='0 0 126 32'
                role='img'
                aria-label={formatMessage({id: 'generic_icons.invite', defaultMessage: 'Invite Icon'})}
            >
                <path d='M 106,18 86,5.52 V 4 c 0,-2.22 1.78,-4 4,-4 h 32 c 2.20914,0 4,1.790861 4,4 v 1.5 z m 20,10 c 0,2.209139 -1.79086,4 -4,4 H 90 c -2.22,0 -4,-1.8 -4,-4 V 10.22 l 4,2.5 V 28 h 32 V 12.72 l 4,-2.5 z M 1,15 h 62 c 0.552285,0 1,0.447715 1,1 0,0.552285 -0.447715,1 -1,1 H 1 C 0.44771525,17 0,16.552285 0,16 0,15.447715 0.44771525,15 1,15 Z M 21,5 h 48 c 0.552285,0 1,0.447715 1,1 0,0.552285 -0.447715,1 -1,1 H 21 C 20.447715,7 20,6.552285 20,6 20,5.447715 20.447715,5 21,5 Z m 0,20 h 48 c 0.552285,0 1,0.447715 1,1 0,0.552285 -0.447715,1 -1,1 H 21 c -0.552285,0 -1,-0.447715 -1,-1 0,-0.552285 0.447715,-1 1,-1 z'/>
            </svg>
        </span>
    );
}
