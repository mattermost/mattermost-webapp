// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl, IntlShape, MessageDescriptor} from 'react-intl';

import {Posts} from 'mattermost-redux/constants';

import {Post, PostType} from 'mattermost-redux/types/posts';
import {UserProfile} from 'mattermost-redux/types/users';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import {t} from 'utils/i18n';

import LastUsers from './last_users';

const {
    JOIN_CHANNEL, ADD_TO_CHANNEL, REMOVE_FROM_CHANNEL, LEAVE_CHANNEL,
    JOIN_TEAM, ADD_TO_TEAM, REMOVE_FROM_TEAM, LEAVE_TEAM,
} = Posts.POST_TYPES;

const postTypeMessage = {
    [JOIN_CHANNEL]: {
        one: {
            id: t('combined_system_message.joined_channel.one'),
            defaultMessage: '{firstUser} **joined the channel**.',
        },
        one_you: {
            id: t('combined_system_message.joined_channel.one_you'),
            defaultMessage: 'You **joined the channel**.',
        },
        two: {
            id: t('combined_system_message.joined_channel.two'),
            defaultMessage: '{firstUser} and {secondUser} **joined the channel**.',
        },
        many_expanded: {
            id: t('combined_system_message.joined_channel.many_expanded'),
            defaultMessage: '{users} and {lastUser} **joined the channel**.',
        },
    },
    [ADD_TO_CHANNEL]: {
        one: {
            id: t('combined_system_message.added_to_channel.one'),
            defaultMessage: '{firstUser} **added to the channel** by {actor}.',
        },
        one_you: {
            id: t('combined_system_message.added_to_channel.one_you'),
            defaultMessage: 'You were **added to the channel** by {actor}.',
        },
        two: {
            id: t('combined_system_message.added_to_channel.two'),
            defaultMessage: '{firstUser} and {secondUser} **added to the channel** by {actor}.',
        },
        many_expanded: {
            id: t('combined_system_message.added_to_channel.many_expanded'),
            defaultMessage: '{users} and {lastUser} were **added to the channel** by {actor}.',
        },
    },
    [REMOVE_FROM_CHANNEL]: {
        one: {
            id: t('combined_system_message.removed_from_channel.one'),
            defaultMessage: '{firstUser} was **removed from the channel**.',
        },
        one_you: {
            id: t('combined_system_message.removed_from_channel.one_you'),
            defaultMessage: 'You were **removed from the channel**.',
        },
        two: {
            id: t('combined_system_message.removed_from_channel.two'),
            defaultMessage: '{firstUser} and {secondUser} were **removed from the channel**.',
        },
        many_expanded: {
            id: t('combined_system_message.removed_from_channel.many_expanded'),
            defaultMessage: '{users} and {lastUser} were **removed from the channel**.',
        },
    },
    [LEAVE_CHANNEL]: {
        one: {
            id: t('combined_system_message.left_channel.one'),
            defaultMessage: '{firstUser} **left the channel**.',
        },
        one_you: {
            id: t('combined_system_message.left_channel.one_you'),
            defaultMessage: 'You **left the channel**.',
        },
        two: {
            id: t('combined_system_message.left_channel.two'),
            defaultMessage: '{firstUser} and {secondUser} **left the channel**.',
        },
        many_expanded: {
            id: t('combined_system_message.left_channel.many_expanded'),
            defaultMessage: '{users} and {lastUser} **left the channel**.',
        },
    },
    [JOIN_TEAM]: {
        one: {
            id: t('combined_system_message.joined_team.one'),
            defaultMessage: '{firstUser} **joined the team**.',
        },
        one_you: {
            id: t('combined_system_message.joined_team.one_you'),
            defaultMessage: 'You **joined the team**.',
        },
        two: {
            id: t('combined_system_message.joined_team.two'),
            defaultMessage: '{firstUser} and {secondUser} **joined the team**.',
        },
        many_expanded: {
            id: t('combined_system_message.joined_team.many_expanded'),
            defaultMessage: '{users} and {lastUser} **joined the team**.',
        },
    },
    [ADD_TO_TEAM]: {
        one: {
            id: t('combined_system_message.added_to_team.one'),
            defaultMessage: '{firstUser} **added to the team** by {actor}.',
        },
        one_you: {
            id: t('combined_system_message.added_to_team.one_you'),
            defaultMessage: 'You were **added to the team** by {actor}.',
        },
        two: {
            id: t('combined_system_message.added_to_team.two'),
            defaultMessage: '{firstUser} and {secondUser} **added to the team** by {actor}.',
        },
        many_expanded: {
            id: t('combined_system_message.added_to_team.many_expanded'),
            defaultMessage: '{users} and {lastUser} were **added to the team** by {actor}.',
        },
    },
    [REMOVE_FROM_TEAM]: {
        one: {
            id: t('combined_system_message.removed_from_team.one'),
            defaultMessage: '{firstUser} was **removed from the team**.',
        },
        one_you: {
            id: t('combined_system_message.removed_from_team.one_you'),
            defaultMessage: 'You were **removed from the team**.',
        },
        two: {
            id: t('combined_system_message.removed_from_team.two'),
            defaultMessage: '{firstUser} and {secondUser} were **removed from the team**.',
        },
        many_expanded: {
            id: t('combined_system_message.removed_from_team.many_expanded'),
            defaultMessage: '{users} and {lastUser} were **removed from the team**.',
        },
    },
    [LEAVE_TEAM]: {
        one: {
            id: t('combined_system_message.left_team.one'),
            defaultMessage: '{firstUser} **left the team**.',
        },
        one_you: {
            id: t('combined_system_message.left_team.one_you'),
            defaultMessage: 'You **left the team**.',
        },
        two: {
            id: t('combined_system_message.left_team.two'),
            defaultMessage: '{firstUser} and {secondUser} **left the team**.',
        },
        many_expanded: {
            id: t('combined_system_message.left_team.many_expanded'),
            defaultMessage: '{users} and {lastUser} **left the team**.',
        },
    },
};

