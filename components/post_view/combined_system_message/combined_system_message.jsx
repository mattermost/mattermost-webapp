// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, intlShape} from 'react-intl';

import {Posts} from 'mattermost-redux/constants';

import {getDisplayNameByUserId, localizeMessage} from 'utils/utils.jsx';

import LastUsers from './last_users';

const allTypes = defineMessages({
    add: {
        one: {
            id: 'combined_system_message.system_add.one',
            defaultMessage: '{firstUser} {what} {actor}.',
        },
        two: {
            id: 'combined_system_message.system_add.two',
            defaultMessage: '{firstUser} and {secondUser} {what} {actor}.',
        },
    },
    other: {
        one: {
            id: 'combined_system_message.system_other.one',
            defaultMessage: '{firstUser} {what}.',
        },
        two: {
            id: 'combined_system_message.system_other.two',
            defaultMessage: '{firstUser} and {secondUser} {what}.',
        },
    },
    common: {
        many: {
            first: {
                id: 'combined_system_message.system_common.many.first',
                defaultMessage: '{firstUser} and ',
            },
            last: {
                id: 'combined_system_message.system_common.many.last',
                defaultMessage: '{lastUsersCount} others',
            },
            all: {
                id: 'combined_system_message.system_common.many.all',
                defaultMessage: '{firstUsers} and {lastUser} ',
            },
        },
    },
    what: {
        [Posts.POST_TYPES.ADD_TO_TEAM]: {
            id: 'combined_system_message.added_to_team',
            defaultMessage: 'added to the team by',
        },
        [Posts.POST_TYPES.ADD_TO_CHANNEL]: {
            id: 'combined_system_message.added_to_channel',
            defaultMessage: 'added to the channel by',
        },
        [Posts.POST_TYPES.JOIN_CHANNEL]: {
            id: 'combined_system_message.joined_channel',
            defaultMessage: 'joined the channel',
        },
        [Posts.POST_TYPES.LEAVE_CHANNEL]: {
            id: 'combined_system_message.left_channel',
            defaultMessage: 'left the channel',
        },
        [Posts.POST_TYPES.REMOVE_FROM_CHANNEL]: {
            one: {
                id: 'combined_system_message.removed_from_channel.one',
                defaultMessage: 'was removed from the channel',
            },
            many: {
                id: 'combined_system_message.removed_from_channel.many',
                defaultMessage: 'were removed from the channel',
            },
        },
        [Posts.POST_TYPES.JOIN_TEAM]: {
            id: 'combined_system_message.joined_team',
            defaultMessage: 'joined the team',
        },
        [Posts.POST_TYPES.LEAVE_TEAM]: {
            id: 'combined_system_message.left_team',
            defaultMessage: 'left the team.',
        },
        [Posts.POST_TYPES.REMOVE_FROM_TEAM]: {
            one: {
                id: 'combined_system_message.removed_from_team.one',
                defaultMessage: 'was removed from the team',
            },
            many: {
                id: 'combined_system_message.removed_from_team.many',
                defaultMessage: 'were removed from the team',
            },
        },
    },
});

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
            displayNames.push(localizeMessage('combined_system_message.you', 'You'));
        }

        return displayNames;
    }

    render() {
        const {
            currentUserId,
            userActivityProps,
        } = this.props;
        const {formatMessage} = this.context.intl;

        const messages = [];
        Object.entries(userActivityProps).forEach(([postType, values]) => {
            let formattedMessage;

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

                    const firstUser = userDisplayNames[0];
                    const lastUsersCount = userDisplayNames.length - 1;
                    const what = formatMessage(allTypes.what[postType]);

                    if (lastUsersCount === 0) {
                        formattedMessage = formatMessage(allTypes.add.one, {
                            firstUser,
                            what,
                            actor,
                        });
                    } else if (lastUsersCount === 1) {
                        formattedMessage = formatMessage(allTypes.add.two, {
                            firstUser,
                            secondUser: userDisplayNames[1],
                            what,
                            actor,
                        });
                    } else {
                        const lastIndex = userDisplayNames.length - 1;

                        const firstUserEl = formatMessage(allTypes.common.many.first, {firstUser});
                        const lastUsersEl = formatMessage(allTypes.common.many.last, {lastUsersCount});
                        const allUsersEl = formatMessage(allTypes.common.many.all, {
                            firstUsers: userDisplayNames.slice(0, lastIndex).join(', '),
                            lastUser: userDisplayNames[lastIndex]},
                        );

                        formattedMessage = (
                            <LastUsers
                                firstUserEl={firstUserEl}
                                lastUsersEl={lastUsersEl}
                                allUsersEl={allUsersEl}
                                what={what}
                                actor={actor}
                            />
                        );
                    }
                });
            } else {
                const userDisplayNames = this.getDisplayNameById(values) || [];

                const firstUser = userDisplayNames[0];
                const lastUsersCount = userDisplayNames.length - 1;

                let what;
                if (postType === Posts.POST_TYPES.REMOVE_FROM_TEAM || postType === Posts.POST_TYPES.REMOVE_FROM_CHANNEL) {
                    what = formatMessage(allTypes.what[postType].many);
                } else {
                    what = formatMessage(allTypes.what[postType]);
                }

                if (lastUsersCount === 0) {
                    if (postType === Posts.POST_TYPES.REMOVE_FROM_TEAM || postType === Posts.POST_TYPES.REMOVE_FROM_CHANNEL) {
                        what = formatMessage(allTypes.what[postType].one);
                    } else {
                        what = formatMessage(allTypes.what[postType]);
                    }

                    formattedMessage = formatMessage(allTypes.other.one, {
                        firstUser,
                        what,
                    });
                } else if (lastUsersCount === 1) {
                    formattedMessage = formatMessage(allTypes.other.two, {
                        firstUser,
                        secondUser: userDisplayNames[1],
                        what,
                    });
                } else {
                    const lastIndex = userDisplayNames.length - 1;

                    const firstUserEl = formatMessage(allTypes.common.many.first, {firstUser});
                    const lastUsersEl = formatMessage(allTypes.common.many.last, {lastUsersCount});
                    const allUsersEl = formatMessage(allTypes.common.many.all, {
                        firstUsers: userDisplayNames.slice(0, lastIndex).join(', '),
                        lastUser: userDisplayNames[lastIndex]},
                    );

                    formattedMessage = (
                        <LastUsers
                            firstUserEl={firstUserEl}
                            lastUsersEl={lastUsersEl}
                            allUsersEl={allUsersEl}
                            what={what}
                        />
                    );
                }
            }

            messages.push(formattedMessage);
        });

        return messages.map((m, i) => (<React.Fragment key={m + i}><span>{m}</span><br/></React.Fragment>));
    }
}
