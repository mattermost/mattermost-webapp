// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Channel} from 'mattermost-redux/types/channels';
import {Team} from 'mattermost-redux/types/teams';

import {t} from 'utils/i18n';

import AdminPanel from 'components/widgets/admin_console/admin_panel';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

interface ChannelProfileProps {
    channel: Partial<Channel>;
    team: Partial<Team>;
}

export const ChannelProfile: React.SFC<ChannelProfileProps> = (props: ChannelProfileProps): JSX.Element => {
    const {team, channel} = props;
    return (
        <AdminPanel
            id='channel_profile'
            titleId={t('admin.channel_settings.channel_detail.profileTitle')}
            titleDefault='Channel Profile'
            subtitleId={t('admin.channel_settings.channel_detail.profileDescription')}
            subtitleDefault='Summary of the channel, including the channel name.'
        >
            <div className='group-teams-and-channels'>
                <div className='group-teams-and-channels--body'>
                    <FormattedMarkdownMessage
                        id='admin.channel_settings.channel_detail.channelName'
                        defaultMessage='**Name**'
                    />
                    <br/>
                    {channel.display_name}
                    <br/>
                    <FormattedMarkdownMessage
                        id='admin.channel_settings.channel_detail.channelTeam'
                        defaultMessage='**Team**'
                    />
                    <br/>
                    {team.display_name}
                </div>
            </div>
        </AdminPanel>
    );
};
