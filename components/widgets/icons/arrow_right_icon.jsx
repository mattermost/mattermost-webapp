// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

export default function ArrowRightIcon(props) {
    const {formatMessage} = useIntl();
    return (
        <span {...props}>
            <svg
                width='24px'
                height='24px'
                viewBox='0 0 24 24'
                role='img'
                title={formatMessage({id: 'generic_icons.channel.arrow-right', defaultMessage: 'Arrow right'})}
            >
                <path d='M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z'/>
            </svg>
        </span>
    );
}

