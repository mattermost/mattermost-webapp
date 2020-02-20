// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {isNil} from 'lodash';
import classNames from 'classnames';
import {ChannelModeration as ChannelPermissions} from 'mattermost-redux/types/channels';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import {t} from 'utils/i18n';

import AdminPanel from 'components/widgets/admin_console/admin_panel';
import CheckboxCheckedIcon from 'components/widgets/icons/checkbox_checked_icon.jsx';
t('admin.channel_settings.channel_moderation.title');
t('admin.channel_settings.channel_moderation.subtitle');
t('admin.channel_settings.channel_moderation.permissions');
t('admin.channel_settings.channel_moderation.guests');
t('admin.channel_settings.channel_moderation.members');
const formattedMessages: any = {
    create_post: {
        title: {
            id: t('admin.channel_settings.channel_moderation.createPosts'),
            defaultMessage: 'Create Posts'
        },
        description: {
            id: t('admin.channel_settings.channel_moderation.createPostsDesc'),
            defaultMessage: 'The ability for members and guests to create posts in the channel.'
        },
        disabled_guests: {
            id: t('admin.channel_settings.channel_moderation.createPosts.disabledGuest'),
            defaultMessage: 'Create posts for guests are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabled_members: {
            id: t('admin.channel_settings.channel_moderation.createPosts.disabledMember'),
            defaultMessage: 'Create posts for members are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabled_both: {
            id: t('admin.channel_settings.channel_moderation.createPosts.disabledBoth'),
            defaultMessage: 'Create posts for members and guests are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        }
    },

    create_reactions: {
        title: {
            id: t('admin.channel_settings.channel_moderation.postReactions'),
            defaultMessage: 'Post Reactions'
        },
        description: {
            id: t('admin.channel_settings.channel_moderation.postReactionsDesc'),
            defaultMessage: 'The ability for members and guests to post reactions.'
        },
        disabled_guests: {
            id: t('admin.channel_settings.channel_moderation.postReactions.disabledGuest'),
            defaultMessage: 'Post reactions for guests are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabled_members: {
            id: t('admin.channel_settings.channel_moderation.postReactions.disabledMember'),
            defaultMessage: 'Post reactions for members are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabled_both: {
            id: t('admin.channel_settings.channel_moderation.postReactions.disabledBoth'),
            defaultMessage: 'Post reactions for members and guests are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        }
    },

    manage_members: {
        title: {
            id: t('admin.channel_settings.channel_moderation.manageMembers'),
            defaultMessage: 'Manage Members'
        },
        description: {
            id: t('admin.channel_settings.channel_moderation.manageMembersDesc'),
            defaultMessage: 'The ability for members to add and remove people.'
        },
        disabled_guests: {
            id: t('admin.channel_settings.channel_moderation.manageMembers.disabledGuest'),
            defaultMessage: 'Manage members for guests are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabled_members: {
            id: t('admin.channel_settings.channel_moderation.manageMembers.disabledMember'),
            defaultMessage: 'Manage members for members are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabled_both: {
            id: t('admin.channel_settings.channel_moderation.manageMembers.disabledBoth'),
            defaultMessage: 'Manage members for members and guests are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        }
    },

    use_channel_mentions: {
        title: {
            id: t('admin.channel_settings.channel_moderation.channelMentions'),
            defaultMessage: 'Channel Mentions'
        },
        description: {
            id: t('admin.channel_settings.channel_moderation.channelMentionsDesc'),
            defaultMessage: 'The ability for members and guests to use @all, @here and @channel.'
        },
        disabled_guests: {
            id: t('admin.channel_settings.channel_moderation.channelMentions.disabledGuest'),
            defaultMessage: 'Channel mentions for guests are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabled_members: {
            id: t('admin.channel_settings.channel_moderation.channelMentions.disabledMember'),
            defaultMessage: 'Channel mentions for members are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabled_both: {
            id: t('admin.channel_settings.channel_moderation.channelMentions.disabledBoth'),
            defaultMessage: 'Channel mentions for members and guests are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },

        disabled_guests_due_to_create_posts: {
            id: t('admin.channel_settings.channel_moderation.channelMentions.disabledGuestsDueToCreatePosts'),
            defaultMessage: 'Guests can not use channel mentions without the ability to create posts.'
        },
        disabled_members_due_to_create_posts: {
            id: t('admin.channel_settings.channel_moderation.channelMentions.disabledMemberDueToCreatePosts'),
            defaultMessage: 'Members can not use channel mentions without the ability to create posts.'
        },
        disabled_both_due_to_create_posts: {
            id: t('admin.channel_settings.channel_moderation.channelMentions.disabledBothDueToCreatePosts'),
            defaultMessage: 'Guests and members can not use channel mentions without the ability to create posts.'
        }
    },
};

interface Props {
    channelPermissions?: Array<ChannelPermissions>;
    onChannelPermissionsChanged: (name: string, channelRole: 'guests' | 'members') => void;
    teamSchemeID?: string;
    teamSchemeDisplayName?: string;
}

interface RowProps {
    name: string;
    guests?: boolean;
    members: boolean;
    guestsDisabled?: boolean;
    membersDisabled: boolean;
    onClick: (name: string, channelRole: 'guests' | 'members') => void;
    errorMessages?: any;
}

const ChannelModerationTableRow: React.FunctionComponent<RowProps> = (props: RowProps): JSX.Element => {
    return (
        <tr>
            <td>
                <label>
                    <FormattedMessage
                        id={formattedMessages[props.name].title.id}
                        defaultMessage={formattedMessages[props.name].title.defaultMessage}
                    />
                </label>
                <div>
                    <FormattedMessage
                        id={formattedMessages[props.name].description.id}
                        defaultMessage={formattedMessages[props.name].description.defaultMessage}
                    />
                </div>
                {props.errorMessages}
            </td>
            <td>
                {!isNil(props.guests) &&
                    <button
                        className={classNames(
                            'checkbox',
                            {
                                checked: props.guests && !props.guestsDisabled,
                                disabled: props.guestsDisabled,
                            }
                        )}
                        onClick={() => props.onClick(props.name, 'guests')}
                        disabled={props.guestsDisabled}
                    >
                        {props.guests && !props.guestsDisabled && <CheckboxCheckedIcon/>}
                    </button>
                }
            </td>
            <td>
                {!isNil(props.members) &&
                    <button
                        className={classNames(
                            'checkbox',
                            {
                                checked: props.members && !props.membersDisabled,
                                disabled: props.membersDisabled,
                            }
                        )}
                        onClick={() => props.onClick(props.name, 'members')}
                        disabled={props.membersDisabled}
                    >
                        {props.members && !props.membersDisabled && <CheckboxCheckedIcon/>}
                    </button>
                }
            </td>
        </tr>
    );
};

export default class ChannelModeration extends React.Component<Props> {
    private errorMessagesToDisplay = (entry: ChannelPermissions): Array<any> => {
        const errorMessages: Array<any> = [];
        const isGuestsDisabled = !isNil(entry.roles.guests?.['enabled']) && !entry.roles.guests?.['enabled'];
        const isMembersDisabled = !entry.roles.members.enabled;
        let createPostsKey = '';
        if (entry.name === 'use_channel_mentions') {
            const createPostsObject = this.props.channelPermissions && this.props.channelPermissions!.filter((permission) => permission.name === 'create_post')[0];
            if (!createPostsObject!.roles.guests!.value && !createPostsObject!.roles.members!.value) {
                errorMessages.push(
                    <div key={formattedMessages[entry.name].disabled_both_due_to_create_posts.id}>
                        <FormattedMessage
                            id={formattedMessages[entry.name].disabled_both_due_to_create_posts.id}
                            defaultMessage={formattedMessages[entry.name].disabled_both_due_to_create_posts.defaultMessage}
                        />
                    </div>
                );
                return errorMessages;
            } else if (!createPostsObject!.roles.guests!.value) {
                createPostsKey = 'disabled_guests_due_to_create_posts';
            } else if (!createPostsObject!.roles.members!.value) {
                createPostsKey = 'disabled_members_due_to_create_posts';
            }

            if (createPostsKey !== '') {
                errorMessages.push(
                    <div key={formattedMessages[entry.name][createPostsKey].id}>
                        <FormattedMessage
                            id={formattedMessages[entry.name][createPostsKey].id}
                            defaultMessage={formattedMessages[entry.name][createPostsKey].defaultMessage}
                        />
                    </div>
                );
            }
        }

        let disabledKey;
        if (isGuestsDisabled && isMembersDisabled && errorMessages.length <= 0) {
            disabledKey = 'disabled_both';
        } else if (isGuestsDisabled && createPostsKey !== 'disabled_guests_due_to_create_posts') {
            disabledKey = 'disabled_guests';
        } else if (isMembersDisabled && createPostsKey !== 'disabled_members_due_to_create_posts') {
            disabledKey = 'disabled_members';
        }
        if (disabledKey) {
            let schemeName = 'System Scheme';
            let schemeLink = 'system_scheme';
            if (this.props.teamSchemeID) {
                schemeName = this.props.teamSchemeDisplayName + ' Team Scheme';
                schemeLink = `team_override_scheme/${this.props.teamSchemeID}`;
            }
            errorMessages.push(
                <div key={formattedMessages[entry.name][disabledKey].id}>
                    <FormattedMarkdownMessage
                        id={formattedMessages[entry.name][disabledKey].id}
                        defaultMessage={formattedMessages[entry.name][disabledKey].defaultMessage}
                        values={{
                            scheme_name: schemeName,
                            scheme_link: schemeLink
                        }}
                    />
                </div>
            );
        }
        return errorMessages;
    }

    render = (): JSX.Element => {
        return (
            <AdminPanel
                id='channel_moderation'
                titleId='admin.channel_settings.channel_moderation.title'
                titleDefault='Channel Moderation'
                subtitleId='admin.channel_settings.channel_moderation.subtitle'
                subtitleDefault='Manage the actions available to channel members and guests.'
            >
                <div className='channel-moderation'>
                    <div className='channel-moderation--body'>

                        <table
                            id='channel_moderation_table'
                            className='channel-moderation--table'
                        >
                            <thead>
                                <tr>
                                    <th>
                                        <FormattedMessage
                                            id='admin.channel_settings.channel_moderation.permissions'
                                            defaultMessage='Permissions'
                                        />
                                    </th>
                                    <th>
                                        <FormattedMessage
                                            id='admin.channel_settings.channel_moderation.guests'
                                            defaultMessage='Guests'
                                        />
                                    </th>
                                    <th>
                                        <FormattedMessage
                                            id='admin.channel_settings.channel_moderation.members'
                                            defaultMessage='Members'
                                        />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.channelPermissions && this.props.channelPermissions.map((entry) => {
                                    return (
                                        <ChannelModerationTableRow
                                            key={entry.name}
                                            name={entry.name}
                                            guests={entry.roles.guests?.['value']}
                                            guestsDisabled={!entry.roles.guests?.['enabled']}
                                            members={entry.roles.members.value}
                                            membersDisabled={!entry.roles.members.enabled}
                                            onClick={this.props.onChannelPermissionsChanged}
                                            errorMessages={this.errorMessagesToDisplay(entry)}
                                        />
                                    );
                                })}

                            </tbody>
                        </table>

                    </div>
                </div>
            </AdminPanel>
        );
    }
}
