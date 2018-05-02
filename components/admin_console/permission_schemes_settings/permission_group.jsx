// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Permissions} from 'utils/constants.jsx';

import PermissionCheckbox from './permission_checkbox.jsx';
import PermissionRow from './permission_row.jsx';

export default class PermissionGroup extends React.Component {
    static propTypes = {
        code: PropTypes.string.isRequired,
        permissions: PropTypes.array.isRequired,
        readOnly: PropTypes.bool,
        role: PropTypes.object,
        parentRole: PropTypes.object,
        scope: PropTypes.string.isRequired,
        combined: PropTypes.bool,
        root: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            expanded: true,
            prevPermissions: [],
            lastMode: '',
        };
    }

    toggleExpanded = (e) => {
        e.stopPropagation();
        this.setState({expanded: !this.state.expanded});
    }

    toggleSelectRow = (code) => {
        if (this.props.readOnly) {
            return;
        }
        this.setState({lastMode: ''});
        this.props.onChange([code]);
    }

    getRecursivePermissions = (permissions) => {
        let result = [];
        for (const permission of permissions) {
            if (typeof permission === 'string') {
                result.push(permission);
            } else {
                result = result.concat(this.getRecursivePermissions(permission.permissions));
            }
        }
        return result;
    }

    toggleSelectSubGroup = (codes) => {
        if (this.props.readOnly) {
            return;
        }
        this.setState({lastMode: ''});
        this.props.onChange(codes);
    }

    toggleSelectGroup = () => {
        const {readOnly, permissions, role, onChange} = this.props;
        if (readOnly) {
            return;
        }
        if (this.getStatus(permissions) === 'checked') {
            const permissionsToToggle = [];
            if (this.state.prevPermissions.length === role.permissions.length) {
                for (const permission of this.getRecursivePermissions(permissions)) {
                    if (!this.fromParent(permission)) {
                        permissionsToToggle.push(permission);
                    }
                }
            } else {
                for (const permission of this.getRecursivePermissions(permissions)) {
                    if (this.state.prevPermissions.indexOf(permission) === -1 && !this.fromParent(permission)) {
                        permissionsToToggle.push(permission);
                    }
                }
            }
            onChange(permissionsToToggle);
            this.setState({prevPermissions: [], lastMode: this.getStatus(permissions)});
        } else if (this.getStatus(permissions) === '') {
            const permissionsToToggle = [];
            if (this.state.prevPermissions.length === 0) {
                for (const permission of this.getRecursivePermissions(permissions)) {
                    if (!this.fromParent(permission)) {
                        permissionsToToggle.push(permission);
                    }
                }
            } else {
                for (const permission of this.getRecursivePermissions(permissions)) {
                    if (this.state.prevPermissions.indexOf(permission) !== -1 && !this.fromParent(permission)) {
                        permissionsToToggle.push(permission);
                    }
                }
            }
            onChange(permissionsToToggle);
            this.setState({prevPermissions: [], lastMode: this.getStatus(permissions)});
        } else {
            const permissionsToToggle = [];
            if (this.state.lastMode === '') {
                for (const permission of this.getRecursivePermissions(permissions)) {
                    if (role.permissions.indexOf(permission) === -1 && !this.fromParent(permission)) {
                        permissionsToToggle.push(permission);
                    }
                }
                this.setState({prevPermissions: role.permissions});
            } else {
                for (const permission of this.getRecursivePermissions(permissions)) {
                    if (role.permissions.indexOf(permission) !== -1 && !this.fromParent(permission)) {
                        permissionsToToggle.push(permission);
                    }
                }
                this.setState({prevPermissions: role.permissions});
            }
            onChange(permissionsToToggle);
        }
    }

    isInScope = (permission) => {
        if (this.props.scope === 'channel_scope' && permission.scope !== 'channel_scope') {
            return false;
        }
        if (this.props.scope === 'team_scope' && permission.scope === 'system_scope') {
            return false;
        }
        return true;
    }

    renderPermission = (permission) => {
        const p = Permissions[permission];
        if (!this.isInScope(p)) {
            return null;
        }
        const comesFromParent = this.fromParent(p.code);
        const active = comesFromParent || this.props.role.permissions.indexOf(p.code) !== -1;
        return (
            <PermissionRow
                key={p.code}
                code={p.code}
                readOnly={this.props.readOnly || comesFromParent}
                inherited={comesFromParent ? this.props.parentRole : null}
                value={active ? 'checked' : ''}
                onChange={this.toggleSelectRow}
            />
        );
    }

    renderGroup = (g) => {
        return (
            <PermissionGroup
                key={g.code}
                code={g.code}
                readOnly={this.props.readOnly}
                permissions={g.permissions}
                role={this.props.role}
                parentRole={this.props.parentRole}
                scope={this.props.scope}
                onChange={this.toggleSelectSubGroup}
                combined={g.combined}
                root={false}
            />
        );
    }

    fromParent = (code) => {
        return this.props.parentRole && this.props.parentRole.permissions.indexOf(code) !== -1;
    }

    getStatus = (permissions) => {
        let anyChecked = false;
        let anyUnchecked = false;
        for (const permission of permissions) {
            if (typeof permission === 'string') {
                const p = Permissions[permission];
                if (!this.isInScope(p)) {
                    continue;
                }
                anyChecked = anyChecked || this.fromParent(p.code) || this.props.role.permissions.indexOf(p.code) !== -1;
                anyUnchecked = anyUnchecked || (!this.fromParent(p.code) && this.props.role.permissions.indexOf(p.code) === -1);
            } else {
                const status = this.getStatus(permission.permissions);
                if (status === 'intermediate') {
                    return 'intermediate';
                }
                if (status === 'checked') {
                    anyChecked = true;
                }
                if (status === '') {
                    anyUnchecked = true;
                }
            }
        }
        if (anyChecked && anyUnchecked) {
            return 'intermediate';
        }
        if (anyChecked && !anyUnchecked) {
            return 'checked';
        }
        return '';
    }

    hasPermissionsOnScope = () => {
        for (const permission of this.props.permissions) {
            if (typeof permission !== 'string') {
                return true;
            }
            const p = Permissions[permission];
            if (this.isInScope(p)) {
                return true;
            }
        }
        return false;
    }

    allPermissionsFromParent = (permissions) => {
        for (const permission of permissions) {
            if (typeof permission !== 'string') {
                if (!this.allPermissionsFromParent(permission.permissions)) {
                    return false;
                }
                continue;
            }
            const p = Permissions[permission];
            if (this.isInScope(p) && !this.fromParent(p.code)) {
                return false;
            }
        }
        return true;
    }

    render = () => {
        const {code, permissions, readOnly, combined, root} = this.props;
        if (!this.hasPermissionsOnScope()) {
            return null;
        }
        const permissionsRows = permissions.map((group) => {
            if (typeof group === 'string') {
                return this.renderPermission(group);
            }
            return this.renderGroup(group);
        });
        if (root) {
            return (
                <div className={'permission-group-permissions ' + (this.state.expanded ? 'open' : '')}>
                    {permissionsRows}
                </div>
            );
        }
        return (
            <div className='permission-group'>
                {!root &&
                    <div
                        className={'permission-group-row ' + (readOnly || this.allPermissionsFromParent(this.props.permissions) ? 'read-only ' : '') + (combined ? 'combined' : '')}
                        onClick={this.toggleSelectGroup}
                    >
                        {!combined &&
                            <div
                                className={'fa fa-caret-right permission-arrow ' + (this.state.expanded ? 'open' : '')}
                                onClick={this.toggleExpanded}
                            />}
                        <PermissionCheckbox value={this.getStatus(this.props.permissions)}/>
                        <span className='permission-name'>
                            <FormattedMessage id={'admin.permissions.group.' + code + '.name'}/>
                        </span>
                        <span className='permission-description'>
                            <FormattedMessage id={'admin.permissions.group.' + code + '.description'}/>
                        </span>
                    </div>}
                {!combined &&
                    <div className={'permission-group-permissions ' + (this.state.expanded ? 'open' : '')}>
                        {permissionsRows}
                    </div>}
            </div>
        );
    };
}
