// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {PermissionsScope} from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';

import SaveButton from 'components/save_button.jsx';
import LoadingScreen from 'components/loading_screen.jsx';
import AccordionToggleIcon from 'components/svg/accordion_toggle_icon.jsx';
import FormError from 'components/form_error.jsx';
import TeamSelectorModal from 'components/team_selector_modal';

import PermissionsTree from '../permissions_tree.jsx';

import TeamInList from './team_in_list';

export default class PermissionTeamSchemeSettings extends React.Component {
    static propTypes = {
        schemeId: PropTypes.string,
        scheme: PropTypes.object,
        roles: PropTypes.object,
        rolesById: PropTypes.object,
        teams: PropTypes.array,
        actions: PropTypes.shape({
            loadRolesIfNeeded: PropTypes.func.isRequired,
            loadRole: PropTypes.func.isRequired,
            loadScheme: PropTypes.func.isRequired,
            loadSchemeTeams: PropTypes.func.isRequired,
            editRole: PropTypes.func.isRequired,
            patchScheme: PropTypes.func.isRequired,
            createScheme: PropTypes.func.isRequired,
            updateTeamScheme: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            saving: false,
            saveNeeded: false,
            serverError: null,
            roles: null,
            teams: null,
            addTeamOpen: false,
            selectedPermission: null,
            openRoles: {
                all_users: true,
                team_admin: true,
                channel_admin: true,
            },
        };
    }

    static defaultProps = {
        scheme: null,
    }

    componentDidMount() {
        this.props.actions.loadRolesIfNeeded(['team_admin', 'team_user', 'channel_admin', 'channel_user']);
        if (this.props.schemeId) {
            this.props.actions.loadScheme(this.props.schemeId).then((result) => {
                this.props.actions.loadRole(result.data.default_team_user_role);
                this.props.actions.loadRole(result.data.default_team_admin_role);
                this.props.actions.loadRole(result.data.default_channel_user_role);
                this.props.actions.loadRole(result.data.default_channel_admin_role);
            });
            this.props.actions.loadSchemeTeams(this.props.schemeId);
        }
    }

    isLoaded = (props) => {
        if (props.schemeId) {
            if (props.scheme !== null &&
                props.teams !== null &&
                props.rolesById[props.scheme.default_team_user_role] &&
                props.rolesById[props.scheme.default_team_admin_role] &&
                props.rolesById[props.scheme.default_channel_user_role] &&
                props.rolesById[props.scheme.default_channel_admin_role]) {
                return true;
            }
            return false;
        } else if (props.roles.team_user &&
            props.roles.team_admin &&
            props.roles.channel_user &&
            props.roles.channel_admin) {
            return true;
        }
        return false;
    }

    goToSelectedRow = () => {
        const selected = document.querySelector('.permission-row.selected,.permission-group-row.selected');
        if (selected) {
            if (this.state.openRoles.all_users) {
                selected.scrollIntoView({behavior: 'smooth', block: 'center'});
            } else {
                this.toggleRole('all_users', false);

                // Give it time to open and show everything
                setTimeout(() => {
                    selected.scrollIntoView({behavior: 'smooth', block: 'center'});
                }, 300);
            }
            return true;
        }
        return false;
    }

    selectRow = (permission) => {
        this.setState({selectedPermission: permission});

        // Wait until next render
        setTimeout(this.goToSelectedRow);

        // Remove selection after animation
        setTimeout(() => {
            this.setState({selectedPermission: null});
        }, 3000);
    }

    getStateRoles = () => {
        if (this.state.roles !== null) {
            return this.state.roles;
        }

        let teamUser = null;
        let teamAdmin = null;
        let channelUser = null;
        let channelAdmin = null;

        if (this.props.schemeId) {
            if (this.isLoaded(this.props)) {
                teamUser = this.props.rolesById[this.props.scheme.default_team_user_role];
                teamAdmin = this.props.rolesById[this.props.scheme.default_team_admin_role];
                channelUser = this.props.rolesById[this.props.scheme.default_channel_user_role];
                channelAdmin = this.props.rolesById[this.props.scheme.default_channel_admin_role];
            }
        } else if (this.isLoaded(this.props)) {
            teamUser = this.props.roles.team_user;
            teamAdmin = this.props.roles.team_admin;
            channelUser = this.props.roles.channel_user;
            channelAdmin = this.props.roles.channel_admin;
        } else {
            return null;
        }
        return {
            team_admin: teamAdmin,
            channel_admin: channelAdmin,
            all_users: {
                name: 'all_users',
                displayName: 'All members',
                permissions: teamUser.permissions.concat(channelUser.permissions),
            },
        };
    }

    deriveRolesFromAllUsers = (baseTeam, baseChannel, role) => {
        return {
            team_user: {
                ...baseTeam,
                permissions: role.permissions.filter((p) => PermissionsScope[p] === 'team_scope'),
            },
            channel_user: {
                ...baseChannel,
                permissions: role.permissions.filter((p) => PermissionsScope[p] === 'channel_scope'),
            },
        };
    }

    handleNameChange = (e) => {
        this.setState({schemeName: e.target.value, saveNeeded: true});
    }

    handleDescriptionChange = (e) => {
        this.setState({schemeDescription: e.target.value, saveNeeded: true});
    }

    handleSubmit = async () => {
        const roles = this.getStateRoles();
        let teamAdmin = roles.team_admin;
        let channelAdmin = roles.channel_admin;
        const allUsers = roles.all_users;
        const schemeName = this.state.schemeName || (this.props.scheme && this.props.scheme.display_name) || '';
        const schemeDescription = this.state.schemeDescription || (this.props.scheme && this.props.scheme.description) || '';
        let teamUser = null;
        let channelUser = null;
        let schemeId = null;

        this.setState({saving: true});
        if (this.props.schemeId) {
            const derived = this.deriveRolesFromAllUsers(
                this.props.rolesById[this.props.scheme.default_team_user_role],
                this.props.rolesById[this.props.scheme.default_channel_user_role],
                allUsers
            );
            teamUser = derived.team_user;
            channelUser = derived.channel_user;
            await this.props.actions.patchScheme(this.props.schemeId, {
                display_name: schemeName,
                description: schemeDescription,
            });
            schemeId = this.props.schemeId;
        } else {
            const derived = this.deriveRolesFromAllUsers(
                this.props.roles.team_user,
                this.props.roles.channel_user,
                allUsers
            );
            teamUser = derived.team_user;
            channelUser = derived.channel_user;
            const result = await this.props.actions.createScheme({
                display_name: schemeName,
                description: schemeDescription,
                scope: 'team',
            });
            if (result.error) {
                this.setState({serverError: result.error.message, saving: false, saveNeeded: true});
                return;
            }
            const newScheme = result.data;
            schemeId = newScheme.id;
            teamUser = {...teamUser, id: newScheme.default_team_user_role};
            teamAdmin = {...teamAdmin, id: newScheme.default_team_admin_role};
            channelUser = {...channelUser, id: newScheme.default_channel_user_role};
            channelAdmin = {...channelAdmin, id: newScheme.default_channel_admin_role};
        }

        const teamAdminPromise = this.props.actions.editRole(teamAdmin);
        const channelAdminPromise = this.props.actions.editRole(channelAdmin);
        const teamUserPromise = this.props.actions.editRole(teamUser);
        const channelUserPromise = this.props.actions.editRole(channelUser);

        const teamEditPromises = [];
        for (const team of (this.state.teams || this.props.teams || [])) {
            teamEditPromises.push(this.props.actions.updateTeamScheme(team.id, schemeId));
        }

        const results = await Promise.all([teamAdminPromise, channelAdminPromise, teamUserPromise, channelUserPromise, ...teamEditPromises]);

        let serverError = null;
        let saveNeeded = false;
        for (const result of results) {
            if (result.error) {
                serverError = result.error.message;
                saveNeeded = true;
                break;
            }
        }

        this.setState({serverError, saving: false, saveNeeded});
        this.props.history.push('/admin_console/permissions/schemes');
    }

    toggleRole = (roleId, scrollOnOpen = true) => {
        const newOpenRoles = {...this.state.openRoles};
        newOpenRoles[roleId] = !newOpenRoles[roleId];
        if (newOpenRoles[roleId] && scrollOnOpen) {
            const block = document.querySelector('.permissions-block.' + roleId);
            if (block) {
                setTimeout(() => {
                    block.scrollIntoView({behavior: 'smooth', block: 'start'});
                }, 300);
            }
        }
        this.setState({openRoles: newOpenRoles});
    }

    togglePermission = (roleId, permissions) => {
        const roles = {...this.getStateRoles()};
        let role = null;
        if (roles.team_admin.name === roleId) {
            role = {...roles.team_admin};
        } else if (roles.channel_admin.name === roleId) {
            role = {...roles.channel_admin};
        } else if (roles.all_users.name === roleId) {
            role = {...roles.all_users};
        }
        const newPermissions = [...role.permissions];
        for (const permission of permissions) {
            if (newPermissions.indexOf(permission) === -1) {
                newPermissions.push(permission);
            } else {
                newPermissions.splice(newPermissions.indexOf(permission), 1);
            }
        }
        role.permissions = newPermissions;
        if (roles.team_admin.name === roleId) {
            roles.team_admin = role;
        } else if (roles.channel_admin.name === roleId) {
            roles.channel_admin = role;
        } else if (roles.all_users.name === roleId) {
            roles.all_users = role;
        }

        this.setState({roles, saveNeeded: true});
    }

    openAddTeam = () => {
        this.setState({addTeamOpen: true});
    }

    removeTeam = (teamId) => {
        const teams = (this.state.teams || this.props.teams).filter((team) => team.id !== teamId);
        this.setState({teams, saveNeeded: true});
    }

    addTeams = (teams) => {
        const currentTeams = this.state.teams || this.props.teams || [];
        this.setState({
            teams: [...currentTeams, ...teams],
            saveNeeded: true,
        });
    }

    closeAddTeam = () => {
        this.setState({addTeamOpen: false});
    }

    render = () => {
        if (!this.isLoaded(this.props)) {
            return <LoadingScreen/>;
        }
        const roles = this.getStateRoles();
        const teams = this.state.teams || this.props.teams || [];
        const schemeName = this.state.schemeName || (this.props.scheme && this.props.scheme.display_name) || '';
        const schemeDescription = this.state.schemeDescription || (this.props.scheme && this.props.scheme.description) || '';
        return (
            <div className='wrapper--fixed'>
                {this.state.addTeamOpen &&
                    <TeamSelectorModal
                        onModalDismissed={this.closeAddTeam}
                        onTeamsSelected={this.addTeams}
                        currentSchemeId={this.props.schemeId}
                        alreadySelected={teams.map((team) => team.id)}
                    />
                }
                <h3 className='admin-console-header with-back'>
                    <Link
                        to='/admin_console/permissions/schemes'
                        className='fa fa-chevron-left back'
                    />
                    <FormattedMessage
                        id='admin.permissions.teamScheme'
                        defaultMessage='Team Scheme'
                    />
                </h3>

                <div className={'banner info'}>
                    <div className='banner__content'>
                        <span>
                            <FormattedHTMLMessage
                                id='admin.permissions.teamScheme.introBanner'
                                defaultMessage='Team Override Schemes set the permissions for Team Admins, Channel Admins and other members in specific teams. Use a Team Override Scheme when specific teams need permission exceptions to the <a href="/admin_console/permissions/system-scheme">System Scheme</a>.'
                            />
                        </span>
                    </div>
                </div>

                <div className='permissions-block'>
                    <div className='header'>
                        <div>
                            <h3>
                                <FormattedMessage
                                    id='admin.permissions.teamScheme.schemeDetailsTitle'
                                    defaultMessage='Scheme Details'
                                />
                            </h3>
                            <span>
                                <FormattedMessage
                                    id='admin.permissions.teamScheme.schemeDetailsDescription'
                                    defaultMessage='Set the name and description for this scheme.'
                                />
                            </span>
                        </div>
                    </div>
                    <div className='team-scheme-details'>
                        <div className='form-group'>
                            <label
                                className='control-label'
                                htmlFor='scheme-name'
                            >
                                <FormattedMessage
                                    id='admin.permissions.teamScheme.schemeNameLabel'
                                    defaultMessage='Scheme Name:'
                                />
                            </label>
                            <input
                                id='scheme-name'
                                className='form-control'
                                type='text'
                                value={schemeName}
                                placeholder={localizeMessage('admin.permissions.teamScheme.schemeNamePlaceholder', 'Scheme Name')}
                                onChange={this.handleNameChange}
                            />
                        </div>
                        <div className='form-group'>
                            <label
                                className='control-label'
                                htmlFor='scheme-description'
                            >
                                <FormattedMessage
                                    id='admin.permissions.teamScheme.schemeDescriptionLabel'
                                    defaultMessage='Scheme Description:'
                                />
                            </label>
                            <textarea
                                id='scheme-description'
                                className='form-control'
                                rows='5'
                                value={schemeDescription}
                                placeholder={localizeMessage('admin.permissions.teamScheme.schemeDescriptionPlaceholder', 'Scheme Description')}
                                onChange={this.handleDescriptionChange}
                            />
                        </div>
                    </div>
                </div>

                <div className='permissions-block'>
                    <div className='header'>
                        <div>
                            <h3>
                                <FormattedMessage
                                    id='admin.permissions.teamScheme.selectTeamsTitle'
                                    defaultMessage='Select teams to override permissions'
                                />
                            </h3>
                            <span>
                                <FormattedMessage
                                    id='admin.permissions.teamScheme.selectTeamsDescription'
                                    defaultMessage='Select teams where permission exceptions are required.'
                                />
                            </span>
                        </div>
                        <div className='button'>
                            <a
                                className='btn btn-primary'
                                onClick={this.openAddTeam}
                            >
                                <FormattedMessage
                                    id='admin.permissions.teamScheme.addTeams'
                                    defaultMessage='Add Teams'
                                />
                            </a>
                        </div>
                    </div>
                    <div className='teams-list'>
                        {teams.length === 0 &&
                            <div className='no-team-schemes'>
                                <FormattedMessage
                                    id='admin.permissions.teamScheme.noTeams'
                                    defaultMessage='No team selected. Please add teams to this list.'
                                />
                            </div>}
                        {teams.map((team) => (
                            <TeamInList
                                key={team.id}
                                team={team}
                                onRemoveTeam={this.removeTeam}
                            />
                        ))}
                    </div>
                </div>

                <div
                    className={'permissions-block all_users ' + (this.state.openRoles.all_users ? '' : 'closed')}
                    id='all_users'
                >
                    <div
                        className='header'
                        onClick={() => this.toggleRole('all_users')}
                    >
                        <div>
                            <h3>
                                <FormattedMessage
                                    id='admin.permissions.systemScheme.allMembersTitle'
                                    defaultMessage='All Members'
                                />
                            </h3>
                            <span>
                                <FormattedMessage
                                    id='admin.permissions.systemScheme.allMembersDescription'
                                    defaultMessage='Permissions granted to all members, including administrators and newly created users.'
                                />
                            </span>
                        </div>
                        <div className='button'>
                            <AccordionToggleIcon/>
                        </div>
                    </div>
                    <PermissionsTree
                        selected={this.state.selectedPermission}
                        role={roles.all_users}
                        scope={'team_scope'}
                        onToggle={this.togglePermission}
                        selectRow={this.selectRow}
                    />
                </div>

                <div className={'permissions-block channel_admin ' + (this.state.openRoles.channel_admin ? '' : 'closed')}>
                    <div
                        className='header'
                        onClick={() => this.toggleRole('channel_admin')}
                    >
                        <div>
                            <h3>
                                <FormattedMessage
                                    id='admin.permissions.systemScheme.channelAdminsTitle'
                                    defaultMessage='Channel Administrators'
                                />
                            </h3>
                            <span>
                                <FormattedMessage
                                    id='admin.permissions.systemScheme.channelAdminsDescription'
                                    defaultMessage='Permissions granted to channel creators and any users promoted to Channel Administrator.'
                                />
                            </span>
                        </div>
                        <div className='button'>
                            <AccordionToggleIcon/>
                        </div>
                    </div>
                    <PermissionsTree
                        parentRole={roles.all_users}
                        role={roles.channel_admin}
                        scope={'channel_scope'}
                        onToggle={this.togglePermission}
                        selectRow={this.selectRow}
                    />
                </div>

                <div className={'permissions-block team_admin ' + (this.state.openRoles.team_admin ? '' : 'closed')}>
                    <div
                        className='header'
                        onClick={() => this.toggleRole('team_admin')}
                    >
                        <div>
                            <h3>
                                <FormattedMessage
                                    id='admin.permissions.systemScheme.teamAdminsTitle'
                                    defaultMessage='Team Administrators'
                                />
                            </h3>
                            <span>
                                <FormattedMessage
                                    id='admin.permissions.systemScheme.teamAdminsDescription'
                                    defaultMessage='Permissions granted to team creators and any users promoted to Team Administrator.'
                                />
                            </span>
                        </div>
                        <div className='button'>
                            <AccordionToggleIcon/>
                        </div>
                    </div>
                    <PermissionsTree
                        parentRole={roles.all_users}
                        role={roles.team_admin}
                        scope={'team_scope'}
                        onToggle={this.togglePermission}
                        selectRow={this.selectRow}
                    />
                </div>

                <div className='admin-console-save'>
                    <SaveButton
                        saving={this.state.saving}
                        disabled={!this.state.saveNeeded || (this.canSave && !this.canSave())}
                        onClick={this.handleSubmit}
                        savingMessage={localizeMessage('admin.saving', 'Saving Config...')}
                    />
                    <Link
                        className='cancel-button'
                        to='/admin_console/permissions/schemes'
                    >
                        <FormattedMessage
                            id='admin.permissions.permissionSchemes.cancel'
                            defaultMessage='Cancel'
                        />
                    </Link>
                    <div className='error-message'>
                        <FormError error={this.state.serverError}/>
                    </div>
                </div>
            </div>
        );
    };
}
