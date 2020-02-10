// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {t} from 'utils/i18n';

import AdminPanel from 'components/widgets/admin_console/admin_panel';
import CheckboxCheckedIcon from 'components/widgets/icons/checkbox_checked_icon.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import LineSwitch from '../../line_switch';

interface Props {

};

export const ChannelModeration: React.FunctionComponent<Props> = (props: Props): JSX.Element => {
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
                    id='team_and_channel_membership_table'
                    className='AdminPanel__table group-teams-and-channels'
                >
                    <thead>
                        <tr>
                            <th width='100%'>
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
                        <tr>
                            <td>
                                <label>Create Posts</label>
                                <div>
                                    The ability for members and guests to create posts in this channel. 
                                </div>
                            </td>
                            <td>
                            <button
                        className={`get-app__checkbox checked`}
                        onClick={() => console.log('clicked')}
                    >
                        <CheckboxCheckedIcon/>
                    </button>
                            </td>
                            <td>
                            <button
                        className={`get-app__checkbox checked`}
                        onClick={() => console.log('clicked')}
                    >
                        <CheckboxCheckedIcon/>
                    </button>
                            </td>
                        </tr>
                    </tbody>
                </table>


                </div>
            </div>
        </AdminPanel>
    );
};
