// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {cloneDeep} from 'lodash';

import {Groups} from 'mattermost-redux/constants';

import {browserHistory} from 'utils/browser_history';

import {trackEvent} from 'actions/telemetry_actions.jsx';
import BlockableLink from 'components/admin_console/blockable_link';
import FormError from 'components/form_error';

import RemoveConfirmModal from '../../remove_confirm_modal';
import {NeedDomainsError, NeedGroupsError, UsersWillBeRemovedError} from '../../errors';

import SaveChangesPanel from '../../save_changes_panel';

import {TeamProfile} from './team_profile';
import {TeamModes} from './team_modes';
import {TeamGroups} from './team_groups';
import TeamMembers from './team_members/index';

export default class TeamDetails extends React.PureComponent {
    static propTypes = {
        teamID: PropTypes.string.isRequired,
        team: PropTypes.object.isRequired,
        totalGroups: PropTypes.number.isRequired,
        groups: PropTypes.arrayOf(PropTypes.object),
        allGroups: PropTypes.object.isRequired,
        isDisabled: PropTypes.bool,
        actions: PropTypes.shape({
            setNavigationBlocked: PropTypes.func.isRequired,
            getTeam: PropTypes.func.isRequired,
            linkGroupSyncable: PropTypes.func.isRequired,
            unlinkGroupSyncable: PropTypes.func.isRequired,
            membersMinusGroupMembers: PropTypes.func.isRequired,
            getGroups: PropTypes.func.isRequired,
            patchTeam: PropTypes.func.isRequired,
            patchGroupSyncable: PropTypes.func.isRequired,
            addUserToTeam: PropTypes.func.isRequired,
            removeUserFromTeam: PropTypes.func.isRequired,
            updateTeamMemberSchemeRoles: PropTypes.func.isRequired,
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
            usersToRemoveCount: 0,
            usersToRemove: {},
            usersToAdd: {},
            rolesToUpdate: {},
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
        const {groups, allAllowedChecked, allowedDomainsChecked, allowedDomains, syncChecked, usersToAdd, usersToRemove, rolesToUpdate} = this.state;

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
                if (unlink.length > 0) {
                    trackEvent('admin_team_config_page', 'groups_removed_from_team', {count: unlink.length, team_id: teamID});
                }
                if (link.length > 0) {
                    trackEvent('admin_team_config_page', 'groups_added_to_team', {count: link.length, team_id: teamID});
                }
                await actions.getGroups(teamID);
            }
        }

        const usersToAddList = Object.values(usersToAdd);
        const usersToRemoveList = Object.values(usersToRemove);
        const userRolesToUpdate = Object.keys(rolesToUpdate);
        const usersToUpdate = usersToAddList.length > 0 || usersToRemoveList.length > 0 || userRolesToUpdate.length > 0;
        if (usersToUpdate && !syncChecked) {
            const addUserActions = [];
            const removeUserActions = [];
            const {addUserToTeam, removeUserFromTeam, updateTeamMemberSchemeRoles} = this.props.actions;
            usersToAddList.forEach((user) => {
                addUserActions.push(addUserToTeam(teamID, user.id));
            });
            usersToRemoveList.forEach((user) => {
                removeUserActions.push(removeUserFromTeam(teamID, user.id));
            });

            if (addUserActions.length > 0) {
                const result = await Promise.all(addUserActions);
                const resultWithError = result.find((r) => r.error);
                const count = result.filter((r) => r.data).length;
                if (resultWithError) {
                    serverError = <FormError error={resultWithError.error.message}/>;
                }
                if (count > 0) {
                    trackEvent('admin_team_config_page', 'members_added_to_team', {count, team_id: teamID});
                }
            }

            if (removeUserActions.length > 0) {
                const result = await Promise.all(removeUserActions);
                const resultWithError = result.find((r) => r.error);
                const count = result.filter((r) => r.data).length;
                if (resultWithError) {
                    serverError = <FormError error={resultWithError.error.message}/>;
                }
                if (count > 0) {
                    trackEvent('admin_team_config_page', 'members_removed_from_team', {count, team_id: teamID});
                }
            }

            const rolesToPromote = [];
            const rolesToDemote = [];
            userRolesToUpdate.forEach((userId) => {
                const {schemeUser, schemeAdmin} = rolesToUpdate[userId];
                if (schemeAdmin) {
                    rolesToPromote.push(updateTeamMemberSchemeRoles(teamID, userId, schemeUser, schemeAdmin));
                } else {
                    rolesToDemote.push(updateTeamMemberSchemeRoles(teamID, userId, schemeUser, schemeAdmin));
                }
            });

            if (rolesToPromote.length > 0) {
                const result = await Promise.all(rolesToPromote);
                const resultWithError = result.find((r) => r.error);
                const count = result.filter((r) => r.data).length;
                if (resultWithError) {
                    serverError = <FormError error={resultWithError.error.message}/>;
                }
                if (count > 0) {
                    trackEvent('admin_team_config_page', 'members_elevated_to_team_admin', {count, team_id: teamID});
                }
            }

            if (rolesToDemote.length > 0) {
                const result = await Promise.all(rolesToDemote);
                const resultWithError = result.find((r) => r.error);
                const count = result.filter((r) => r.data).length;
                if (resultWithError) {
                    serverError = <FormError error={resultWithError.error.message}/>;
                }
                if (count > 0) {
                    trackEvent('admin_team_config_page', 'admins_demoted_to_team_member', {count, team_id: teamID});
                }
            }
        }

        this.setState({usersToRemoveCount: 0, rolesToUpdate: {}, usersToAdd: {}, usersToRemove: {}, serverError, saving: false, saveNeeded}, () => {
            actions.setNavigationBlocked(saveNeeded);
            if (!saveNeeded && !serverError) {
                browserHistory.push('/admin_console/user_management/teams');
            }
        });
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
        let usersToRemoveCount = 0;
        if (this.state.syncChecked) {
            try {
                if (groups.length === 0) {
                    serverError = <NeedGroupsError warning={true}/>;
                } else {
                    const result = await actions.membersMinusGroupMembers(teamID, groups.map((g) => g.id));
                    usersToRemoveCount = result.data.total_count;
                    if (usersToRemoveCount > 0) {
                        serverError = (
                            <UsersWillBeRemovedError
                                total={usersToRemoveCount}
                                users={result.data.users}
                                scope={'team'}
                                scopeId={this.props.teamID}
                            />
                        );
                    }
                }
            } catch (ex) {
                serverError = ex;
            }
        }
        this.setState({groups, usersToRemoveCount, saveNeeded: true, serverError});
    }

