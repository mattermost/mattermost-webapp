// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class FlagIconFilled extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <FormattedMessage
                    id='generic_icons.flagged'
                    defaultMessage='Flagged Icon'
                >
                    {(ariaLabel) => (
                        <svg
                            width='16px'
                            height='16px'
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
                                    transform='translate(-1073.000000, -33.000000)'
                                    fillRule='nonzero'
                                    fill='inherit'
                                >
                                    <g transform='translate(-1.000000, 0.000000)'>
                                        <g transform='translate(1064.000000, 22.000000)'>
                                            <g transform='translate(10.000000, 11.000000)'>
                                                <path d='M8,1 L2,1 C2,0.447 1.553,0 1,0 C0.447,0 0,0.447 0,1 L0,15.5 C0,15.776 0.224,16 0.5,16 L1.5,16 C1.776,16 2,15.776 2,15.5 L2,11 L7,11 L7,12 C7,12.553 7.447,13 8,13 L15,13 C15.553,13 16,12.553 16,12 L16,4 C16,3.447 15.553,3 15,3 L9,3 L9,2 C9,1.447 8.553,1 8,1 Z'/>
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
