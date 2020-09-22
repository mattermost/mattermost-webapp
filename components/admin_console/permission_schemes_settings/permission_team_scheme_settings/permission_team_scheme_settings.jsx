// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {PermissionsScope, ModalIdentifiers} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';
import {t} from 'utils/i18n';

import SaveButton from 'components/save_button';
import LoadingScreen from 'components/loading_screen';
import FormError from 'components/form_error';
import TeamSelectorModal from 'components/team_selector_modal';
import BlockableLink from 'components/admin_console/blockable_link';
import AdminPanel from 'components/widgets/admin_console/admin_panel';
import AdminPanelTogglable from 'components/widgets/admin_console/admin_panel_togglable';
import AdminPanelWithButton from 'components/widgets/admin_console/admin_panel_with_button';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import PermissionsTree, {EXCLUDED_PERMISSIONS} from '../permissions_tree';
import GuestPermissionsTree, {GUEST_INCLUDED_PERMISSIONS} from '../guest_permissions_tree';

import LocalizedInput from 'components/localized_input/localized_input';

import TeamInList from './team_in_list';

export default class PermissionTeamSchemeSettings extends React.PureComponent {
    static propTypes = {
        schemeId: PropTypes.string,
        scheme: PropTypes.object,
        config: PropTypes.object.isRequired,
        roles: PropTypes.object.isRequired,
        license: PropTypes.object.isRequired,
        teams: PropTypes.array,
        isDisabled: PropTypes.bool,
        actions: PropTypes.shape({
            loadRolesIfNeeded: PropTypes.func.isRequired,
            loadScheme: PropTypes.func.isRequired,
            loadSchemeTeams: PropTypes.func.isRequired,
            editRole: PropTypes.func.isRequired,
            patchScheme: PropTypes.func.isRequired,
            createScheme: PropTypes.func.isRequired,
            updateTeamScheme: PropTypes.func.isRequired,
            setNavigationBlocked: PropTypes.func.isRequired,
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
                guests: true,
            },
            urlParams: new URLSearchParams(props.location.search),
        };
    }

    static defaultProps = {
        scheme: null,
    }

    componentDidMount() {
        this.props.actions.loadRolesIfNeeded(['team_admin', 'team_user', 'channel_admin', 'channel_user', 'team_guest', 'channel_guest']);
        if (this.props.schemeId) {
            this.props.actions.loadScheme(this.props.schemeId).then((result) => {
                this.props.actions.loadRolesIfNeeded([
                    result.data.default_team_guest_role,
                    result.data.default_team_user_role,
                    result.data.default_team_admin_role,
                    result.data.default_channel_guest_role,
                    result.data.default_channel_user_role,
                    result.data.default_channel_admin_role,
                ]);
            });
            this.props.actions.loadSchemeTeams(this.props.schemeId);
        }

        if (this.state.urlParams.get('rowIdFromQuery')) {
            setTimeout(() => {
                this.selectRow(this.state.urlParams.get('rowIdFromQuery'));
            }, 1000);
        }
    }

