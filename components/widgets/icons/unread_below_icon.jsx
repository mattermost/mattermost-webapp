// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class UnreadBelowIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <FormattedMessage
                    id='generic_icons.arrow.down'
                    defaultMessage='Down Arrow Icon'
                >
                    {(ariaLabel) => (
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            role='img'
                            aria-label={ariaLabel}
                        >
                            <g transform='rotate(180 12 12)'>
                                <path
                                    fill='none'
                                    d='M0 0h24v24H0V0z'
                                />
                                <path d='M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z'/>
                            </g>
                        </svg>
                    )}
                </FormattedMessage>
            </span>
        );
    }
}
