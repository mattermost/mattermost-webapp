// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';
import {PropTypes} from 'prop-types';
import {Permissions} from 'mattermost-redux/constants';

import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import {intlShape} from 'utils/react_intl';

class ChannelMore extends React.PureComponent {
    static propTypes = {
        currentTeamId: PropTypes.string.isRequired,
        intl: intlShape.isRequired,
        sectionType: PropTypes.string.isRequired,
        moreChannels: PropTypes.func.isRequired,
        moreDirectMessages: PropTypes.func.isRequired,
        browsePublicDirectChannels: PropTypes.func.isRequired,
        viewArchivedChannels: PropTypes.bool,
    };

    moreChannelsPublic = () => {
        this.props.moreChannels('public');
    }
    moreChannelsPrivate = () => {
        this.props.moreChannels('private');
    }

    render() {
        const {
            sectionType,
            moreDirectMessages,
            browsePublicDirectChannels,
            viewArchivedChannels,
        } = this.props;

        const {formatMessage} = this.props.intl;

        switch (sectionType) {
        case 'public':
            return (
                <TeamPermissionGate
                    teamId={this.props.currentTeamId}
                    permissions={[Permissions.JOIN_PUBLIC_CHANNELS]}
                >
                    <li
                        key='public-channel-more'
                        data-testid='morePublicButton'
                    >
                        <button
                            id='sidebarPublicChannelsMore'
                            aria-label={formatMessage({id: 'sidebar.morePublicAria', defaultMessage: 'more public channels'})}
                            className='nav-more cursor--pointer style--none btn--block'
                            onClick={this.moreChannelsPublic}
                        >
                            <FormattedMessage
                                id='sidebar.moreElips'
                                defaultMessage='More...'
                            />
                        </button>
                    </li>
                </TeamPermissionGate>
            );
        case 'private':
            if (viewArchivedChannels) {
                return (
                    <TeamPermissionGate
                        teamId={this.props.currentTeamId}
                        permissions={[Permissions.JOIN_PUBLIC_CHANNELS]}
                    >
                        <li
                            key='public-channel-more'
                            data-testid='morePublicButton'
                        >
                            <button
                                id='sidebarPrivateChannelsMore'
                                aria-label={formatMessage({id: 'sidebar.morePublicAria', defaultMessage: 'more public channels'})}
                                className='nav-more cursor--pointer style--none btn--block'
                                onClick={this.moreChannelsPrivate}
                            >
                                <FormattedMessage
                                    id='sidebar.moreElips'
                                    defaultMessage='More...'
                                />
                            </button>
                        </li>
                    </TeamPermissionGate>
                );
            }
            return null;
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

export default injectIntl(ChannelMore);
