// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default function ErrorLink({url, messageId, defaultMessage}) {
    return (
        <a
            href={url}
            rel='noopener noreferrer'
            target='_blank'
        >
            <FormattedMessage
                id={messageId}
                defaultMessage={defaultMessage}
            />
        </a>
    );
}

ErrorLink.propTypes = {
    url: PropTypes.string.isRequired,
    messageId: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string.isRequired,
};

ErrorLink.defaultProps = {
    url: '',
    messageId: '',
    defaultMessage: '',
};
