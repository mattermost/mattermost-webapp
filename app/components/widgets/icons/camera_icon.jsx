// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

export default function CameraIcon(props) {
    const intl = useIntl();
    return (
        <span {...props}>
            <svg
                width='14px'
                height='10px'
                viewBox='0 0 16 12'
                role='img'
                aria-label={intl.formatMessage({id: 'generic_icons.camera', defaultMessage: 'Camera Icon'})}
            >
                <g
                    stroke='none'
                    strokeWidth='1'
                    fill='inherit'
                    fillRule='evenodd'
                >
                    <g
                        transform='translate(-696.000000, -34.000000)'
                        fillRule='nonzero'
                        fill='inherit'
                    >
                        <g transform='translate(-1.000000, 0.000000)'>
                            <g transform='translate(687.000000, 22.000000)'>
                                <g transform='translate(10.000000, 12.000000)'>
                                    <path d='M15.105,1.447 L12,3 L12,1 C12,0.447 11.553,0 11,0 L1,0 C0.447,0 0,0.447 0,1 L0,11 C0,11.553 0.447,12 1,12 L11,12 C11.553,12 12,11.553 12,11 L12,9 L15.105,10.553 C15.6,10.8 16,10.553 16,10 L16,2 C16,1.447 15.6,1.2 15.105,1.447 Z M12.895,7.211 C12.612,7.07 12.306,7 12,7 L10.5,7 C10.224,7 10,7.224 10,7.5 L10,10 L2,10 L2,2 L10,2 L10,4.5 C10,4.776 10.224,5 10.5,5 L12,5 C12.306,5 12.612,4.93 12.895,4.789 L14,4.236 L14,7.763 L12.895,7.211 Z'/>
                                </g>
                            </g>
                        </g>
                    </g>
                </g>
            </svg>
        </span>
    );
}
