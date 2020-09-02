// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Channel} from 'mattermost-redux/types/channels';
import {Team} from 'mattermost-redux/types/teams';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {t} from 'utils/i18n';

import AdminPanel from 'components/widgets/admin_console/admin_panel';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import ArchiveIcon from 'components/widgets/icons/archive_icon';
import UnarchiveIcon from 'components/widgets/icons/unarchive_icon';

interface ChannelProfileProps {
    channel: Partial<Channel>;
    team: Partial<Team>;
    onToggleArchive?: () => void;
    isArchived: boolean;
    isDisabled?: boolean;
}

export const ChannelProfile: React.SFC<ChannelProfileProps> = (props: ChannelProfileProps): JSX.Element => {
    const {team, channel, isArchived, isDisabled} = props;

    let archiveBtnID;
    let archiveBtnDefault;
    if (isArchived) {
        t('admin.channel_settings.channel_details.unarchiveChannel');
        archiveBtnID = 'admin.channel_settings.channel_details.unarchiveChannel';
        archiveBtnDefault = 'Unarchive Channel';
    } else {
        t('admin.channel_settings.channel_details.archiveChannel');
        archiveBtnID = 'admin.channel_settings.channel_details.archiveChannel';
        archiveBtnDefault = 'Archive Channel';
    }

    return (
        <AdminPanel
            id='channel_profile'
            titleId={t('admin.channel_settings.channel_detail.profileTitle')}
            titleDefault='Channel Profile'
            subtitleId={t('admin.channel_settings.channel_detail.profileDescription')}
            subtitleDefault='Summary of the channel, including the channel name.'
        >
            <div className='group-teams-and-channels AdminChannelDetails'>
                <div className='group-teams-and-channels--body channel-desc-col'>
                    <div className='channel-name'>
                        <FormattedMarkdownMessage
                            id='admin.channel_settings.channel_detail.channelName'
                            defaultMessage='**Name**'
                        />
                        <br/>
                        {channel.display_name}
                    </div>
                    <div className='channel-team'>
                        <FormattedMarkdownMessage
                            id='admin.channel_settings.channel_detail.channelTeam'
                            defaultMessage='**Team**'
                        />
                        <br/>
                        {team.display_name}
                    </div>
                    <div className='AdminChannelDetails_archiveContainer'>
                        <button
                            className={classNames('btn', 'btn-secondary', 'ArchiveButton', {ArchiveButton___archived: isArchived}, {ArchiveButton___unarchived: !isArchived}, {disabled: isDisabled})}
                            onClick={props.onToggleArchive}
                        >
                            {isArchived ? <UnarchiveIcon className='channel-icon channel-icon__unarchive'/> : <ArchiveIcon className='channel-icon channel-icon__archive'/>}
                            <FormattedMessage
                                id={archiveBtnID}
                                defaultMessage={archiveBtnDefault}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </AdminPanel>
    );
};
