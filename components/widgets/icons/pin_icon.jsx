// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class PinIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <FormattedMessage
                    id='generic_icons.pin'
                    defaultMessage='Pin Icon'
                >
                    {(ariaLabel) => (
                        <svg
                            width='14px'
                            height='14px'
                            viewBox='0 0 16 16'
                            version='1.1'
                            role='img'
                            aria-label={ariaLabel}
                        >
                            <g
                                stroke='inherit'
                                strokeWidth='1'
                                fill='inherit'
                                fillRule='evenodd'
                            >
                                <g
                                    transform='translate(-775.000000, -32.000000)'
                                    fillRule='nonzero'
                                    fill='inherit'
                                >
                                    <g>
                                        <g transform='translate(764.000000, 22.000000)'>
                                            <g transform='translate(10.000000, 10.000000)'>
                                                <path d='M16.456,7.291 L9.483,0.25 C9.31,0.078 9.178,0 9.08,0 C8.896,0 8.831,0.276 8.831,0.732 L8.831,3.044 L5.831,5.96 L2.578,6.268 C1.887,6.405 1.668,6.917 2.167,7.41 L4.781,10.011 L3.83,10.961 L1.05,15.511 C0.93,15.761 1.03,15.862 1.28,15.74 L5.83,12.961 L6.786,12.005 L9.359,14.565 C9.556,14.76 9.754,14.854 9.929,14.854 C10.197,14.854 10.413,14.634 10.497,14.219 L10.83,10.961 L13.746,7.961 L16.082,7.961 C16.788,7.961 16.955,7.785 16.456,7.291 Z M12.312,6.567 L9.396,9.567 L8.911,10.065 L8.84,10.757 L8.797,11.184 L5.589,7.992 L6.018,7.952 L6.72,7.886 L7.225,7.396 L10.225,4.48 L10.547,4.167 L12.616,6.256 L12.312,6.567 Z'/>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>
                    )}
                </FormattedMessage>
            </span>
        );
    }
}
