// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import './guest_badge.scss';

export default function GuestBadge(props) {
    return (
        <div className={'GuestBadge ' + props.className}>
            <FormattedMessage
                id='post_info.guest'
                defaultMessage='GUEST'
            />
        </div>
    );
}

GuestBadge.propTypes = {
    className: PropTypes.string,
};

GuestBadge.defaultProps = {
    className: '',
};
