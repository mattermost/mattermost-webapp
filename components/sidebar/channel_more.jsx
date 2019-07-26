// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, intlShape} from 'react-intl';
import {PropTypes} from 'prop-types';
import {Permissions} from 'mattermost-redux/constants';

import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';

export default class ChannelMore extends React.PureComponent {
    static propTypes = {
        currentTeamId: PropTypes.string.isRequired,
        sectionType: PropTypes.string.isRequired,
        moreChannels: PropTypes.func.isRequired,
        moreDirectMessages: PropTypes.func.isRequired,
        browsePublicDirectChannels: PropTypes.func.isRequired,
    };

    static contextTypes = {
        intl: intlShape,
    };

    render() {
        const {
            sectionType,
            moreChannels,
            moreDirectMessages,
            browsePublicDirectChannels,
        } = this.props;

        const {formatMessage} = this.context.intl;

        switch (sectionType) {
        case 'public':
            return (
                <TeamPermissionGate
                    teamId={this.props.currentTeamId}
                    permissions={[Permissions.JOIN_PUBLIC_CHANNELS]}
                >
                    <li
                        key='public-channel-more'
                        id='morePublicButton'
                    >
                        <button
                            id='sidebarChannelsMore'
                            aria-label={formatMessage({id: 'sidebar.morePublicAria', defaultMessage: 'more public channels'})}
                            className='nav-more cursor--pointer style--none btn--block'
                            onClick={moreChannels}
                        >
                            <FormattedMessage
                                id='sidebar.moreElips'
                                defaultMessage='More...'
                            />
                        </button>
                    </li>
                </TeamPermissionGate>
            );
        case 'direct':
            return (
                <li
                    key='dm-more'
                    id='moreDMButton'
                >
                    <button
                        id='moreDirectMessage'
                        aria-label={formatMessage({id: 'sidebar.moreDmAria', defaultMessage: 'more direct messages'})}
                        className='nav-more cursor--pointer style--none btn--block'
                        onClick={moreDirectMessages}
                    >
                        <FormattedMessage
                            id='sidebar.moreElips'
                            defaultMessage='More...'
                        />
                    </button>
                </li>
            );
        case 'recent':
        case 'alpha':
            return (
                <li
                    key='public-dm-more'
                    id='moreRecentAlphaButton'
                >
                    <button
                        id='morePublicDirectChannels'
                        aria-label={formatMessage({id: 'sidebar.morePublicDmAria', defaultMessage: 'more public channels direct messages'})}
                        className='nav-more cursor--pointer style--none btn--block'
                        onClick={browsePublicDirectChannels}
                    >
                        <FormattedMessage
                            id='sidebar.moreElips'
                            defaultMessage='More...'
                        />
                    </button>
                </li>
            );
        }

        return null;
    }
}
