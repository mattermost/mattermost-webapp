// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import {t} from 'utils/i18n';

export default function LogoutIcon() {
    const {formatMessage} = useIntl();
    return (
        <i
            className='fa fa-1x fa-angle-left'
            title={formatMessage({id: t('generic_icons.logout'), defaultMessage: 'Logout Icon'})}
        />
    );
}
