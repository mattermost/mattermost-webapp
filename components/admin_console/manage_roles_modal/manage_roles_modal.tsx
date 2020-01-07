// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';
import {General} from 'mattermost-redux/constants';
import * as UserUtils from 'mattermost-redux/utils/user_utils';

import {trackEvent} from 'actions/diagnostics_actions.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import BotBadge from 'components/widgets/badges/bot_badge';
import Avatar from 'components/widgets/users/avatar';
type Props = {
    show: boolean;
    user?: any;
    userAccessTokensEnabled: boolean;

    // defining custom function type instead of using React.MouseEventHandler
    // to make the event optional
    onModalDismissed: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    actions: { updateUserRoles: Function };
}

type State = {
    user: any;
    error: any | null;
    hasPostAllRole: boolean;
    hasPostAllPublicRole: boolean;
    hasUserAccessTokenRole: boolean;
    isSystemAdmin: boolean;
}

function getStateFromProps(props: Props): State {
    const roles = props.user && props.user.roles ? props.user.roles : '';

    return {
        user: props.user,
        error: null,
        hasPostAllRole: UserUtils.hasPostAllRole(roles),
        hasPostAllPublicRole: UserUtils.hasPostAllPublicRole(roles),
        hasUserAccessTokenRole: UserUtils.hasUserAccessTokenRole(roles),
        isSystemAdmin: UserUtils.isSystemAdmin(roles),
    };
}

