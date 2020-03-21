// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, defineMessages} from 'react-intl';

import {isNil} from 'lodash';
import classNames from 'classnames';
import {ChannelModeration as ChannelPermissions} from 'mattermost-redux/types/channels';
import {Permissions, Roles} from 'mattermost-redux/constants';
import {ChannelModerationRoles} from 'mattermost-redux/types/roles';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import {t} from 'utils/i18n';

import AdminPanel from 'components/widgets/admin_console/admin_panel';
import CheckboxCheckedIcon from 'components/widgets/icons/checkbox_checked_icon.jsx';

const PERIOD_TO_SLASH_REGEX = /\./g;

const formattedMessages: any = defineMessages({
    [Permissions.CHANNEL_MODERATED_PERMISSIONS.CREATE_POST]: {
        title: {
            id: t('admin.channel_settings.channel_moderation.createPosts'),
            defaultMessage: 'Create Posts'
        },
        description: {
            id: t('admin.channel_settings.channel_moderation.createPostsDesc'),
            defaultMessage: 'The ability for members and guests to create posts in the channel.'
        },
        disabledGuests: {
            id: t('admin.channel_settings.channel_moderation.createPosts.disabledGuest'),
            defaultMessage: 'Create posts for guests are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabledMembers: {
            id: t('admin.channel_settings.channel_moderation.createPosts.disabledMember'),
            defaultMessage: 'Create posts for members are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabledBoth: {
            id: t('admin.channel_settings.channel_moderation.createPosts.disabledBoth'),
            defaultMessage: 'Create posts for members and guests are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        }
    },

    [Permissions.CHANNEL_MODERATED_PERMISSIONS.CREATE_REACTIONS]: {
        title: {
            id: t('admin.channel_settings.channel_moderation.postReactions'),
            defaultMessage: 'Post Reactions'
        },
        description: {
            id: t('admin.channel_settings.channel_moderation.postReactionsDesc'),
            defaultMessage: 'The ability for members and guests to post reactions.'
        },
        disabledGuests: {
            id: t('admin.channel_settings.channel_moderation.postReactions.disabledGuest'),
            defaultMessage: 'Post reactions for guests are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabledMembers: {
            id: t('admin.channel_settings.channel_moderation.postReactions.disabledMember'),
            defaultMessage: 'Post reactions for members are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabledBoth: {
            id: t('admin.channel_settings.channel_moderation.postReactions.disabledBoth'),
            defaultMessage: 'Post reactions for members and guests are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        }
    },

    [Permissions.CHANNEL_MODERATED_PERMISSIONS.MANAGE_MEMBERS]: {
        title: {
            id: t('admin.channel_settings.channel_moderation.manageMembers'),
            defaultMessage: 'Manage Members'
        },
        description: {
            id: t('admin.channel_settings.channel_moderation.manageMembersDesc'),
            defaultMessage: 'The ability for members to add and remove people.'
        },
        disabledGuests: {
            id: t('admin.channel_settings.channel_moderation.manageMembers.disabledGuest'),
            defaultMessage: 'Manage members for guests are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabledMembers: {
            id: t('admin.channel_settings.channel_moderation.manageMembers.disabledMember'),
            defaultMessage: 'Manage members for members are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabledBoth: {
            id: t('admin.channel_settings.channel_moderation.manageMembers.disabledBoth'),
            defaultMessage: 'Manage members for members and guests are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        }
    },

    [Permissions.CHANNEL_MODERATED_PERMISSIONS.USE_CHANNEL_MENTIONS]: {
        title: {
            id: t('admin.channel_settings.channel_moderation.channelMentions'),
            defaultMessage: 'Channel Mentions'
        },
        description: {
            id: t('admin.channel_settings.channel_moderation.channelMentionsDesc'),
            defaultMessage: 'The ability for members and guests to use @all, @here and @channel.'
        },
        disabledGuests: {
            id: t('admin.channel_settings.channel_moderation.channelMentions.disabledGuest'),
            defaultMessage: 'Channel mentions for guests are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabledMembers: {
            id: t('admin.channel_settings.channel_moderation.channelMentions.disabledMember'),
            defaultMessage: 'Channel mentions for members are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabledBoth: {
            id: t('admin.channel_settings.channel_moderation.channelMentions.disabledBoth'),
            defaultMessage: 'Channel mentions for members and guests are disabled in [{scheme_name}](../permissions/{scheme_link}).'
        },
        disabledGuestsDueToCreatePosts: {
            id: t('admin.channel_settings.channel_moderation.channelMentions.disabledGuestsDueToCreatePosts'),
            defaultMessage: 'Guests can not use channel mentions without the ability to create posts.'
        },
        disabledMembersDueToCreatePosts: {
            id: t('admin.channel_settings.channel_moderation.channelMentions.disabledMemberDueToCreatePosts'),
            defaultMessage: 'Members can not use channel mentions without the ability to create posts.'
        },
        disabledBothDueToCreatePosts: {
            id: t('admin.channel_settings.channel_moderation.channelMentions.disabledBothDueToCreatePosts'),
            defaultMessage: 'Guests and members can not use channel mentions without the ability to create posts.'
        }
    },

    title: {
        id: t('admin.channel_settings.channel_moderation.title'),
        defaultMessage: 'Channel Moderation (Beta)',
    },
    subtitle: {
        id: t('admin.channel_settings.channel_moderation.subtitle'),
        defaultMessage: 'Manage the actions available to channel members and guests.'
    },
    permissions: {
        id: t('admin.channel_settings.channel_moderation.permissions'),
        defaultMessage: 'Permissions'
    },
    guests: {
        id: t('admin.channel_settings.channel_moderation.guests'),
        defaultMessage: 'Guests',
    },
    members: {
        id: t('admin.channel_settings.channel_moderation.members'),
        defaultMessage: 'Members',
    }
});

interface Props {
    channelPermissions?: Array<ChannelPermissions>;
    onChannelPermissionsChanged: (name: string, channelRole: ChannelModerationRoles) => void;
    teamSchemeID?: string;
    teamSchemeDisplayName?: string;
}

interface RowProps {
    name: string;
    guests?: boolean;
    members: boolean;
    guestsDisabled?: boolean;
    membersDisabled: boolean;
    onClick: (name: string, channelRole: ChannelModerationRoles) => void;
    errorMessages?: any;
}

const ChannelModerationTableRow: React.FunctionComponent<RowProps> = (props: RowProps): JSX.Element => {
    return (
        <tr>
            <td>
                <label
                    data-testid={formattedMessages[props.name].title.id.replace(PERIOD_TO_SLASH_REGEX,'-')}
                >
                    <FormattedMessage
                        id={formattedMessages[props.name].title.id}
                        defaultMessage={formattedMessages[props.name].title.defaultMessage}
                    />
                </label>
                <div
                    data-testid={formattedMessages[props.name].description.id.replace(PERIOD_TO_SLASH_REGEX,'-')}
                >
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
                        data-testid={`${props.name}-${Roles.GUESTS}`}
                        className={classNames(
                            'checkbox',
                            {
                                checked: props.guests && !props.guestsDisabled,
                                disabled: props.guestsDisabled,
                            }
                        )}
                        onClick={() => props.onClick(props.name, Roles.GUESTS as ChannelModerationRoles)}
                        disabled={props.guestsDisabled}
                    >
                        {props.guests && !props.guestsDisabled && <CheckboxCheckedIcon/>}
                    </button>
                }
            </td>
            <td>
                {!isNil(props.members) &&
                    <button
                        data-testid={`${props.name}-${Roles.MEMBERS}`}
                        className={classNames(
                            'checkbox',
                            {
                                checked: props.members && !props.membersDisabled,
                                disabled: props.membersDisabled,
                            }
                        )}
                        onClick={() => props.onClick(props.name, Roles.MEMBERS as ChannelModerationRoles)}
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
        if (entry.name === Permissions.CHANNEL_MODERATED_PERMISSIONS.USE_CHANNEL_MENTIONS) {
            const createPostsObject = this.props.channelPermissions && this.props.channelPermissions!.find((permission) => permission.name === Permissions.CHANNEL_MODERATED_PERMISSIONS.CREATE_POST);
            if (!createPostsObject!.roles.guests!.value && !createPostsObject!.roles.members!.value) {
                errorMessages.push(
                    <div
                        data-testid={formattedMessages[entry.name].disabledBothDueToCreatePosts.id.replace(PERIOD_TO_SLASH_REGEX,'-')}
                        key={formattedMessages[entry.name].disabledBothDueToCreatePosts.id}
                    >
                        <FormattedMessage
                            id={formattedMessages[entry.name].disabledBothDueToCreatePosts.id}
                            defaultMessage={formattedMessages[entry.name].disabledBothDueToCreatePosts.defaultMessage}
                        />
                    </div>
                );
                return errorMessages;
            } else if (!createPostsObject!.roles.guests!.value) {
                createPostsKey = 'disabledGuestsDueToCreatePosts';
            } else if (!createPostsObject!.roles.members!.value) {
                createPostsKey = 'disabledMembersDueToCreatePosts';
            }

            if (createPostsKey !== '') {
                errorMessages.push(
                    <div
                        data-testid={formattedMessages[entry.name][createPostsKey].id.replace(PERIOD_TO_SLASH_REGEX,'-')}
                        key={formattedMessages[entry.name][createPostsKey].id}
                    >
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
            disabledKey = 'disabledBoth';
        } else if (isGuestsDisabled && createPostsKey !== 'disabledGuestsDueToCreatePosts') {
            disabledKey = 'disabledGuests';
        } else if (isMembersDisabled && createPostsKey !== 'disabledMembersDueToCreatePosts') {
            disabledKey = 'disabledMembers';
        }
        if (disabledKey) {
            let schemeName = 'System Scheme';
            let schemeLink = 'system_scheme';
            if (this.props.teamSchemeID) {
                schemeName = this.props.teamSchemeDisplayName + ' Team Scheme';
                schemeLink = `team_override_scheme/${this.props.teamSchemeID}`;
            }
            errorMessages.push(
                <div
                    data-testid={formattedMessages[entry.name][disabledKey].id.replace(PERIOD_TO_SLASH_REGEX,'-')}
                    key={formattedMessages[entry.name][disabledKey].id}
                >
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
                titleId={formattedMessages.title.id}
                titleDefault={formattedMessages.title.defaultMessage}
                subtitleId={formattedMessages.subtitle.id}
                subtitleDefault={formattedMessages.subtitle.defaultMessage}
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
                                            id={formattedMessages.permissions.id}
                                            defaultMessage={formattedMessages.permissions.defaultMessage}
                                        />
                                    </th>
                                    <th>
                                        <FormattedMessage
                                            id={formattedMessages.guests.id}
                                            defaultMessage={formattedMessages.guests.defaultMessage}
                                        />
                                    </th>
                                    <th>
                                        <FormattedMessage
                                            id={formattedMessages.members.id}
                                            defaultMessage={formattedMessages.members.defaultMessage}
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
