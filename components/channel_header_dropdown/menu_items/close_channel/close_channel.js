// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

export default class CloseChannel extends React.PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            goToLastViewedChannel: PropTypes.func.isRequired,
        }).isRequired,
    }

    handleClose = () => {
        this.props.actions.goToLastViewedChannel();
    }

    render() {
        return (
            <li role='presentation'>
                <button
                    className='style--none'
                    role='menuitem'
                    onClick={this.handleClose}
                >
                    <FormattedMessage
                        id='center_panel.archived.closeChannel'
                        defaultMessage='Close Channel'
                    />
                </button>
            </li>
        );
    }
}
