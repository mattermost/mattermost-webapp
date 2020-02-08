// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {cloneDeep} from 'lodash';

import {Groups} from 'mattermost-redux/constants';

import BlockableLink from 'components/admin_console/blockable_link';

import FormError from 'components/form_error';

import RemoveConfirmModal from '../../remove_confirm_modal';
import {NeedDomainsError, NeedGroupsError, UsersWillBeRemovedError} from '../../errors';

import SaveChangesPanel from '../../save_changes_panel';

import {TeamProfile} from './team_profile';
import {TeamModes} from './team_modes';
import {TeamGroups} from './team_groups';

export default class TeamDetails extends React.Component {
    static propTypes = {
        teamID: PropTypes.string.isRequired,
        team: PropTypes.object.isRequired,
        totalGroups: PropTypes.number.isRequired,
        groups: PropTypes.arrayOf(PropTypes.object),
        allGroups: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            setNavigationBlocked: PropTypes.func.isRequired,
            getTeam: PropTypes.func.isRequired,
            linkGroupSyncable: PropTypes.func.isRequired,
            unlinkGroupSyncable: PropTypes.func.isRequired,
            membersMinusGroupMembers: PropTypes.func.isRequired,
            getGroups: PropTypes.func.isRequired,
            patchTeam: PropTypes.func.isRequired,
            patchGroupSyncable: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        team: {display_name: '', id: ''},
    };

    constructor(props) {
        super(props);
        const team = props.team;
        this.state = {
            groups: props.groups,
            syncChecked: Boolean(team.group_constrained),
            allAllowedChecked: team.allow_open_invite,
            allowedDomainsChecked: Boolean(team.allowed_domains && team.allowed_domains !== ''),
            allowedDomains: team.allowed_domains || '',
            saving: false,
            showRemoveConfirmation: false,
            usersToRemove: 0,
            totalGroups: props.totalGroups,
            saveNeeded: false,
            serverError: null,
        };
    }

