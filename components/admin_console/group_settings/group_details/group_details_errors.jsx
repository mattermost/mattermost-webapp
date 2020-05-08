// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import FormError from 'components/form_error';

export const NeedGroupNameError = () => (
    <FormError
        iconClassName={'fa-exclamation-triangle'}
        textClassName={'has-error'}
        error={(
            <FormattedMessage
                id='admin.group_settings.need_groupname'
                defaultMessage='You must specify a group mention.'
            />)}
    />
);

export const GroupNameIsTakenError = () => (
    <FormError
        iconClassName={'fa-exclamation-triangle'}
        textClassName={'has-error'}
        error={(
            <FormattedMessage
                id='admin.group_settings.group_detail.duplicateMentionNameError'
                defaultMessage='Group mention is already taken.'
            />)}
    />
);

export const InvalidOrReservedGroupNameError = () => (
    <FormError
        iconClassName={'fa-exclamation-triangle'}
        textClassName={'has-error'}
        error={(
            <FormattedMessage
                id='admin.group_settings.group_detail.invalidOrReservedMentionNameError'
                defaultMessage='Only letters (a-z), numbers(0-9), periods, dashes and underscores are allowed.'
            />)}
    />
);