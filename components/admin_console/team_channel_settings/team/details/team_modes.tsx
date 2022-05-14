// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {t} from 'utils/i18n';
import AdminPanel from 'components/widgets/admin_console/admin_panel';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import LineSwitch from '../../line_switch.jsx';

type ToggleProps = {
    syncChecked: boolean;
    allAllowedChecked: boolean;
    allowedDomainsChecked: boolean;
    allowedDomains: string;
    onToggle: (syncChecked: boolean, allAllowedChecked: boolean, allowedDomainsChecked: boolean, allowedDomains: string) => void;
    isDisabled?: boolean;
}

const SyncGroupsToggle = ({syncChecked, allAllowedChecked, allowedDomainsChecked, allowedDomains, onToggle, isDisabled}: ToggleProps) => (
    <LineSwitch
        id='syncGroupSwitch'
        disabled={isDisabled}
        toggled={syncChecked}
        last={syncChecked}
        onToggle={() => onToggle(!syncChecked, allAllowedChecked, allowedDomainsChecked, allowedDomains)}
        title={(
            <FormattedMessage
                id='admin.team_settings.team_details.syncGroupMembers'
                defaultMessage='Sync Group Members'
            />
        )}
        subTitle={(
            <FormattedMarkdownMessage
                id='admin.team_settings.team_details.syncGroupMembersDescr'
                defaultMessage='When enabled, adding and removing users from groups will add or remove them from this team. The only way of inviting members to this team is by adding the groups they belong to. [Learn More](!https://www.mattermost.com/pl/default-ldap-group-constrained-team-channel.html)'
            />
        )}
    />);

const AllowAllToggle = ({syncChecked, allAllowedChecked, allowedDomainsChecked, allowedDomains, onToggle, isDisabled}: ToggleProps) =>
    !syncChecked && (
        <LineSwitch
            id='allowAllToggleSwitch'
            disabled={isDisabled}
            toggled={allAllowedChecked}
            singleLine={true}
            onToggle={() => onToggle(syncChecked, !allAllowedChecked, allowedDomainsChecked, allowedDomains)}
            title={(
                <FormattedMessage
                    id='admin.team_settings.team_details.anyoneCanJoin'
                    defaultMessage='Anyone can join this team'
                />
            )}
            subTitle={(
                <FormattedMessage
                    id='admin.team_settings.team_details.anyoneCanJoinDescr'
                    defaultMessage='This team can be discovered allowing anyone with an account to join this team.'
                />
            )}
        />);

const AllowedDomainsToggle = ({syncChecked, allAllowedChecked, allowedDomainsChecked, allowedDomains, onToggle, isDisabled}: ToggleProps) =>
    !syncChecked && (
        <LineSwitch
            disabled={isDisabled}
            toggled={allowedDomainsChecked}
            last={true}
            onToggle={() => onToggle(syncChecked, allAllowedChecked, !allowedDomainsChecked, allowedDomains)}
            singleLine={true}
            title={(
                <FormattedMessage
                    id='admin.team_settings.team_details.specificDomains'
                    defaultMessage='Only specific email domains can join this team'
                />
            )}
            subTitle={(
                <FormattedMessage
                    id='admin.team_settings.team_details.specificDomainsDescr'
                    defaultMessage='Users can only join the team if their email matches one of the specified domains'
                />
            )}
        >
            <div className='help-text csvDomains'>
                <FormattedMessage
                    id='admin.team_settings.team_details.csvDomains'
                    defaultMessage='Comma Separated Email Domain List'
                />
            </div>
            <input
                type='text'
                value={allowedDomains}
                placeholder='mattermost.com'
                className='form-control'
                onChange={(e) => onToggle(syncChecked, allAllowedChecked, allowedDomainsChecked, e.currentTarget.value)}
                disabled={isDisabled}
            />
        </LineSwitch>);

type TeamModesProps = ToggleProps & {
    isLicensedForLDAPGroups?: boolean;
}

export const TeamModes = ({allAllowedChecked, syncChecked, allowedDomains, allowedDomainsChecked, onToggle, isDisabled, isLicensedForLDAPGroups}: TeamModesProps) => (
    <AdminPanel
        id='team_manage'
        titleId={t('admin.team_settings.team_detail.manageTitle')}
        titleDefault='Team Management'
        subtitleId={t('admin.team_settings.team_detail.manageDescription')}
        subtitleDefault='Choose between inviting members manually or syncing members automatically from groups.'
    >
        <div className='group-teams-and-channels'>
            <div className='group-teams-and-channels--body'>
                {isLicensedForLDAPGroups &&
                    <SyncGroupsToggle
                        allAllowedChecked={allAllowedChecked}
                        allowedDomainsChecked={allowedDomainsChecked}
                        allowedDomains={allowedDomains}
                        syncChecked={syncChecked}
                        onToggle={onToggle}
                        isDisabled={isDisabled}
                    />
                }
                <AllowAllToggle
                    allAllowedChecked={allAllowedChecked}
                    allowedDomainsChecked={allowedDomainsChecked}
                    allowedDomains={allowedDomains}
                    syncChecked={syncChecked}
                    onToggle={onToggle}
                    isDisabled={isDisabled}
                />
                <AllowedDomainsToggle
                    allAllowedChecked={allAllowedChecked}
                    allowedDomainsChecked={allowedDomainsChecked}
                    allowedDomains={allowedDomains}
                    syncChecked={syncChecked}
                    onToggle={onToggle}
                    isDisabled={isDisabled}
                />
            </div>
        </div>
    </AdminPanel>);
