// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router-dom';
import {Scheme} from 'mattermost-redux/types/schemes';
import {FormattedMessage} from 'react-intl';
import {isNil} from 'lodash';
import classNames from 'classnames';
import {ChannelModeration as ChannelPermissions} from 'mattermost-redux/types/channels';

import {t} from 'utils/i18n';

import AdminPanel from 'components/widgets/admin_console/admin_panel';
import CheckboxCheckedIcon from 'components/widgets/icons/checkbox_checked_icon.jsx';

const formattedMessages: any = {
    create_post: {
        title: {
            id: 'admin.channel_settings.channel_moderation.createPosts',
            defaultMessage: 'Create Posts'
        },
        description: {
            id: 'admin.channel_settings.channel_moderation.createPostsDesc',
            defaultMessage: 'The ability for members and guests to create posts in the channel.'
        },
        disabled_guests: {
            id: 'admin.channel_settings.channel_moderation.createPosts.disabledGuest',
            defaultMessage: 'Create posts for guests is disabled in'
        },
        disabled_members: {
            id: 'admin.channel_settings.channel_moderation.createPosts.disabledMember',
            defaultMessage: 'Create posts for members is disabled in'
        },
        disabled_both: {
            id: 'admin.channel_settings.channel_moderation.createPosts.disabledBoth',
            defaultMessage: 'Create posts for members and guests is disabled in'
        }
    },

    create_reactions: {
        title: {
            id: 'admin.channel_settings.channel_moderation.postReactions',
            defaultMessage: 'Post Reactions'
        },
        description: {
            id: 'admin.channel_settings.channel_moderation.postReactionsDesc',
            defaultMessage: 'The ability for members and guests to post reactions.'
        },
        disabled_guests: {
            id: 'admin.channel_settings.channel_moderation.postReactions.disabledGuest',
            defaultMessage: 'Post reactions for guests is disabled in'
        },
        disabled_members: {
            id: 'admin.channel_settings.channel_moderation.postReactions.disabledMember',
            defaultMessage: 'Post reactions for members is disabled in'
        },
        disabled_both: {
            id: 'admin.channel_settings.channel_moderation.postReactions.disabledBoth',
            defaultMessage: 'Post reactions for members and guests is disabled in'
        }
    },

    manage_members: {
        title: {
            id: 'admin.channel_settings.channel_moderation.manageMembers',
            defaultMessage: 'Manage Members'
        },
        description: {
            id: 'admin.channel_settings.channel_moderation.manageMembersDesc',
            defaultMessage: 'The ability for members to add and remove people.'
        },
        disabled_guests: {
            id: 'admin.channel_settings.channel_moderation.manageMembers.disabledGuest',
            defaultMessage: 'Manage members for guests is disabled in'
        },
        disabled_members: {
            id: 'admin.channel_settings.channel_moderation.manageMembers.disabledMember',
            defaultMessage: 'Manage members for members is disabled in'
        },
        disabled_both: {
            id: 'admin.channel_settings.channel_moderation.manageMembers.disabledBoth',
            defaultMessage: 'Manage members for members and guests is disabled in'
        }
    },

    use_channel_mentions: {
        title: {
            id: 'admin.channel_settings.channel_moderation.channelMentions',
            defaultMessage: 'Channel Mentions'
        },
        description: {
            id: 'admin.channel_settings.channel_moderation.channelMentionsDesc',
            defaultMessage: 'The ability for members and guests to use @all, @here and @channel.'
        },
        disabled_guests: {
            id: 'admin.channel_settings.channel_moderation.channelMentions.disabledGuest',
            defaultMessage: 'Channel mentions for guests is disabled in'
        },
        disabled_members: {
            id: 'admin.channel_settings.channel_moderation.channelMentions.disabledMember',
            defaultMessage: 'Channel mentions for members is disabled in'
        },
        disabled_both: {
            id: 'admin.channel_settings.channel_moderation.channelMentions.disabledBoth',
            defaultMessage: 'Channel mentions for members and guests is disabled in'
        },

        disabled_guests_due_to_create_posts: {
            id: 'admin.channel_settings.channel_moderation.channelMentions.disabledGuestsDueToCreatePosts',
            defaultMessage: 'Guests can not use channel mentions without the ability to create posts.'
        },
        disabled_members_due_to_create_posts: {
            id: 'admin.channel_settings.channel_moderation.channelMentions.disabledMemberDueToCreatePosts',
            defaultMessage: 'Members can not use channel mentions without the ability to create posts.'
        },
        disabled_both_due_to_create_posts: {
            id: 'admin.channel_settings.channel_moderation.channelMentions.disabledBothDueToCreatePosts',
            defaultMessage: 'Guests and members can not use channel mentions without the ability to create posts.'
        }
    },
    system_scheme: {
        link: '/admin_console/user_management/permissions/system_scheme',
        id: 'admin.channel_settings.channel_moderation.systemScheme',
        defaultMessage: 'System Scheme',
    },
    team_scheme: {
        link: '/admin_console/user_management/permissions/team_override_scheme/',
        id: 'admin.channel_settings.channel_moderation.teamScheme',
        defaultMessage: 'Team Scheme',
    }
};