export type Props = {
    currentUserId: string;
    currentUsername: string;
    intl: IntlShape;

    // messageData: Array<{
    //     actorId?: string;
    //     postType: string;
    //     userIds: string[];
    // }>;
    posts: Post[];
    showJoinLeave: boolean;

    // userProfiles: UserProfile[];
}

export class CombinedSystemMessage extends React.PureComponent<Props> {
    getAllUsernames = (): {[p: string]: string} => {
        const {
            currentUserId,
            currentUsername,
            userProfiles,
        } = this.props;
        const {formatMessage} = this.props.intl;
        const usernames = userProfiles.reduce((acc: {[key: string]: string}, user: UserProfile) => {
            acc[user.id] = user.username;
            acc[user.username] = user.username;
            return acc;
        }, {});

        const currentUserDisplayName = formatMessage({id: t('combined_system_message.you'), defaultMessage: 'You'});
        usernames[currentUserId] = currentUserDisplayName;
        usernames[currentUsername] = currentUserDisplayName;

        return usernames;
    }

    getUsernamesByIds = (userIds: string[] = []): string[] => {
        const {currentUserId, currentUsername} = this.props;
        const allUsernames = this.getAllUsernames();

        const {formatMessage} = this.props.intl;
        const someone = formatMessage({id: t('channel_loader.someone'), defaultMessage: 'Someone'});

        const usernames = userIds.
            filter((userId) => {
                return userId !== currentUserId && userId !== currentUsername;
            }).
            map((userId) => {
                return allUsernames[userId] ? `@${allUsernames[userId]}` : someone;
            }).filter((username) => {
                return username && username !== '';
            });

        if (userIds.includes(currentUserId)) {
            usernames.unshift(allUsernames[currentUserId]);
        } else if (userIds.includes(currentUsername)) {
            usernames.unshift(allUsernames[currentUsername]);
        }

        return usernames;
    }

    renderFormattedMessage(postType: string, usernames: string[], actorId?: string): JSX.Element {
        const {formatMessage} = this.props.intl;
        const {currentUserId, currentUsername} = this.props;

        // const usernames = this.getUsernamesByIds(userIds);
        let actor = actorId ? this.getUsernamesByIds([actorId])[0] : '';
        if (actor && (actorId === currentUserId || actorId === currentUsername)) {
            actor = actor.toLowerCase();
        }

        const firstUser = usernames[0];
        const secondUser = usernames[1];
        const numOthers = usernames.length - 1;


        if (usernames.length > 2) {
            const options = {
                atMentions: true,
                mentionKeys: [{key: firstUser}, {key: secondUser}, {key: actor}],
                mentionHighlight: false,
                singleline: true,
            };

            return (
                <LastUsers
                    actor={actor}
                    expandedLocale={postTypeMessage[postType].many_expanded}
                    formatOptions={options}
                    postType={postType}
                    usernames={usernames}
                />
            );
        }

        let localeHolder: MessageDescriptor = {};
        if (numOthers === 0) {
            localeHolder = postTypeMessage[postType].one;

            if (
                (usernames[0] === this.props.currentUsername) &&
                postTypeMessage[postType].one_you
            ) {
                localeHolder = postTypeMessage[postType].one_you;
            }
        } else if (numOthers === 1) {
            localeHolder = postTypeMessage[postType].two;
        }

        return (
            <FormattedMarkdownMessage
                id={localeHolder.id}
                defaultMessage={localeHolder.defaultMessage}
                values={{
                    firstUser,
                    secondUser,
                    actor,
                }}
            />
        );

        // const formattedMessage = formatMessage(localeHolder, {firstUser, secondUser, actor});

        // return (
        //     <Markdown
        //         message={formattedMessage}
        //         options={options}
        //     />
        // );
    }

