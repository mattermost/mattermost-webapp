// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {RangeDescriptor} from './timestamp';

export const TODAY_YESTERDAY: RangeDescriptor = {
    within: ['day', -1],
    display: ['day'],
};

export const TODAY_TITLE_CASE: RangeDescriptor = {
    equals: ['day', 0],
    display: (
        <FormattedMessage
            id='date_separator.today'
            defaultMessage='Today'
        />
    ),
};

export const YESTERDAY_TITLE_CASE: RangeDescriptor = {
    equals: ['day', -1],
    display: (
        <FormattedMessage
            id='date_separator.yesterday'
            defaultMessage='Yesterday'
        />
    ),
};