    componentDidUpdate(prevProps) {
        const {totalGroups, team} = this.props;
        if (prevProps.team.id !== team.id || totalGroups !== prevProps.totalGroups) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                totalGroups,
                syncChecked: Boolean(team.group_constrained),
                allAllowedChecked: team.allow_open_invite,
                allowedDomainsChecked: Boolean(team.allowed_domains && team.allowed_domains !== ''),
                allowedDomains: team.allowed_domains || '',
            });
        }
    }

    componentDidMount() {
        const {teamID, actions} = this.props;
        actions.getTeam(teamID).
            then(() => actions.getGroups(teamID)).
            then(() => this.setState({groups: this.props.groups}));
    }

    setNewGroupRole = (gid) => {
        const groups = cloneDeep(this.state.groups).map((g) => {
            if (g.id === gid) {
                g.scheme_admin = !g.scheme_admin;
            }
            return g;
        });
        this.processGroupsChange(groups);
    }

    handleSubmit = async () => {
        this.setState({showRemoveConfirmation: false, saving: true});
        const {groups, allAllowedChecked, allowedDomainsChecked, allowedDomains, syncChecked} = this.state;

        let serverError = null;
        let saveNeeded = false;

        const {team, groups: origGroups, teamID, actions} = this.props;
        if (allowedDomainsChecked && allowedDomains.trim().length === 0) {
            saveNeeded = true;
            serverError = <NeedDomainsError/>;
        } else if (this.state.groups.length === 0 && syncChecked) {
            serverError = <NeedGroupsError/>;
            saveNeeded = true;
        } else {
            const patchTeamPromise = actions.patchTeam({
                ...team,
                group_constrained: syncChecked,
                allowed_domains: allowedDomainsChecked ? allowedDomains : '',
                allow_open_invite: allAllowedChecked,
            });
            const patchTeamSyncable = groups.
                filter((g) => {
                    return origGroups.some((group) => group.id === g.id && group.scheme_admin !== g.scheme_admin);
                }).
                map((g) => actions.patchGroupSyncable(g.id, teamID, Groups.SYNCABLE_TYPE_TEAM, {scheme_admin: g.scheme_admin}));
            const unlink = origGroups.
                filter((g) => {
                    return !groups.some((group) => group.id === g.id);
                }).
                map((g) => actions.unlinkGroupSyncable(g.id, teamID, Groups.SYNCABLE_TYPE_TEAM));
            const link = groups.
                filter((g) => {
                    return !origGroups.some((group) => group.id === g.id);
                }).
                map((g) => actions.linkGroupSyncable(g.id, teamID, Groups.SYNCABLE_TYPE_TEAM, {auto_add: true, scheme_admin: g.scheme_admin}));
            const result = await Promise.all([patchTeamPromise, ...patchTeamSyncable, ...unlink, ...link]);
            const resultWithError = result.find((r) => r.error);
            if (resultWithError) {
                serverError = <FormError error={resultWithError.error.message}/>;
            } else {
                await actions.getGroups(teamID);
            }
        }

        this.setState({serverError, saving: false, saveNeeded});
        actions.setNavigationBlocked(saveNeeded);
    }

    setToggles = (syncChecked, allAllowedChecked, allowedDomainsChecked, allowedDomains) => {
        this.setState({
            saveNeeded: true,
            syncChecked,
            allAllowedChecked: !syncChecked && allAllowedChecked,
            allowedDomainsChecked: !syncChecked && allowedDomainsChecked,
            allowedDomains,
        }, () => this.processGroupsChange(this.state.groups));
        this.props.actions.setNavigationBlocked(true);
    }

    async processGroupsChange(groups) {
        const {teamID, actions} = this.props;
        actions.setNavigationBlocked(true);

        let serverError = null;
        let usersToRemove = 0;
        if (this.state.syncChecked) {
            try {
                if (groups.length === 0) {
                    serverError = <NeedGroupsError warning={true}/>;
                } else {
                    const result = await actions.membersMinusGroupMembers(teamID, groups.map((g) => g.id));
                    usersToRemove = result.data.total_count;
                    if (usersToRemove > 0) {
                        serverError = (
                            <UsersWillBeRemovedError
                                total={usersToRemove}
                                users={result.data.users}
                            />
                        );
                    }
                }
            } catch (ex) {
                serverError = ex;
            }
        }
        this.setState({groups, usersToRemove, saveNeeded: true, serverError});
    }

    handleGroupRemoved = (gid) => {
        const groups = this.state.groups.filter((g) => g.id !== gid);
        this.setState({totalGroups: this.state.totalGroups - 1});
        this.processGroupsChange(groups);
    }

    handleGroupChange = (groupIDs) => {
        const groups = [...this.state.groups, ...groupIDs.map((gid) => this.props.allGroups[gid])];
        this.setState({totalGroups: this.state.totalGroups + groupIDs.length});
        this.processGroupsChange(groups);
    }

    hideRemoveUsersModal = () => {
        this.setState({showRemoveConfirmation: false});
    }
    showRemoveUsersModal = () => {
        if (this.state.usersToRemove > 0) {
            this.setState({showRemoveConfirmation: true});
        } else {
            this.handleSubmit();
        }
    }

    render = () => {
        const {team} = this.props;
        const {totalGroups, saving, saveNeeded, serverError, groups, allAllowedChecked, allowedDomainsChecked, allowedDomains, syncChecked, showRemoveConfirmation, usersToRemove} = this.state;
        const missingGroup = (og) => !groups.find((g) => g.id === og.id);
        const removedGroups = this.props.groups.filter(missingGroup);

        return (
            <div className='wrapper--fixed'>
                <div className='admin-console__header with-back'>
                    <div>
                        <BlockableLink
                            to='/admin_console/user_management/teams'
                            className='fa fa-angle-left back'
                        />
                        <FormattedMessage
                            id='admin.team_settings.team_detail.group_configuration'
                            defaultMessage='Team Configuration'
                        />
                    </div>
                </div>

                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <RemoveConfirmModal
                            amount={usersToRemove}
                            inChannel={false}
                            show={showRemoveConfirmation}
                            onCancel={this.hideRemoveUsersModal}
                            onConfirm={this.handleSubmit}
                        />
                        <TeamProfile
                            team={team}
                        />

                        <TeamModes
                            allAllowedChecked={allAllowedChecked}
                            allowedDomainsChecked={allowedDomainsChecked}
                            allowedDomains={allowedDomains}
                            syncChecked={syncChecked}
                            onToggle={this.setToggles}
                        />

                        <TeamGroups
                            syncChecked={syncChecked}
                            team={team}
                            groups={groups}
                            removedGroups={removedGroups}
                            totalGroups={totalGroups}
                            onAddCallback={this.handleGroupChange}
                            onGroupRemoved={this.handleGroupRemoved}
                            setNewGroupRole={this.setNewGroupRole}
                        />

                    </div>
                </div>

                <SaveChangesPanel
                    saving={saving}
                    cancelLink='/admin_console/user_management/teams'
                    saveNeeded={saveNeeded}
                    onClick={this.showRemoveUsersModal}
                    serverError={serverError}
                />
            </div>
        );
    };
}
