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
                            width='24px'
                            height='24px'
                            role='img'
                            aria-label={ariaLabel}
                        >
                            <path d='M6 12l1.058-1.057 4.192 4.184V6h1.5v9.127l4.185-4.192L18 12l-6 6z'/>
                        </svg>
                    )}
                </FormattedMessage>
            </span>
        );
    }
}
