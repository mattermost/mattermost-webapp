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
                        <svg class="bi bi-star-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" color="blue" xmlns="http://www.w3.org/2000/svg">
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
                                                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.283.95l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
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


// Original code , which was there for flagging of messages/
/* <svg 
                            width='16px'
                            height='16px'
                            viewBox='0 0 16 16'
                            role='img'
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
                        </svg> */




//<i class="fas fa-star"></i>
