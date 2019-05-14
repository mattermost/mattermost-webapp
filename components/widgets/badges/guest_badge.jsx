// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import Badge from './badge.jsx';

export default function GuestBadge(props) {
    return (
        <Badge
            className={'GuestBadge ' + props.className}
            show={props.show}
        >
            <FormattedMessage
                id='post_info.guest'
                defaultMessage='GUEST'
            />
        </Badge>
    );
}

GuestBadge.propTypes = {
    className: PropTypes.string,
    show: PropTypes.bool,
};

GuestBadge.defaultProps = {
    show: true,
    className: '',
};
