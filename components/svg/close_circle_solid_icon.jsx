// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class CloseCircleSolidIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <FormattedMessage
                    id='generic_icons.close'
                    defaultMessage='Close Icon'
                >
                    {(ariaLabel) => (
                        <svg
                            width='24px'
                            height='24px'
                            viewBox='0 0 24 24'
                            role='icon'
                            aria-label={ariaLabel}
                        >
                            <path
                                d='M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z'
                            />
                        </svg>
                    )}
                </FormattedMessage>
            </span>
        );
    }
}
