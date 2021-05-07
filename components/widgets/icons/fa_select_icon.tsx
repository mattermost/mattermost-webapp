// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import LocalizedIcon from 'components/localized_icon';
import {t} from 'utils/i18n';

export default function SelectIcon() {
    return (
        <LocalizedIcon
            className='fa fa fa-plus-square'
            title={{id: t('generic_icons.select'), defaultMessage: 'Select Icon'}}
        />
    );
}
