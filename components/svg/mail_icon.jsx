// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class MailIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <FormattedMessage
                    id='generic_icons.mail'
                    defaultMessage='Mail Icon'
                >
                    {(ariaLabel) => (
                        <svg
                            width='24px'
                            height='24px'
                            viewBox='0 0 24 24'
                            role='icon'
                            aria-label={ariaLabel}
                        >
                            <path d='M4,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4C2.89,20 2,19.1 2,18V6C2,4.89 2.89,4 4,4M12,11L20,6H4L12,11M4,18H20V8.37L12,13.36L4,8.37V18Z'/>
                        </svg>
                    )}
                </FormattedMessage>
            </span>
        );
    }
}
