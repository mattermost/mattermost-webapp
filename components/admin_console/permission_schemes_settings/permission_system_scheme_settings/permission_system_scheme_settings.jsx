// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Modal} from 'react-bootstrap';

import {PermissionsScope, DefaultRolePermissions} from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';

import SaveButton from 'components/save_button.jsx';
import LoadingScreen from 'components/loading_screen.jsx';
import AccordionToggleIcon from 'components/svg/accordion_toggle_icon.jsx';
import FormError from 'components/form_error.jsx';
import BlockableLink from 'components/admin_console/blockable_link';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import PermissionsTree from '../permissions_tree.jsx';

export default class PermissionSystemSchemeSettings extends React.Component {
    static propTypes = {
        roles: PropTypes.object.isRequired,
        license: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            loadRolesIfNeeded: PropTypes.func.isRequired,
            editRole: PropTypes.func.isRequired,
            setNavigationBlocked: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showResetDefaultModal: false,
            loaded: false,
            saving: false,
            saveNeeded: false,
            serverError: null,
            roles: {},
            openRoles: {
                all_users: true,
                system_admin: true,
                team_admin: true,
                channel_admin: true,
            },
        };
        this.rolesNeeded = ['system_admin', 'system_user', 'team_admin', 'team_user', 'channel_admin', 'channel_user'];
    }

    componentDidMount() {
        this.props.actions.loadRolesIfNeeded(this.rolesNeeded);
        if (this.rolesNeeded.every((roleName) => this.props.roles[roleName])) {
            this.loadRolesIntoState(this.props);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.state.loaded && this.rolesNeeded.every((roleName) => nextProps.roles[roleName])) {
            this.loadRolesIntoState(nextProps);
        }
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

    loadRolesIntoState(props) {
        const {system_admin, team_admin, channel_admin, system_user, team_user, channel_user} = props.roles; // eslint-disable-line camelcase
        this.setState({
            selectedPermission: null,
            loaded: true,
            roles: {
                system_admin,
                team_admin,
                channel_admin,
                all_users: {
                    name: 'all_users',
                    displayName: 'All members',
                    permissions: system_user.permissions.concat(team_user.permissions).concat(channel_user.permissions),
                },
            },
        });
    }

    deriveRolesFromAllUsers = (role) => {
        return {
            system_user: {
                ...this.props.roles.system_user,
                permissions: role.permissions.filter((p) => PermissionsScope[p] === 'system_scope'),
            },
            team_user: {
                ...this.props.roles.team_user,
                permissions: role.permissions.filter((p) => PermissionsScope[p] === 'team_scope'),
            },
            channel_user: {
                ...this.props.roles.channel_user,
                permissions: role.permissions.filter((p) => PermissionsScope[p] === 'channel_scope'),
            },
        };
    }

    handleSubmit = async () => {
        const teamAdminPromise = this.props.actions.editRole(this.state.roles.team_admin);
        const channelAdminPromise = this.props.actions.editRole(this.state.roles.channel_admin);
        const roles = this.deriveRolesFromAllUsers(this.state.roles.all_users);
        const systemUserPromise = this.props.actions.editRole(roles.system_user);
        const teamUserPromise = this.props.actions.editRole(roles.team_user);
        const channelUserPromise = this.props.actions.editRole(roles.channel_user);
        this.setState({saving: true});

        Promise.all([teamAdminPromise, channelAdminPromise, systemUserPromise, teamUserPromise, channelUserPromise]).then(
            (results) => {
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
            }
        );
    }

    toggleRole = (roleId) => {
        const newOpenRoles = {...this.state.openRoles};
        newOpenRoles[roleId] = !newOpenRoles[roleId];
        this.setState({openRoles: newOpenRoles});
    }

    togglePermission = (roleId, permissions) => {
        const roles = {...this.state.roles};
        const role = {...roles[roleId]};
        const newPermissions = [...role.permissions];
        for (const permission of permissions) {
            if (newPermissions.indexOf(permission) === -1) {
                newPermissions.push(permission);
            } else {
                newPermissions.splice(newPermissions.indexOf(permission), 1);
            }
        }
        role.permissions = newPermissions;
        roles[roleId] = role;

        this.setState({roles, saveNeeded: true});
        this.props.actions.setNavigationBlocked(true);
    }

    resetDefaults = () => {
        const newRolesState = JSON.parse(JSON.stringify({...this.state.roles}));

        Object.entries(DefaultRolePermissions).forEach(([roleName, permissions]) => {
            newRolesState[roleName].permissions = permissions;
        });

        this.setState({roles: newRolesState, saveNeeded: true});
        this.props.actions.setNavigationBlocked(true);
    }

    render = () => {
        const hasCustomSchemes = this.props.license.CustomPermissionsSchemes === 'true';
        if (!this.state.loaded) {
            return <LoadingScreen/>;
        }
        return (
            <div className='wrapper--fixed'>
                <h3 className={'admin-console-header ' + (hasCustomSchemes ? 'with-back' : '')}>
                    {hasCustomSchemes &&
                        <BlockableLink
                            to='/admin_console/permissions/schemes'
                            className='fa fa-chevron-left back'
                        />}
                    <FormattedMessage
                        id='admin.permissions.systemScheme'
                        defaultMessage='System Scheme'
                    />
                </h3>

                <div className={'banner info'}>
                    <div className='banner__content'>
                        <span>
                            <FormattedMarkdownMessage
                                id='admin.permissions.systemScheme.introBanner'
                                defaultMessage='Configure the default permissions for Team Admins, Channel Admins and other members. This scheme is inherited by all teams unless a [Team Override Scheme](!https://about.mattermost.com/default-team-override-scheme) is applied in specific teams.'
                            />
                        </span>
                    </div>
                </div>

                <div
                    className={'permissions-block ' + (this.state.openRoles.all_users ? '' : 'closed')}
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
                        role={this.state.roles.all_users}
                        scope={'system_scope'}
                        onToggle={this.togglePermission}
                        selectRow={this.selectRow}
                    />
                </div>

                <div className={'permissions-block ' + (this.state.openRoles.channel_admin ? '' : 'closed')}>
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
                        parentRole={this.state.roles.all_users}
                        role={this.state.roles.channel_admin}
                        scope={'channel_scope'}
                        onToggle={this.togglePermission}
                        selectRow={this.selectRow}
                    />
                </div>

                <div className={'permissions-block ' + (this.state.openRoles.team_admin ? '' : 'closed')}>
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
                        parentRole={this.state.roles.all_users}
                        role={this.state.roles.team_admin}
                        scope={'team_scope'}
                        onToggle={this.togglePermission}
                        selectRow={this.selectRow}
                    />
                </div>

                <div className={'permissions-block ' + (this.state.openRoles.system_admin ? '' : 'closed')}>
                    <div
                        className='header'
                        onClick={() => this.toggleRole('system_admin')}
                    >
                        <div>
                            <h3>
                                <FormattedMessage
                                    id='admin.permissions.systemScheme.systemAdminsTitle'
                                    defaultMessage='System Administrators'
                                />
                            </h3>
                            <span>
                                <FormattedMessage
                                    id='admin.permissions.systemScheme.systemAdminsDescription'
                                    defaultMessage='Full permissions granted to System Administrators.'
                                />
                            </span>
                        </div>
                        <div className='button'>
                            <AccordionToggleIcon/>
                        </div>
                    </div>
                    <PermissionsTree
                        readOnly={true}
                        role={this.state.roles.system_admin}
                        scope={'system_scope'}
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
                    <BlockableLink
                        className='cancel-button'
                        to='/admin_console/permissions/schemes'
                    >
                        <FormattedMessage
                            id='admin.permissions.permissionSchemes.cancel'
                            defaultMessage='Cancel'
                        />
                    </BlockableLink>
                    <a
                        onClick={() => this.setState({showResetDefaultModal: true})}
                        className='cancel-button reset-defaults-btn'
                    >
                        <FormattedMessage
                            id='admin.permissions.systemScheme.resetDefaultsButton'
                            defaultMessage='Reset to Defaults'
                        />
                    </a>
                    <div className='error-message'>
                        <FormError error={this.state.serverError}/>
                    </div>
                </div>

                <Modal
                    dialogClassName='admin-modal'
                    show={this.state.showResetDefaultModal}
                    onHide={() => this.setState({showResetDefaultModal: false})}
                >
                    <Modal.Header
                        closeButton={true}
                    >
                        <h4 className='modal-title'>
                            <FormattedMessage
                                id='admin.permissions.systemScheme.resetDefaultsButtonModalTitle'
                                defaultMessage='Reset to Default?'
                            />
                        </h4>
                    </Modal.Header>
                    <Modal.Body>
                        <FormattedMessage
                            id='admin.permissions.systemScheme.resetDefaultsButtonModalBody'
                            defaultMessage='This will reset all selections on this page to their default settings. Are you sure you want to reset?'
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            type='button'
                            className='btn btn-cancel'
                            onClick={() => this.setState({showResetDefaultModal: false})}
                        >
                            <FormattedMessage
                                id='confirm_modal.cancel'
                                defaultMessage='Cancel'
                            />
                        </button>
                        <button
                            id='linkModalCloseButton'
                            type='button'
                            className='btn btn-default'
                            onClick={() => {
                                this.resetDefaults();
                                this.setState({showResetDefaultModal: false});
                            }}
                        >
                            <FormattedMessage
                                id='admin.permissions.systemScheme.resetDefaultsConfirmationButton'
                                defaultMessage='Yes, Reset'
                            />
                        </button>
                    </Modal.Footer>
                </Modal>

            </div>
        );
    };
}
