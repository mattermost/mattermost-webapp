// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import * as Utils from 'utils/utils';

import InfoIcon from 'components/widgets/icons/info_icon';

export default class NavbarInfoButton extends React.PureComponent {
    static propTypes = {
        channel: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            showChannelInfo: PropTypes.func.isRequired,
        }).isRequired,
    };

    render() {
        const {channel, actions} = this.props;

        return (
            <button
                className='navbar-toggle navbar-right__icon navbar-info-button pull-right'
                aria-label={Utils.localizeMessage('accessibility.button.Info', 'Info')}
                onClick={() => {
                    actions.showChannelInfo(channel.id);
                }}
            >
                <InfoIcon
                    className='icon icon__info'
                    aria-hidden='true'
                />
            </button>
        );
    }
}
