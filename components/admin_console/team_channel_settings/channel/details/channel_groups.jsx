// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {t} from 'utils/i18n';

import AdminPanel from 'components/widgets/admin_console/admin_panel.jsx';
import ToggleModalButton from 'components/toggle_modal_button';
import AddGroupsToChannelModal from 'components/add_groups_to_channel_modal';
import GroupList from '../../group';

export const ChannelGroups = ({onGroupRemoved, onAddCallback, totalGroups, groups, removedGroups, channel, synced}) => (
    <AdminPanel
        id='channel_groups'
        titleId={synced ? t('admin.channel_settings.channel_detail.syncedGroupsTitle') : t('admin.channel_settings.channel_detail.groupsTitle')}
        titleDefault={synced ? 'Synced Groups' : 'Groups'}
        subtitleId={synced ? t('admin.channel_settings.channel_detail.syncedGroupsDescription') : t('admin.channel_settings.channel_detail.groupsDescription')}
        subtitleDefault={synced ? 'Add and remove team members based on their group membership on the next scheduled sync.' : 'Group members will be added to the channel based on your sync schedule.'}
        button={
            <ToggleModalButton
                className='btn btn-primary'
                dialogType={AddGroupsToChannelModal}
                dialogProps={{
                    channel,
                    onAddCallback,
                    skipCommit: true,
                    includeGroups: removedGroups,
                    excludeGroups: groups,
                }}
            >
                <FormattedMessage
                    id='admin.channel_settings.channel_details.add_group'
                    defaultMessage='Add Group'
                />
            </ToggleModalButton>}
    >
        {channel.id && (
            <GroupList
                channel={channel}
                groups={groups}
                totalGroups={totalGroups}
                onGroupRemoved={onGroupRemoved}
                isModeSync={synced}
            />
        )}

    </AdminPanel>);

ChannelGroups.propTypes = {
    synced: PropTypes.bool.isRequired,
    channel: PropTypes.object.isRequired,
    onAddCallback: PropTypes.func.isRequired,
    totalGroups: PropTypes.number.isRequired,
    groups: PropTypes.arrayOf(PropTypes.object).isRequired,
    removedGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    onGroupRemoved: PropTypes.func.isRequired,
};