interface State {
    response: Array<ChannelPermissions>;
}

interface Props {
    channelPermissions?: Array<ChannelPermissions>;
    onChannelPermissionsChanged: (name: string, guestsOrMembers: 'guests' | 'members') => void;
    teamScheme?: Scheme;
}

interface RowProps {
    name: string;
    guests?: any;
    members?: any;
    onClick: (name: string, guestsOrMembers: 'guests' | 'members') => void;
    teamScheme?: Scheme;
    createPostsObject?: ChannelPermissions | null;
}

const ChannelModerationTableRow: React.FunctionComponent<RowProps> = (props: RowProps): JSX.Element => {
    let disabledKey;
    let isGuestsDisabled = props.guests && !props.guests.enabled;
    let isMembersDisabled = props.members && !props.members.enabled;
    if (isGuestsDisabled && isMembersDisabled) {
        disabledKey = 'disabled_both';
    } else if (isGuestsDisabled) {
        disabledKey = 'disabled_guests';
    } else if (isMembersDisabled) {
        disabledKey = 'disabled_members';
    }

    let disabledLinkKey = '';
    if (disabledKey && props.teamScheme) {
        disabledLinkKey = 'team_scheme';
    } else if (disabledKey) {
        disabledLinkKey = 'system_scheme';
    }

    let disabledDueToCreatePosts;
    if (props.createPostsObject) {
        if (!props.createPostsObject.roles.guests!.value && !props.createPostsObject.roles.members!.value) {
            disabledDueToCreatePosts = 'disabled_both_due_to_create_posts';
            disabledKey = '';
            isGuestsDisabled = true;
            isMembersDisabled = true;
        } else if (!props.createPostsObject.roles.guests!.value) {
            disabledDueToCreatePosts = 'disabled_guests_due_to_create_posts';
            isGuestsDisabled = true;
            disabledKey = disabledKey === 'disabled_guests' ? null : disabledKey;
        } else if (!props.createPostsObject.roles.members!.value) {
            disabledDueToCreatePosts = 'disabled_members_due_to_create_posts';
            isMembersDisabled = true;
            disabledKey = disabledKey === 'disabled_members' ? null : disabledKey;
        }
    }

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
                <div>
                    {disabledDueToCreatePosts &&
                    <FormattedMessage
                        id={formattedMessages[props.name][disabledDueToCreatePosts].id}
                        defaultMessage={formattedMessages[props.name][disabledDueToCreatePosts].defaultMessage}
                    />
                    }
                </div>
                <div>
                    {disabledKey &&
                    <FormattedMessage
                        id={formattedMessages[props.name][disabledKey].id}
                        defaultMessage={formattedMessages[props.name][disabledKey].defaultMessage}
                    />
                    }
                    {' '}
                    {disabledKey &&
                    <Link
                        to={`${formattedMessages[disabledLinkKey].link}${disabledLinkKey === 'team_scheme' ? props.teamScheme!.id : ''}`}
                    >
                        {disabledLinkKey === 'team_scheme' && `${props.teamScheme!.display_name} `}
                        <FormattedMessage
                            id={`${formattedMessages[disabledLinkKey].id}`}
                            defaultMessage={`${formattedMessages[disabledLinkKey].defaultMessage}`}
                        />
                    </Link>
                    }
                </div>
            </td>
            <td>
                {!isNil(props.guests) &&
                    <button
                        className={classNames(
                            'checkbox',
                            {
                                checked: props.guests.value && !isGuestsDisabled,
                                disabled: isGuestsDisabled,
                            }
                        )}
                        onClick={() => props.onClick(props.name, 'guests')}
                        disabled={isGuestsDisabled}
                    >
                        {props.guests.value && !isGuestsDisabled && <CheckboxCheckedIcon/>}
                    </button>
                }
            </td>
            <td>
                {!isNil(props.members) &&
                    <button
                        className={classNames(
                            'checkbox',
                            {
                                checked: props.members.value && !isMembersDisabled,
                                disabled: isMembersDisabled,
                            }
                        )}
                        onClick={() => props.onClick(props.name, 'members')}
                        disabled={isMembersDisabled}
                    >
                        {props.members.value && !isMembersDisabled && <CheckboxCheckedIcon/>}
                    </button>
                }
            </td>
        </tr>
    );
};

export default class ChannelModeration extends React.Component<Props, State> {
    render = (): JSX.Element => {
        const createPostsObject = this.props.channelPermissions && this.props.channelPermissions!.filter((permission) => permission.name === 'create_post')[0];
        return (
            <AdminPanel
                id='channel_moderation'
                titleId={t('admin.channel_settings.channel_moderation.title')}
                titleDefault='Channel Moderation'
                subtitleId={t('admin.channel_settings.channel_moderation.subtitle')}
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
                                            guests={entry.roles.guests}
                                            members={entry.roles.members}
                                            onClick={this.props.onChannelPermissionsChanged}
                                            teamScheme={this.props.teamScheme}
                                            createPostsObject={entry.name === 'use_channel_mentions' ? createPostsObject : null}
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
