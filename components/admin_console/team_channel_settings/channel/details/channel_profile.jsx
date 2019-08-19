// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {t} from 'utils/i18n';

import AdminPanel from 'components/widgets/admin_console/admin_panel.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export const ChannelProfile = ({team, channel}) => (
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
                {channel.name}
                <br/>
                <FormattedMarkdownMessage
                    id='admin.channel_settings.channel_detail.channelTeam'
                    defaultMessage='**Team**'
                />
                <br/>
                {team.display_name}
            </div>
        </div>

    </AdminPanel>);

ChannelProfile.propTypes = {
    channel: PropTypes.object.isRequired,
    team: PropTypes.object.isRequired,
};
