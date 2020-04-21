// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {FormattedMessage} from 'react-intl';

import FormError from 'components/form_error';

export const NeedGroupNameError = ({warning}) => (
    <FormError
        iconClassName={`fa-exclamation-${warning ? 'circle' : 'triangle'}`}
        textClassName={`has-${warning ? 'warning' : 'error'}`}
        error={(
            <FormattedMessage
                id='admin.group_settings.need_groupname'
                defaultMessage='You must specify the group name for mentioning.'
            />)}
    />
);

NeedGroupNameError.propTypes = {
    warning: PropTypes.bool,
};

export const DuplicateGroupNameError = () => (
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