    addUsersToAdd = (users) => {
        let {usersToRemoveCount} = this.state;
        const {usersToAdd, usersToRemove} = this.state;
        users.forEach((user) => {
            if (usersToRemove[user.id]?.id === user.id) {
                delete usersToRemove[user.id];
                usersToRemoveCount -= 1;
            } else {
                usersToAdd[user.id] = user;
            }
        });
        this.setState({usersToAdd: {...usersToAdd}, usersToRemove: {...usersToRemove}, usersToRemoveCount, saveNeeded: true});
        this.props.actions.setNavigationBlocked(true);
    }

    addUserToRemove = (user) => {
        let {usersToRemoveCount} = this.state;
        const {usersToAdd, usersToRemove, rolesToUpdate} = this.state;
        if (usersToAdd[user.id]?.id === user.id) {
            delete usersToAdd[user.id];
        } else if (usersToRemove[user.id]?.id !== user.id) {
            usersToRemoveCount += 1;
            usersToRemove[user.id] = user;
        }
        delete rolesToUpdate[user.id];
        this.setState({usersToRemove: {...usersToRemove}, usersToAdd: {...usersToAdd}, rolesToUpdate: {...rolesToUpdate}, usersToRemoveCount, saveNeeded: true});
        this.props.actions.setNavigationBlocked(true);
    }

    addRolesToUpdate = (userId, schemeUser, schemeAdmin) => {
        const {rolesToUpdate} = this.state;
        rolesToUpdate[userId] = {schemeUser, schemeAdmin};
        this.setState({rolesToUpdate: {...rolesToUpdate}, saveNeeded: true});
        this.props.actions.setNavigationBlocked(true);
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
        if (this.state.usersToRemoveCount > 0) {
            this.setState({showRemoveConfirmation: true});
        } else {
            this.handleSubmit();
        }
    }

    render = () => {
        const {team} = this.props;
        const {totalGroups, saving, saveNeeded, serverError, groups, allAllowedChecked, allowedDomainsChecked, allowedDomains, syncChecked, showRemoveConfirmation, usersToRemoveCount} = this.state;
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
                            amount={usersToRemoveCount}
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
                            isDisabled={this.props.isDisabled}
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
                            isDisabled={this.props.isDisabled}
                        />

                        {!syncChecked &&
                            <TeamMembers
                                onRemoveCallback={this.addUserToRemove}
                                onAddCallback={this.addUsersToAdd}
                                usersToRemove={this.state.usersToRemove}
                                usersToAdd={this.state.usersToAdd}
                                updateRole={this.addRolesToUpdate}
                                teamId={this.props.teamID}
                                isDisabled={this.props.isDisabled}
                            />
                        }
                    </div>
                </div>

                <SaveChangesPanel
                    saving={saving}
                    cancelLink='/admin_console/user_management/teams'
                    saveNeeded={saveNeeded}
                    onClick={this.showRemoveUsersModal}
                    serverError={serverError}
                    isDisabled={this.props.isDisabled}
                />
            </div>
        );
    };
}
