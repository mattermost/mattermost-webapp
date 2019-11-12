// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class PluginChannelHeaderIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <FormattedMessage
                    id='generic_icons.plugins'
                    defaultMessage='Plugins'
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
                            <path
                                fillRule='evenodd'
                                d='M10.2500542,0.707106781 C10.6987855,0.707106781 11.0625542,1.07087542 11.0625542,1.51960678 L11.0615542,3.50610678 L12.8042208,3.50710678 C13.4301435,3.50710678 13.9375542,4.0145174 13.9375542,4.64044011 C13.9375542,5.26636283 13.4301435,5.77377345 12.8042208,5.77377345 L12.8125542,5.77377345 L12.8125542,8.97377345 L12.8125542,8.97377345 C12.8125542,11.2921636 10.8653399,13.2156919 8.31338929,13.5787961 L8.31255416,15.8946068 C8.31255416,16.3433381 7.94878552,16.7071068 7.50005416,16.7071068 C7.0513228,16.7071068 6.68755416,16.3433381 6.68755416,15.8946068 L6.68783265,13.5954057 C4.14942691,13.2878302 2.17885387,11.4410225 2.06752014,9.17620376 L2.06255416,8.97377345 L2.06255416,8.97377345 L2.06255416,5.77377345 L2.07088749,5.77377345 C1.44496478,5.77377345 0.937554159,5.26636283 0.937554159,4.64044011 C0.937554159,4.0145174 1.44496478,3.50710678 2.07088749,3.50710678 L3.81155416,3.50610678 L3.81255416,1.51960678 C3.81255416,1.07087542 4.1763228,0.707106781 4.62505416,0.707106781 C5.07378552,0.707106781 5.43755416,1.07087542 5.43755416,1.51960678 L5.43655416,3.50610678 L9.43655416,3.50610678 L9.43755416,1.51960678 C9.43755416,1.07087542 9.8013228,0.707106781 10.2500542,0.707106781 Z M11,6 L4,6 L4,9.3 L4.07019791,9.30071649 C4.39483943,10.5555917 5.80705165,11.5 7.5,11.5 C9.19294835,11.5 10.6051606,10.5555917 10.9298021,9.30071649 L10.9298021,9.30071649 L11,9.3 L11,6 Z'
                                transform='rotate(45 7.707 6.793)'
                            />
                        </svg>
                    )}
                </FormattedMessage>
            </span>
        );
    }
}