    isLoaded = (props) => {
        if (props.schemeId) {
            if (props.scheme !== null &&
                props.teams !== null &&
                props.roles[props.scheme.default_team_guest_role] &&
                props.roles[props.scheme.default_team_user_role] &&
                props.roles[props.scheme.default_team_admin_role] &&
                props.roles[props.scheme.default_channel_guest_role] &&
                props.roles[props.scheme.default_channel_user_role] &&
                props.roles[props.scheme.default_channel_admin_role]) {
                return true;
            }
            return false;
        } else if (props.roles.team_guest &&
            props.roles.team_user &&
            props.roles.team_admin &&
            props.roles.channel_guest &&
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
                this.toggleRole('all_users');

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

        let teamGuest = null;
        let teamUser = null;
        let teamAdmin = null;
        let channelGuest = null;
        let channelUser = null;
        let channelAdmin = null;

        if (this.props.schemeId) {
            if (this.isLoaded(this.props)) {
                teamGuest = this.props.roles[this.props.scheme.default_team_guest_role];
                teamUser = this.props.roles[this.props.scheme.default_team_user_role];
                teamAdmin = this.props.roles[this.props.scheme.default_team_admin_role];
                channelGuest = this.props.roles[this.props.scheme.default_channel_guest_role];
                channelUser = this.props.roles[this.props.scheme.default_channel_user_role];
                channelAdmin = this.props.roles[this.props.scheme.default_channel_admin_role];
            }
        } else if (this.isLoaded(this.props)) {
            teamGuest = this.props.roles.team_guest;
            teamUser = this.props.roles.team_user;
            teamAdmin = this.props.roles.team_admin;
            channelGuest = this.props.roles.channel_guest;
            channelUser = this.props.roles.channel_user;
            channelAdmin = this.props.roles.channel_admin;
        } else {
            return null;
        }
        return {
            team_admin: teamAdmin,
            channel_admin: channelAdmin,
            team_guest: teamGuest,
            team_user: teamUser,
            channel_guest: channelGuest,
            channel_user: channelUser,
            all_users: {
                name: 'all_users',
                displayName: 'All members',
                permissions: teamUser.permissions.concat(channelUser.permissions),
            },
            guests: {
                name: 'guests',
                displayName: 'Guests',
                permissions: teamGuest.permissions.concat(channelGuest.permissions),
            },
        };
    }

    deriveRolesFromGuests = (teamGuest, channelGuest, role) => {
        return {
            team_guest: {
                ...teamGuest,
                permissions: role.permissions.filter((p) => PermissionsScope[p] === 'team_scope'),
            },
            channel_guest: {
                ...channelGuest,
                permissions: role.permissions.filter((p) => PermissionsScope[p] === 'channel_scope'),
            },
        };
    }

    restoreGuestPermissions = (teamGuest, channelGuest, roles) => {
        for (const permission of teamGuest.permissions) {
            if (!GUEST_INCLUDED_PERMISSIONS.includes(permission)) {
                roles.team_guest.permissions.push(permission);
            }
        }
        for (const permission of channelGuest.permissions) {
            if (!GUEST_INCLUDED_PERMISSIONS.includes(permission)) {
                roles.channel_guest.permissions.push(permission);
            }
        }
        return roles;
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

    restoreExcludedPermissions = (baseTeam, baseChannel, roles) => {
        for (const permission of baseTeam.permissions) {
            if (EXCLUDED_PERMISSIONS.includes(permission)) {
                roles.team_user.permissions.push(permission);
            }
        }
        for (const permission of baseChannel.permissions) {
            if (EXCLUDED_PERMISSIONS.includes(permission)) {
                roles.channel_user.permissions.push(permission);
            }
        }
        return roles;
    }

    handleNameChange = (e) => {
        this.setState({schemeName: e.target.value, saveNeeded: true});
        this.props.actions.setNavigationBlocked(true);
    }

    handleDescriptionChange = (e) => {
        this.setState({schemeDescription: e.target.value, saveNeeded: true});
        this.props.actions.setNavigationBlocked(true);
    }

    handleSubmit = async () => {
        const roles = this.getStateRoles();
        let teamAdmin = roles.team_admin;
        let channelAdmin = roles.channel_admin;
        const allUsers = roles.all_users;
        const guests = roles.guests;

        const schemeName = this.state.schemeName || (this.props.scheme && this.props.scheme.display_name) || '';
        const schemeDescription = this.state.schemeDescription || (this.props.scheme && this.props.scheme.description) || '';
        let teamUser = null;
        let channelUser = null;
        let teamGuest = null;
        let channelGuest = null;
        let schemeId = null;

        this.setState({saving: true});

        let derived = this.deriveRolesFromAllUsers(
            roles.team_user,
            roles.channel_user,
            allUsers,
        );
        derived = this.restoreExcludedPermissions(
            roles.team_user,
            roles.channel_user,
            derived,
        );
        teamUser = derived.team_user;
        channelUser = derived.channel_user;

        let derivedGuests = this.deriveRolesFromGuests(
            roles.team_guest,
            roles.channel_guest,
            guests,
        );
        derivedGuests = this.restoreGuestPermissions(
            roles.team_guest,
            roles.channel_guest,
            derivedGuests,
        );
        teamGuest = derivedGuests.team_guest;
        channelGuest = derivedGuests.channel_guest;

        if (this.props.schemeId) {
            await this.props.actions.patchScheme(this.props.schemeId, {
                display_name: schemeName,
                description: schemeDescription,
            });
            schemeId = this.props.schemeId;
        } else {
            const result = await this.props.actions.createScheme({
                display_name: schemeName,
                description: schemeDescription,
                scope: 'team',
            });
            if (result.error) {
                this.setState({serverError: result.error.message, saving: false, saveNeeded: true});
                this.props.actions.setNavigationBlocked(true);
                return;
            }
            const newScheme = result.data;
            schemeId = newScheme.id;
            await this.props.actions.loadRolesIfNeeded([
                newScheme.default_team_guest_role,
                newScheme.default_team_user_role,
                newScheme.default_team_admin_role,
                newScheme.default_channel_guest_role,
                newScheme.default_channel_user_role,
                newScheme.default_channel_admin_role,
            ]);
            teamGuest = {...teamGuest, id: this.props.roles[newScheme.default_team_guest_role].id};
            teamUser = {...teamUser, id: this.props.roles[newScheme.default_team_user_role].id};
            teamAdmin = {...teamAdmin, id: this.props.roles[newScheme.default_team_admin_role].id};
            channelGuest = {...channelGuest, id: this.props.roles[newScheme.default_channel_guest_role].id};
            channelUser = {...channelUser, id: this.props.roles[newScheme.default_channel_user_role].id};
            channelAdmin = {...channelAdmin, id: this.props.roles[newScheme.default_channel_admin_role].id};
        }

        const teamAdminPromise = this.props.actions.editRole(teamAdmin);
        const channelAdminPromise = this.props.actions.editRole(channelAdmin);
        const promises = [teamAdminPromise, channelAdminPromise];

        const teamUserPromise = this.props.actions.editRole(teamUser);
        const channelUserPromise = this.props.actions.editRole(channelUser);
        promises.push(teamUserPromise);
        promises.push(channelUserPromise);

        if (this.haveGuestAccountsPermissions()) {
            const teamGuestPromise = this.props.actions.editRole(teamGuest);
            const channelGuestPromise = this.props.actions.editRole(channelGuest);
            promises.push(teamGuestPromise, channelGuestPromise);
        }

        const currentTeams = new Set((this.state.teams || this.props.teams || []).map((team) => team.id));
        const serverTeams = new Set((this.props.teams || []).map((team) => team.id));

        // Difference of sets (currentTeams - serverTeams)
        const addedTeams = new Set([...currentTeams].filter((team) => !serverTeams.has(team)));

        // Difference of sets (serverTeams - currentTeams)
        const removedTeams = new Set([...serverTeams].filter((team) => !currentTeams.has(team)));

        for (const teamId of addedTeams) {
            promises.push(this.props.actions.updateTeamScheme(teamId, schemeId));
        }

        for (const teamId of removedTeams) {
            promises.push(this.props.actions.updateTeamScheme(teamId, ''));
        }

        const results = await Promise.all(promises);

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
        this.props.actions.setNavigationBlocked(saveNeeded);
        this.props.history.push('/admin_console/user_management/permissions');
    }

    toggleRole = (roleId) => {
        const newOpenRoles = {...this.state.openRoles};
        newOpenRoles[roleId] = !newOpenRoles[roleId];
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
        } else if (roles.guests.name === roleId) {
            role = {...roles.guests};
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
        } else if (roles.guests.name === roleId) {
            roles.guests = role;
        }

        this.setState({roles, saveNeeded: true});
        this.props.actions.setNavigationBlocked(true);
    }

    openAddTeam = () => {
        this.setState({addTeamOpen: true});
    }

    removeTeam = (teamId) => {
        const teams = (this.state.teams || this.props.teams).filter((team) => team.id !== teamId);
        this.setState({teams, saveNeeded: true});
        this.props.actions.setNavigationBlocked(true);
    }

    addTeams = (teams) => {
        const currentTeams = this.state.teams || this.props.teams || [];
        this.setState({
            teams: [...currentTeams, ...teams],
            saveNeeded: true,
        });
        this.props.actions.setNavigationBlocked(true);
    }

    closeAddTeam = () => {
        this.setState({addTeamOpen: false});
    }

    haveGuestAccountsPermissions = () => {
        return this.props.license.GuestAccountsPermissions === 'true';
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
                        modalID={ModalIdentifiers.ADD_TEAMS_TO_SCHEME}
                        onModalDismissed={this.closeAddTeam}
                        onTeamsSelected={this.addTeams}
                        currentSchemeId={this.props.schemeId}
                        alreadySelected={teams.map((team) => team.id)}
                    />
                }
                <div className='admin-console__header with-back'>
                    <div>
                        <BlockableLink
                            to='/admin_console/user_management/permissions'
                            className='fa fa-angle-left back'
                        />
                        <FormattedMessage
                            id='admin.permissions.teamScheme'
                            defaultMessage='Team Scheme'
                        />
                    </div>
                </div>

                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <div className={'banner info'}>
                            <div className='banner__content'>
                                <span>
                                    <FormattedMarkdownMessage
                                        id='admin.permissions.teamScheme.introBanner'
                                        defaultMessage='[Team Override Schemes](!https://about.mattermost.com/default-team-override-scheme) set the permissions for Team Admins, Channel Admins and other members in specific teams. Use a Team Override Scheme when specific teams need permission exceptions to the [System Scheme](!https://about.mattermost.com/default-system-scheme).'
                                    />
                                </span>
                            </div>
                        </div>

                        <AdminPanel
                            titleId={t('admin.permissions.teamScheme.schemeDetailsTitle')}
                            titleDefault='Scheme Details'
                            subtitleId={t('admin.permissions.teamScheme.schemeDetailsDescription')}
                            subtitleDefault='Set the name and description for this scheme.'
                        >
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
                                    <LocalizedInput
                                        id='scheme-name'
                                        className='form-control'
                                        type='text'
                                        value={schemeName}
                                        placeholder={{id: t('admin.permissions.teamScheme.schemeNamePlaceholder'), defaultMessage: 'Scheme Name'}}
                                        onChange={this.handleNameChange}
                                        disabled={this.props.isDisabled}
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
                                        disabled={this.props.isDisabled}
                                    />
                                </div>
                            </div>
                        </AdminPanel>

                        <AdminPanelWithButton
                            className='permissions-block'
                            titleId={t('admin.permissions.teamScheme.selectTeamsTitle')}
                            titleDefault='Select teams to override permissions'
                            subtitleId={t('admin.permissions.teamScheme.selectTeamsDescription')}
                            subtitleDefault='Select teams where permission exceptions are required.'
                            onButtonClick={this.openAddTeam}
                            buttonTextId={t('admin.permissions.teamScheme.addTeams')}
                            buttonTextDefault='Add Teams'
                            disabled={this.props.isDisabled}
                        >
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
                                        isDisabled={this.props.isDisabled}
                                    />
                                ))}
                            </div>
                        </AdminPanelWithButton>

                        {this.props.license && this.props.config.EnableGuestAccounts === 'true' &&
                            <AdminPanelTogglable
                                className='permissions-block'
                                open={this.state.openRoles.guests}
                                id='guests'
                                onToggle={() => this.toggleRole('guests')}
                                titleId={t('admin.permissions.systemScheme.GuestsTitle')}
                                titleDefault='Guests'
                                subtitleId={t('admin.permissions.systemScheme.GuestsDescription')}
                                subtitleDefault='Permissions granted to guest users.'
                                disabled={this.props.isDisabled}
                            >
                                <GuestPermissionsTree
                                    selected={this.state.selectedPermission}
                                    role={roles.guests}
                                    scope={'team_scope'}
                                    onToggle={this.togglePermission}
                                    selectRow={this.selectRow}
                                    readOnly={this.props.isDisabled || !this.haveGuestAccountsPermissions()}
                                />
                            </AdminPanelTogglable>
                        }

                        <AdminPanelTogglable
                            className='permissions-block all_users'
                            open={this.state.openRoles.all_users}
                            id='all_users'
                            onToggle={() => this.toggleRole('all_users')}
                            titleId={t('admin.permissions.systemScheme.allMembersTitle')}
                            titleDefault='All Members'
                            subtitleId={t('admin.permissions.systemScheme.allMembersDescription')}
                            subtitleDefault='Permissions granted to all members, including administrators and newly created users.'
                            disabled={this.props.isDisabled}
                        >
                            <PermissionsTree
                                selected={this.state.selectedPermission}
                                role={roles.all_users}
                                scope={'team_scope'}
                                onToggle={this.togglePermission}
                                selectRow={this.selectRow}
                                readOnly={this.props.isDisabled}
                            />
                        </AdminPanelTogglable>

                        <AdminPanelTogglable
                            className='permissions-block channel_admin'
                            open={this.state.openRoles.channel_admin}
                            onToggle={() => this.toggleRole('channel_admin')}
                            titleId={t('admin.permissions.systemScheme.channelAdminsTitle')}
                            titleDefault='Channel Administrators'
                            subtitleId={t('admin.permissions.systemScheme.channelAdminsDescription')}
                            subtitleDefault='Permissions granted to channel creators and any users promoted to Channel Administrator.'
                            disabled={this.props.isDisabled}
                        >
                            <PermissionsTree
                                parentRole={roles.all_users}
                                role={roles.channel_admin}
                                scope={'channel_scope'}
                                onToggle={this.togglePermission}
                                selectRow={this.selectRow}
                                readOnly={this.props.isDisabled}
                            />
                        </AdminPanelTogglable>

                        <AdminPanelTogglable
                            className='permissions-block team_admin'
                            open={this.state.openRoles.team_admin}
                            onToggle={() => this.toggleRole('team_admin')}
                            titleId={t('admin.permissions.systemScheme.teamAdminsTitle')}
                            titleDefault='Team Administrators'
                            subtitleId={t('admin.permissions.systemScheme.teamAdminsDescription')}
                            subtitleDefault='Permissions granted to team creators and any users promoted to Team Administrator.'
                            disabled={this.props.isDisabled}
                        >
                            <PermissionsTree
                                parentRole={roles.all_users}
                                role={roles.team_admin}
                                scope={'team_scope'}
                                onToggle={this.togglePermission}
                                selectRow={this.selectRow}
                                readOnly={this.props.isDisabled}
                            />
                        </AdminPanelTogglable>
                    </div>
                </div>

                <div className='admin-console-save'>
                    <SaveButton
                        saving={this.state.saving}
                        disabled={this.props.isDisabled || !this.state.saveNeeded || (this.canSave && !this.canSave())}
                        onClick={this.handleSubmit}
                        savingMessage={localizeMessage('admin.saving', 'Saving Config...')}
                    />
                    <BlockableLink
                        className='cancel-button'
                        to='/admin_console/user_management/permissions'
                    >
                        <FormattedMessage
                            id='admin.permissions.permissionSchemes.cancel'
                            defaultMessage='Cancel'
                        />
                    </BlockableLink>
                    <div className='error-message'>
                        <FormError error={this.state.serverError}/>
                    </div>
                </div>
            </div>
        );
    };
}
