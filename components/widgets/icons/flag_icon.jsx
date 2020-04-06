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
                            height='16px'
                            viewBox='0 0 15 17'
                            role='img'
                            aria-label={ariaLabel}
                        >
                            <path d='M7.36 2.59999L7.72 4.39999H12.4V9.79999H9.34L8.98 7.99999H2.5V2.59999H7.36ZM8.8 0.799987H0.7V16.1H2.5V9.79999H7.54L7.9 11.6H14.2V2.59999H9.16L8.8 0.799987Z'/>
                        </svg>
                    )}
                </FormattedMessage>
            </span>
        );
    }
}
