// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage} from 'react-intl';

import {Posts} from 'mattermost-redux/constants';

import {
    getDisplayNameByUserId,
    localizeMessage,
} from 'utils/utils.jsx';

import LastUsers from './last_users';

const {
    JOIN_CHANNEL, ADD_TO_CHANNEL, REMOVE_FROM_CHANNEL, LEAVE_CHANNEL,
    JOIN_TEAM, ADD_TO_TEAM, REMOVE_FROM_TEAM, LEAVE_TEAM,
} = Posts.POST_TYPES;

const postTypeMessage = {
    [JOIN_CHANNEL]: {
        one: {
            id: 'combined_system_message.joined_channel.one',
            defaultMessage: '{firstUser} <b>joined the channel</b>.',
        },
        two: {
            id: 'combined_system_message.joined_channel.two',
            defaultMessage: '{firstUser} and {secondUser} <b>joined the channel</b>.',
        },
        many_expanded: {
            id: 'combined_system_message.joined_channel.many_expanded',
            defaultMessage: '{users} and {lastUser} <b>joined the channel</b>.',
        },
    },
    [ADD_TO_CHANNEL]: {
        one: {
            id: 'combined_system_message.added_to_channel.one',
            defaultMessage: '{firstUser} <b>added to the channel</b> by {actor}.',
        },
        one_you: {
            id: 'combined_system_message.added_to_channel.one_you',
            defaultMessage: 'You were <b>added to the channel</b> by {actor}.',
        },
        two: {
            id: 'combined_system_message.added_to_channel.two',
            defaultMessage: '{firstUser} and {secondUser} <b>added to the channel</b> by {actor}.',
        },
        many_expanded: {
            id: 'combined_system_message.added_to_channel.many_expanded',
            defaultMessage: '{users} and {lastUser} were <b>added to the channel</b> by {actor}.',
        },
    },
    [REMOVE_FROM_CHANNEL]: {
        one: {
            id: 'combined_system_message.removed_from_channel.one',
            defaultMessage: '{firstUser} was <b>removed from the channel</b>.',
        },
        one_you: {
            id: 'combined_system_message.removed_from_channel.one_you',
            defaultMessage: 'You were <b>removed from the channel</b>.',
        },
        two: {
            id: 'combined_system_message.removed_from_channel.two',
            defaultMessage: '{firstUser} and {secondUser} were <b>removed from the channel</b>.',
        },
        many_expanded: {
            id: 'combined_system_message.removed_from_channel.many_expanded',
            defaultMessage: '{users} and {lastUser} were <b>removed from the channel</b>.',
        },
    },
    [LEAVE_CHANNEL]: {
        one: {
            id: 'combined_system_message.left_channel.one',
            defaultMessage: '{firstUser} <b>left the channel</b>.',
        },
        two: {
            id: 'combined_system_message.left_channel.two',
            defaultMessage: '{firstUser} and {secondUser} <b>left the channel</b>.',
        },
        many_expanded: {
            id: 'combined_system_message.left_channel.many_expanded',
            defaultMessage: '{users} and {lastUser} <b>left the channel</b>.',
        },
    },
    [JOIN_TEAM]: {
        one: {
            id: 'combined_system_message.joined_team.one',
            defaultMessage: '{firstUser} <b>joined the team</b>.',
        },
        two: {
            id: 'combined_system_message.joined_team.two',
            defaultMessage: '{firstUser} and {secondUser} <b>joined the team</b>.',
        },
        many_expanded: {
            id: 'combined_system_message.joined_team.many_expanded',
            defaultMessage: '{users} and {lastUser} <b>joined the team</b>.',
        },
    },
    [ADD_TO_TEAM]: {
        one: {
            id: 'combined_system_message.added_to_team.one',
            defaultMessage: '{firstUser} <b>added to the team</b> by {actor}.',
        },
        one_you: {
            id: 'combined_system_message.added_to_team.one_you',
            defaultMessage: 'You were <b>added to the team</b> by {actor}.',
        },
        two: {
            id: 'combined_system_message.added_to_team.two',
            defaultMessage: '{firstUser} and {secondUser} <b>added to the team</b> by {actor}.',
        },
        many_expanded: {
            id: 'combined_system_message.added_to_team.many_expanded',
            defaultMessage: '{users} and {lastUser} were <b>added to the team</b> by {actor}.',
        },
    },
    [REMOVE_FROM_TEAM]: {
        one: {
            id: 'combined_system_message.removed_from_team.one',
            defaultMessage: '{firstUser} was <b>removed from the team</b>.',
        },
        one_you: {
            id: 'combined_system_message.removed_from_team.one_you',
            defaultMessage: 'You were <b>removed from the team</b>.',
        },
        two: {
            id: 'combined_system_message.removed_from_team.two',
            defaultMessage: '{firstUser} and {secondUser} were <b>removed from the team</b>.',
        },
        many_expanded: {
            id: 'combined_system_message.removed_from_team.many_expanded',
            defaultMessage: '{users} and {lastUser} were <b>removed from the team</b>.',
        },
    },
    [LEAVE_TEAM]: {
        one: {
            id: 'combined_system_message.left_team.one',
            defaultMessage: '{firstUser} <b>left the team</b>.',
        },
        two: {
            id: 'combined_system_message.left_team.two',
            defaultMessage: '{firstUser} and {secondUser} <b>left the team</b>.',
        },
        many_expanded: {
            id: 'combined_system_message.left_team.many_expanded',
            defaultMessage: '{users} and {lastUser} <b>left the team</b>.',
        },
    },
};