export default class ManageRolesModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = getStateFromProps(props);
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: Props) {
        const prevUser = prevState.user || {};
        const user = nextProps.user || {};

        if (prevUser.id !== user.id) {
            return getStateFromProps(nextProps);
        }
        return null;
    }

    handleError = (error: any) => {
        this.setState({
            error,
        });
    }

    handleSystemAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'systemadmin') {
            this.setState({isSystemAdmin: true});
        } else if (e.target.name === 'systemmember') {
            this.setState({isSystemAdmin: false});
        }
    };

    handleUserAccessTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            hasUserAccessTokenRole: e.target.checked,
        });
    };

    handlePostAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            hasPostAllRole: e.target.checked,
        });
    };

    handlePostAllPublicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            hasPostAllPublicRole: e.target.checked,
        });
    };

    trackRoleChanges = (roles: string, oldRoles: string) => {
        if (UserUtils.hasUserAccessTokenRole(roles) && !UserUtils.hasUserAccessTokenRole(oldRoles)) {
            trackEvent('actions', 'add_roles', {role: General.SYSTEM_USER_ACCESS_TOKEN_ROLE});
        } else if (!UserUtils.hasUserAccessTokenRole(roles) && UserUtils.hasUserAccessTokenRole(oldRoles)) {
            trackEvent('actions', 'remove_roles', {role: General.SYSTEM_USER_ACCESS_TOKEN_ROLE});
        }

        if (UserUtils.hasPostAllRole(roles) && !UserUtils.hasPostAllRole(oldRoles)) {
            trackEvent('actions', 'add_roles', {role: General.SYSTEM_POST_ALL_ROLE});
        } else if (!UserUtils.hasPostAllRole(roles) && UserUtils.hasPostAllRole(oldRoles)) {
            trackEvent('actions', 'remove_roles', {role: General.SYSTEM_POST_ALL_ROLE});
        }

        if (UserUtils.hasPostAllPublicRole(roles) && !UserUtils.hasPostAllPublicRole(oldRoles)) {
            trackEvent('actions', 'add_roles', {role: General.SYSTEM_POST_ALL_PUBLIC_ROLE});
        } else if (!UserUtils.hasPostAllPublicRole(roles) && UserUtils.hasPostAllPublicRole(oldRoles)) {
            trackEvent('actions', 'remove_roles', {role: General.SYSTEM_POST_ALL_PUBLIC_ROLE});
        }
    }

    handleSave = async () => {
        this.setState({error: null});

        let roles = General.SYSTEM_USER_ROLE;

        if (this.state.isSystemAdmin) {
            roles += ' ' + General.SYSTEM_ADMIN_ROLE;
        } else if (this.state.hasUserAccessTokenRole) {
            roles += ' ' + General.SYSTEM_USER_ACCESS_TOKEN_ROLE;
            if (this.state.hasPostAllRole) {
                roles += ' ' + General.SYSTEM_POST_ALL_ROLE;
            } else if (this.state.hasPostAllPublicRole) {
                roles += ' ' + General.SYSTEM_POST_ALL_PUBLIC_ROLE;
            }
        }

        const {data} = await this.props.actions.updateUserRoles(this.props.user.id, roles);

        this.trackRoleChanges(roles, this.props.user.roles);

        if (data) {
            this.props.onModalDismissed();
        } else {
            this.handleError(
                <FormattedMessage
                    id='admin.manage_roles.saveError'
                    defaultMessage='Unable to save roles.'
                />
            );
        }
    }

    renderContents = () => {
        const {user} = this.props;

        if (user == null) {
            return <div/>;
        }

        let name = UserUtils.getFullName(user);
        if (name) {
            name += ` (@${user.username})`;
        } else {
            name = `@${user.username}`;
        }

        let additionalRoles;
        if (this.state.hasUserAccessTokenRole || this.state.isSystemAdmin || user.is_bot) {
            additionalRoles = (
                <div>
                    <p>
                        <FormattedMarkdownMessage
                            id='admin.manage_roles.additionalRoles'
                            defaultMessage='Select additional permissions for the account. [Read more about roles and permissions](!https://about.mattermost.com/default-permissions).'
                        />
                    </p>
                    <div className='checkbox'>
                        <label>
                            <input
                                type='checkbox'
                                ref='postall'
                                checked={this.state.hasPostAllRole || this.state.isSystemAdmin}
                                disabled={this.state.isSystemAdmin}
                                onChange={this.handlePostAllChange}
                            />
                            <strong>
                                <FormattedMessage
                                    id='admin.manage_roles.postAllRoleTitle'
                                    defaultMessage='post:all'
                                />
                            </strong>
                            <FormattedMessage
                                id='admin.manage_roles.postAllRole'
                                defaultMessage='Access to post to all Mattermost channels including direct messages.'
                            />
                        </label>
                    </div>
                    <div className='checkbox'>
                        <label>
                            <input
                                type='checkbox'
                                ref='postallpublic'
                                checked={this.state.hasPostAllPublicRole || this.state.hasPostAllRole || this.state.isSystemAdmin}
                                disabled={this.state.hasPostAllRole || this.state.isSystemAdmin}
                                onChange={this.handlePostAllPublicChange}
                            />
                            <strong>
                                <FormattedMessage
                                    id='admin.manage_roles.postAllPublicRoleTitle'
                                    defaultMessage='post:channels'
                                />
                            </strong>
                            <FormattedMessage
                                id='admin.manage_roles.postAllPublicRole'
                                defaultMessage='Access to post to all Mattermost public channels.'
                            />
                        </label>
                    </div>
                </div>
            );
        }

        let userAccessTokenContent;
        if (this.props.userAccessTokensEnabled) {
            if (user.is_bot) {
                userAccessTokenContent = (
                    <div>
                        <div className='member-row--padded member-row-lone-padding'>
                            {additionalRoles}
                        </div>
                    </div>
                );
            } else {
                userAccessTokenContent = (
                    <div>
                        <div className='checkbox'>
                            <label>
                                <input
                                    type='checkbox'
                                    ref='postall'
                                    checked={this.state.hasUserAccessTokenRole || this.state.isSystemAdmin}
                                    disabled={this.state.isSystemAdmin}
                                    onChange={this.handleUserAccessTokenChange}
                                />
                                <FormattedMarkdownMessage
                                    id='admin.manage_roles.allowUserAccessTokens'
                                    defaultMessage='Allow this account to generate [personal access tokens](!https://about.mattermost.com/default-user-access-tokens).'
                                />
                                <span className='d-block padding-top padding-bottom light'>
                                    <FormattedHTMLMessage
                                        id='admin.manage_roles.allowUserAccessTokensDesc'
                                        defaultMessage="Removing this permission doesn't delete existing tokens. To delete them, go to the user's Manage Tokens menu."
                                    />
                                </span>
                            </label>
                        </div>
                        <div className='member-row--padded'>
                            {additionalRoles}
                        </div>
                    </div>
                );
            }
        }

        let email = user.email;
        if (user.is_bot) {
            email = '';
        }

        return (
            <div>
                <div className='manage-teams__user'>
                    <Avatar
                        size='lg'
                        username={user.username}
                        url={Client4.getProfilePictureUrl(user.id, user.last_picture_update)}
                    />
                    <div className='manage-teams__info'>
                        <div className='manage-teams__name'>
                            {name}
                            <BotBadge
                                show={Boolean(user.is_bot)}
                                className='badge-admin'
                            />
                        </div>
                        <div className='manage-teams__email'>
                            {email}
                        </div>
                    </div>
                </div>
                <div>
                    <div className='manage-row--inner'>
                        <div className='radio-inline'>
                            <label>
                                <input
                                    name='systemadmin'
                                    type='radio'
                                    checked={this.state.isSystemAdmin}
                                    onChange={this.handleSystemAdminChange}
                                />
                                <FormattedMessage
                                    id='admin.manage_roles.systemAdmin'
                                    defaultMessage='System Admin'
                                />
                            </label>
                        </div>
                        <div className='radio-inline'>
                            <label>
                                <input
                                    name='systemmember'
                                    type='radio'
                                    checked={!this.state.isSystemAdmin}
                                    onChange={this.handleSystemAdminChange}
                                />
                                <FormattedMessage
                                    id='admin.manage_roles.systemMember'
                                    defaultMessage='Member'
                                />
                            </label>
                        </div>
                    </div>
                    {userAccessTokenContent}
                </div>
            </div>
        );
    }

    render() {
        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onModalDismissed}
                dialogClassName='a11y__modal manage-teams'
                role='dialog'
                aria-labelledby='manageRolesModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='manageRolesModalLabel'
                    >
                        <FormattedMessage
                            id='admin.manage_roles.manageRolesTitle'
                            defaultMessage='Manage Roles'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.renderContents()}
                    {this.state.error}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-link'
                        onClick={this.props.onModalDismissed}
                    >
                        <FormattedMessage
                            id='admin.manage_roles.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        type='button'
                        className='btn btn-primary'
                        onClick={this.handleSave}
                    >
                        <FormattedMessage
                            id='admin.manage_roles.save'
                            defaultMessage='Save'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
