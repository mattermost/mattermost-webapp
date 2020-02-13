// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router-dom';
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
        }
    },
};

interface State {
    response: Array<ChannelPermissions>;
}

interface Props {
    channelPermissions?: Array<ChannelPermissions>;
    onChannelPermissionsChanged: (name: string, guestsOrMembers: 'guests' | 'members') => void;
    teamSchemeName?: string;
    teamSchemeID?: string;
}

interface RowProps {
    name: string;
    guests?: any;
    members?: any;
    onClick: (name: string, guestsOrMembers: 'guests' | 'members') => void;
}

const ChannelModerationTableRow: React.FunctionComponent<RowProps> = (props: RowProps): JSX.Element => {
    let disabledKey;
    const isGuestsDisabled = props.guests && !props.guests.enabled;
    const isMembersDisabled = props.members && !props.members.enabled;
    if (isGuestsDisabled && isMembersDisabled) {
        disabledKey = 'disabled_both'
    } else if (isGuestsDisabled) {
        disabledKey = 'disabled_guests'
    } else if (isMembersDisabled) {
        disabledKey = 'disabled_members'
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
                    {/* <Link
                        to={'/admin_console/user_management/groups/' + this.props.mattermost_group_id}
                    >

                </Link> */}
                </div>
                <div>
                {disabledKey && 
                        <FormattedMessage
                            id={formattedMessages[props.name][disabledKey].id}
                            defaultMessage={formattedMessages[props.name][disabledKey].defaultMessage}
                        />
                    }
                </div>
            </td>
            <td>
                {!isNil(props.guests) &&
                    <button
                        className={classNames(
                            'checkbox',
                            {
                                checked: props.guests.value && props.guests.enabled,
                                disabled: !props.guests.enabled,
                            }
                        )}
                        onClick={() => props.onClick(props.name, 'guests')}
                        disabled={!props.guests.enabled}
                    >
                        {props.guests.value && props.guests.enabled && <CheckboxCheckedIcon/>}
                    </button>
                }
            </td>
            <td>
                {!isNil(props.members) &&
                    <button
                        className={classNames(
                            'checkbox',
                            {
                                checked: props.members.value && props.members.enabled,
                                disabled: !props.members.enabled,
                            }
                        )}
                        onClick={() => props.onClick(props.name, 'members')}
                        disabled={!props.members.enabled}
                    >
                        {props.members.value && props.members.enabled && <CheckboxCheckedIcon/>}
                    </button>
                }
            </td>
        </tr>
    );
};

export default class ChannelModeration extends React.Component<Props, State> {
    render = (): JSX.Element => {
        console.log(this.props)
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
