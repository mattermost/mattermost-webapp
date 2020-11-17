// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

export default class NavigationButton extends React.PureComponent {
    static propTypes = {
        onClick: PropTypes.func.isRequired,
        messageId: PropTypes.string.isRequired,
        defaultMessage: PropTypes.string.isRequired,
    };

    onClick = (e) => {
        e.preventDefault();
        this.props.onClick();
    };

    render() {
        const {onClick, messageId, defaultMessage} = this.props;
        return (
            <button
                className='btn btn-link'
                onClick={onClick}
            >
                <FormattedMessage
                    id={messageId}
                    defaultMessage={defaultMessage}
                />
            </button>
        );
    }
}
