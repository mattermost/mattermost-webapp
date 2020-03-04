// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import AdminPanel from 'components/widgets/admin_console/admin_panel';
import GroupProfile from 'components/admin_console/group_settings/group_details/group_profile';

import {t} from 'utils/i18n';

import LineSwitch from 'components/admin_console/team_channel_settings/line_switch.jsx';

const GroupSettingsToggle = ({isDefault, allowReference, onToggle}) => (
    <LineSwitch
        disabled={isDefault}
        toggled={allowReference}
        last={allowReference}
        onToggle={() => {
            if (isDefault) {
                return;
            }
            onToggle(!allowReference);
        }}
        singleLine={true}
        title={(
            <FormattedMessage
                id='admin.team_settings.team_details.groupDetailsToggle'
                defaultMessage='Enable Mentions and Invites'
            />
        )}
        subTitle={(
            <FormattedMarkdownMessage
                id='admin.team_settings.team_details.groupDetailsToggleDescr'
                defaultMessage='When enabled, the group will be visible and accessible to user mention or invite this group and its memb ers by the name below'
            />
        )}
    />);

GroupSettingsToggle.propTypes = {
    isDefault: PropTypes.bool.isRequired,
    allowReference: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
};

export const GroupProfileAndSettings = ({name, allowReference, onToggle}) => (
    <AdminPanel
        id='group_profile'
        titleId={t('admin.group_settings.group_detail.groupProfileTitle')}
        titleDefault='Group Profile'
        subtitleId={t('admin.group_settings.group_detail.groupProfileDescription')}
        subtitleDefault='The name for this group.'
    >
        <GroupProfile
            name={name}
        />
        <GroupSettingsToggle
            isDefault={false}
            allowReference={allowReference}
            onToggle={onToggle}
        />
    </AdminPanel>);

GroupProfileAndSettings.propTypes = {
    name: PropTypes.string.isRequired,
    allowReference: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
};
