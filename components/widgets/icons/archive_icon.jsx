// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class ArchiveIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <FormattedMessage
                    id='generic_icons.archive'
                    defaultMessage='Archive Icon'
                >
                    {(ariaLabel) => (
                        <svg
                            width='14'
                            height='14'
                            viewBox='0 0 14 14'
                            role='icon'
                            aria-label={ariaLabel}
                        >
                            <path d='M8.5 6.5q0-0.203-0.148-0.352t-0.352-0.148h-2q-0.203 0-0.352 0.148t-0.148 0.352 0.148 0.352 0.352 0.148h2q0.203 0 0.352-0.148t0.148-0.352zM13 5v7.5q0 0.203-0.148 0.352t-0.352 0.148h-11q-0.203 0-0.352-0.148t-0.148-0.352v-7.5q0-0.203 0.148-0.352t0.352-0.148h11q0.203 0 0.352 0.148t0.148 0.352zM13.5 1.5v2q0 0.203-0.148 0.352t-0.352 0.148h-12q-0.203 0-0.352-0.148t-0.148-0.352v-2q0-0.203 0.148-0.352t0.352-0.148h12q0.203 0 0.352 0.148t0.148 0.352z'/>
                        </svg>
                    )}
                </FormattedMessage>
            </span>
        );
    }
}
