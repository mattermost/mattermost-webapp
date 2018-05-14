// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl';

import {Posts} from 'mattermost-redux/constants';

const typeMessage = {
    [Posts.POST_TYPES.ADD_TO_CHANNEL]: {
        id: 'last_users_message.added_to_channel.type',
        defaultMessage: 'were <b>added to the channel</b> by {actor}.',
    },
    [Posts.POST_TYPES.JOIN_CHANNEL]: {
        id: 'last_users_message.joined_channel.type',
        defaultMessage: '<b>joined the channel</b>.',
    },
    [Posts.POST_TYPES.LEAVE_CHANNEL]: {
        id: 'last_users_message.left_channel.type',
        defaultMessage: '<b>left the channel</b>.',
    },
    [Posts.POST_TYPES.REMOVE_FROM_CHANNEL]: {
        id: 'last_users_message.removed_from_channel.type',
        defaultMessage: 'were <b>removed from the channel</b>.',
    },
    [Posts.POST_TYPES.ADD_TO_TEAM]: {
        id: 'last_users_message.added_to_team.type',
        defaultMessage: 'were <b>added to the team</b> by {actor}.',
    },
    [Posts.POST_TYPES.JOIN_TEAM]: {
        id: 'last_users_message.joined_team.type',
        defaultMessage: '<b>joined the team</b>.',
    },
    [Posts.POST_TYPES.LEAVE_TEAM]: {
        id: 'last_users_message.left_team.type',
        defaultMessage: '<b>left the team</b>.',
    },
    [Posts.POST_TYPES.REMOVE_FROM_TEAM]: {
        id: 'last_users_message.removed_from_team.type',
        defaultMessage: 'were <b>removed from the team</b>.',
    },
};

export default class LastUsers extends React.PureComponent {
    static propTypes = {
        actor: PropTypes.string,
        expandedLocale: PropTypes.object.isRequired,
        postType: PropTypes.string.isRequired,
        userDisplayNames: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            expand: false,
        };
    }

    handleOnClick = (e) => {
        e.preventDefault();

        this.setState({expand: true});
    }

    render() {
        const {expand} = this.state;
        const {
            actor,
            expandedLocale,
            postType,
            userDisplayNames,
        } = this.props;

        const lastIndex = userDisplayNames.length - 1;

        if (expand) {
            return (
                <FormattedHTMLMessage
                    id={expandedLocale.id}
                    defaultMessage={expandedLocale.defaultMessage}
                    values={{
                        users: userDisplayNames.slice(0, lastIndex).join(', '),
                        lastUser: userDisplayNames[lastIndex],
                        actor,
                    }}
                />
            );
        }

        return (
            <React.Fragment>
                <FormattedMessage
                    id={'last_users_message.first'}
                    defaultMessage={'{firstUser} and '}
                    values={{
                        firstUser: userDisplayNames[0],
                    }}
                />
                <a onClick={this.handleOnClick}>
                    <FormattedMessage
                        id={'last_users_message.others'}
                        defaultMessage={'{numOthers} others '}
                        values={{
                            numOthers: lastIndex,
                        }}
                    />
                </a>
                <FormattedHTMLMessage
                    id={typeMessage[postType].id}
                    defaultMessage={typeMessage[postType].defaultMessage}
                    values={{
                        actor,
                    }}
                />
            </React.Fragment>
        );
    }
}