export default class CombinedSystemMessage extends React.PureComponent {
    static propTypes = {
        currentUserId: PropTypes.string.isRequired,
        messageData: PropTypes.array.isRequired,
        allUserIds: PropTypes.array.isRequired,
        actions: PropTypes.shape({
            getMissingProfilesByIds: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            missingProfiles: [],
        };
    }

    componentDidMount() {
        this.loadMissingProfiles();
    }

    loadMissingProfiles = async () => {
        const {
            actions,
            allUserIds,
        } = this.props;
        const missingProfiles = await actions.getMissingProfilesByIds(allUserIds);
        this.setState({missingProfiles});
    }

    getDisplayNameByIds = (userIds = []) => {
        const {currentUserId} = this.props;

        const displayNames = userIds.
            filter((userId) => {
                return userId !== currentUserId;
            }).
            map((userId) => {
                return getDisplayNameByUserId(userId, true);
            });

        const userInProp = userIds.includes(currentUserId);
        if (userInProp) {
            displayNames.unshift(localizeMessage('combined_system_message.you', 'You'));
        }

        return displayNames;
    }

    renderFormattedMessage(postType, userIds, actorId) {
        const userDisplayNames = this.getDisplayNameByIds(userIds);
        let actor = actorId ? this.getDisplayNameByIds([actorId])[0] : '';
        if (actorId === this.props.currentUserId) {
            actor = actor.toLowerCase();
        }

        const firstUser = userDisplayNames[0];
        const numOthers = userDisplayNames.length - 1;

        let formattedMessage;
        if (numOthers === 0) {
            formattedMessage = (
                <FormattedHTMLMessage
                    id={postTypeMessage[postType].one.id}
                    defaultMessage={postTypeMessage[postType].one.defaultMessage}
                    values={{
                        firstUser,
                        actor,
                    }}
                />
            );

            if (
                userIds[0] === this.props.currentUserId &&
                postTypeMessage[postType].one_you
            ) {
                formattedMessage = (
                    <FormattedHTMLMessage
                        id={postTypeMessage[postType].one_you.id}
                        defaultMessage={postTypeMessage[postType].one_you.defaultMessage}
                        values={{
                            actor,
                        }}
                    />
                );
            }
        } else if (numOthers === 1) {
            formattedMessage = (
                <FormattedHTMLMessage
                    id={postTypeMessage[postType].two.id}
                    defaultMessage={postTypeMessage[postType].two.defaultMessage}
                    values={{
                        firstUser,
                        secondUser: userDisplayNames[1],
                        actor,
                    }}
                />
            );
        } else {
            formattedMessage = (
                <LastUsers
                    actor={actor}
                    expandedLocale={postTypeMessage[postType].many_expanded}
                    postType={postType}
                    userDisplayNames={userDisplayNames}
                />
            );
        }

        return formattedMessage;
    }

    render() {
        const {messageData} = this.props;

        return (
            <React.Fragment>
                {messageData.map(({postType, userIds, actorId}) => {
                    return (
                        <React.Fragment key={postType + actorId}>
                            <span>
                                {this.renderFormattedMessage(postType, userIds, actorId)}
                            </span>
                            <br/>
                        </React.Fragment>
                    );
                })}
            </React.Fragment>
        );
    }
}
