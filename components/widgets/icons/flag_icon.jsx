// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class FlagIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <FormattedMessage
                    id='generic_icons.flag'
                    defaultMessage='Flag Icon'
                >
                    {(ariaLabel) => (
                        <svg
                            width='14px'
                            height='14px'
                            viewBox='0 0 16 16'
                            role='icon'
                            aria-label={ariaLabel}
                        >
                            <g
                                stroke='none'
                                strokeWidth='1'
                                fill='inherit'
                                fillRule='evenodd'
                            >
                                <g
                                    transform='translate(-1106.000000, -33.000000)'
                                    fillRule='nonzero'
                                    fill='inherit'
                                >
                                    <g>
                                        <g transform='translate(1096.000000, 22.000000)'>
                                            <g transform='translate(10.000000, 11.000000)'>
                                                <path d='M8,1 L2,1 C2,0.447 1.553,0 1,0 C0.447,0 0,0.447 0,1 L0,15.5 C0,15.776 0.224,16 0.5,16 L1.5,16 C1.776,16 2,15.776 2,15.5 L2,11 L7,11 L7,12 C7,12.553 7.447,13 8,13 L15,13 C15.553,13 16,12.553 16,12 L16,4 C16,3.447 15.553,3 15,3 L9,3 L9,2 C9,1.447 8.553,1 8,1 Z M9,11 L9,9.5 C9,9.224 8.776,9 8.5,9 L2,9 L2,3 L7,3 L7,4.5 C7,4.776 7.224,5 7.5,5 L14,5 L14,11 L9,11 Z'/>
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
