// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, intlShape} from 'react-intl';

import {Posts} from 'mattermost-redux/constants';

import {
    areObjectsEqual,
    getDisplayNameByUserId,
    localizeMessage,
} from 'utils/utils.jsx';

import LastUsers from './last_users';

const combinedSystemMessage = {
    [Posts.POST_TYPES.ADD_TO_CHANNEL]: {
        one: {
            id: 'combined_system_message.added_to_channel.one',
            defaultMessage: '{firstUser} <b>added to channel</b> by {actor}.',
        },
        two: {
            id: 'combined_system_message.added_to_channel.two',
            defaultMessage: '{firstUser} and {secondUser} <b>added to channel</b> by {actor}.',
        },
        many_expanded: {
            id: 'combined_system_message.added_to_channel.many_expanded',
            defaultMessage: '{users} and {lastUser} <b>added to channel</b> by {actor}.',
        },
    },
    [Posts.POST_TYPES.JOIN_CHANNEL]: {
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
    [Posts.POST_TYPES.LEAVE_CHANNEL]: {
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
    [Posts.POST_TYPES.REMOVE_FROM_CHANNEL]: {
        one: {
            id: 'combined_system_message.removed_from_channel.one',
            defaultMessage: '{firstUser} was <b>removed from the channel</b>.',
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
    [Posts.POST_TYPES.ADD_TO_TEAM]: {
        one: {
            id: 'combined_system_message.added_to_team.one',
            defaultMessage: '{firstUser} <b>added to the team</b> by {actor}.',
        },
        two: {
            id: 'combined_system_message.added_to_team.two',
            defaultMessage: '{firstUser} and {secondUser} <b>added to the team</b> by {actor}.',
        },
        many_expanded: {
            id: 'combined_system_message.added_to_team.many_expanded',
            defaultMessage: '{users} and {lastUser} <b>added to the team</b> by {actor}.',
        },
    },
    [Posts.POST_TYPES.JOIN_TEAM]: {
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
    [Posts.POST_TYPES.LEAVE_TEAM]: {
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
    [Posts.POST_TYPES.REMOVE_FROM_TEAM]: {
        one: {
            id: 'combined_system_message.removed_from_team.one',
            defaultMessage: '{firstUser} was <b>removed from the team</b>.',
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
};

export default class CombinedSystemMessage extends React.PureComponent {
    static propTypes = {
        currentUserId: PropTypes.string.isRequired,
        userActivityProps: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            getMissingProfilesByIds: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        userActivityProps: [],
    };

    static contextTypes = {
        intl: intlShape,
    };

    constructor(props) {
        super(props);

        this.getMissingProfiles();
    }

    componentWillReceiveProps = (nextProps) => {
        if (areObjectsEqual(nextProps.userActivityProps, this.props.userActivityProps)) {
            this.getMissingProfiles();
        }
    }

    getMissingProfiles = async () => {
        const {userActivityProps} = this.props;
        let userIds = [];

        Object.entries(userActivityProps).forEach(([postType, values]) => {
            if (
                postType === Posts.POST_TYPES.ADD_TO_TEAM ||
                postType === Posts.POST_TYPES.ADD_TO_CHANNEL
            ) {
                Object.entries(values).forEach(([actorId, otherUserIds]) => {
                    userIds = [...userIds, ...otherUserIds, actorId];
                });
            } else {
                userIds = [...userIds, ...values];
            }
        });

        const missingProfiles = await this.props.actions.getMissingProfilesByIds(userIds);

        // trick to load missing profiles
        this.setState({missingProfiles});
    }

    getDisplayNameById = (userIds = []) => {
        const {
            currentUserId,
        } = this.props;

        const displayNames = userIds.
            filter((userId) => {
                return userId !== currentUserId;
            }).
            map((userId) => {
                return getDisplayNameByUserId(userId);
            });

        const userInProp = userIds.includes(currentUserId);
        if (userInProp) {
            displayNames.unshift(localizeMessage('combined_system_message.you', 'You'));
        }

        return displayNames;
    }

    generateFormattedMessage(postType, userDisplayNames, actor) {
        const firstUser = userDisplayNames[0];
        const numOthers = userDisplayNames.length - 1;

        let formattedMessage;
        if (numOthers === 0) {
            formattedMessage = (
                <FormattedHTMLMessage
                    id={combinedSystemMessage[postType].one.id}
                    defaultMessage={combinedSystemMessage[postType].one.defaultMessage}
                    values={{
                        firstUser,
                        actor,
                    }}
                />
            );
        } else if (numOthers === 1) {
            formattedMessage = (
                <FormattedHTMLMessage
                    id={combinedSystemMessage[postType].two.id}
                    defaultMessage={combinedSystemMessage[postType].two.defaultMessage}
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
                    expandedLocale={combinedSystemMessage[postType].many_expanded}
                    postType={postType}
                    userDisplayNames={userDisplayNames}
                />
            );
        }

        return formattedMessage;
    }

    render() {
        const {
            currentUserId,
            userActivityProps,
        } = this.props;

        const messages = [];
        Object.entries(userActivityProps).forEach(([postType, values]) => {
            if (
                postType === Posts.POST_TYPES.ADD_TO_TEAM ||
                postType === Posts.POST_TYPES.ADD_TO_CHANNEL
            ) {
                Object.entries(values).forEach(([actorId, userIds]) => {
                    let actor = this.getDisplayNameById([actorId])[0] || '';
                    if (actorId === currentUserId) {
                        actor = actor.toLowerCase();
                    }
                    const userDisplayNames = this.getDisplayNameById(userIds) || [];

                    messages.push(this.generateFormattedMessage(postType, userDisplayNames, actor));
                });
            } else {
                const userDisplayNames = this.getDisplayNameById(values) || [];
                messages.push(this.generateFormattedMessage(postType, userDisplayNames));
            }
        });

        return messages.map((m, i) => (<React.Fragment key={m + i}><span>{m}</span><br/></React.Fragment>));
    }
}