    renderMessage(postType: string, usernames: string[], actorId?: string): JSX.Element {
        return (
            <React.Fragment key={postType + actorId}>
                {this.renderFormattedMessage(postType, usernames, actorId)}
                <br/>
            </React.Fragment>
        );
    }

    render(): JSX.Element {
        const {
            currentUsername,
            posts,
        } = this.props;

        type Row = {
            type: PostType;
            actorId: string;
            usernames: string[];
        }

        const rows: Row[] = [];
        for (const post of posts) {
            const lastRow = rows[rows.length - 1];

            let actorId;
            let username;
            if ([JOIN_CHANNEL, LEAVE_CHANNEL, JOIN_TEAM, LEAVE_TEAM].includes(post.type)) {
                // JOIN_CHANNEL, JOIN_TEAM, LEAVE_CHANNEL, and LEAVE_TEAM provide username (actor) in props
                actorId = post.user_id;
                username = post.props.username;
            } else if ([ADD_TO_CHANNEL, ADD_TO_TEAM].includes(post.type)) {
                // ADD_TO_CHANNEL and ADD_TO_TEAM provide username (actor), userId (actor), addedUserId, and
                // addedUsername in props
                actorId = post.user_id;
                username = post.props.addedUsername;
            } else if (post.type === REMOVE_FROM_CHANNEL) {
                // REMOVE_FROM_CHANNEL provides removedUserId and removedUsername in props
                actorId = '';
                username = post.props.removedUsername;
            } else if (post.type === REMOVE_FROM_TEAM) {
                // REMOVE_FROM_TEAM provides username (removed user) in props and the post.user_id is the removed
                // user instead of the actor
                actorId = '';
                username = post.props.username;
            } else {
                continue;
            }

            if (lastRow && lastRow.type === post.type && lastRow.actorId === actorId) {
                lastRow.usernames.push(username);
            } else {
                rows.push({
                    type: post.type,
                    actorId,
                    usernames: [username],
                });
            }
        }

        // Ensure the current user always comes first in the list
        for (const row of rows) {
            if (!row.usernames.includes(currentUsername)) {
                continue;
            }

            row.usernames.sort((a, b) => {
                if (a === currentUsername) {
                    return -1;
                } else if (b === currentUsername) {
                    return 1;
                }

                return 0;
            });
        }

        const content = rows.map((row) => this.renderMessage(row.type, row.usernames, row.actorId));

        // const content = [];
        // const removedUserIds = [];
        // for (const message of messageData) {
        //     const {
        //         postType,
        //         actorId,
        //     } = message;
        //     let userIds = message.userIds;

        //     if (!this.props.showJoinLeave && actorId !== currentUserId) {
        //         const affectsCurrentUser = userIds.indexOf(currentUserId) !== -1;

        //         if (affectsCurrentUser) {
        //             // Only show the message that the current user was added, etc
        //             userIds = [currentUserId];
        //         } else {
        //             // Not something the current user did or was affected by
        //             continue;
        //         }
        //     }

        //     if (postType === REMOVE_FROM_CHANNEL) {
        //         removedUserIds.push(...userIds);
        //         continue;
        //     }

        //     content.push(this.renderMessage(postType, userIds, actorId));
        // }

        // if (removedUserIds.length > 0) {
        //     const uniqueRemovedUserIds = removedUserIds.filter((id, index, arr) => arr.indexOf(id) === index);
        //     content.push(this.renderMessage(REMOVE_FROM_CHANNEL, uniqueRemovedUserIds, currentUserId));
        // }

        return (
            <React.Fragment>
                {content}
            </React.Fragment>
        );
    }
}

export default injectIntl(CombinedSystemMessage);
