// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import {t} from 'utils/i18n';

export default function UnreadBelowIcon(props) {
    const {formatMessage} = useIntl();
    return (
        <span {...props}>
            <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24px'
                height='24px'
                role='img'
                aria-label={formatMessage({id: t('generic_icons.arrow.down'), defaultMessage: 'Down Arrow Icon'})}
            >
                <path d='M6 12l1.058-1.057 4.192 4.184V6h1.5v9.127l4.185-4.192L18 12l-6 6z'/>
            </svg>
        </span>
    );
}
