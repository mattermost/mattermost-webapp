// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {PermissionsScope} from 'utils/constants';

import PermissionCheckbox from './permission_checkbox';
import PermissionRow from './permission_row.jsx';
import PermissionDescription from './permission_description';

type Permissions = Array<string | { permissions: string[] }>

type Role = { permissions: string[] }

type Props = {
    id: string;
    uniqId: string;
    permissions: Permissions;
    readOnly?: boolean;
    role?: Role;
    parentRole?: Role;
    scope: string;
    combined?: boolean;
    selected?: string;
    selectRow: () => void;
    root?: boolean;
    onChange: (id: string[]) => void;
    additionalValues?: Record<string, Record<string, React.ReactNode>>;
};

type State = {
    expanded: boolean;
    prevPermissions: string[];
    selected: string;
}

const getRecursivePermissions = (permissions: Permissions): string[] => {
    let result: string[] = [];
    for (const permission of permissions) {
        if (typeof permission === 'string') {
            result.push(permission);
        } else {
            result = result.concat(getRecursivePermissions(permission.permissions));
        }
    }
    return result;
};

export default class PermissionGroup extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            expanded: true,
            prevPermissions: [],
            selected: props.selected ?? '',
        };
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        if (props.selected !== state.selected) {
            if (getRecursivePermissions(props.permissions).indexOf(props.selected ?? '') !== -1) {
                return {expanded: true, selected: props.selected};
            }
            return {selected: props.selected};
        }
        return null;
    }

    toggleExpanded = (e: React.MouseEvent) => {
        e.stopPropagation();
        this.setState({expanded: !this.state.expanded});
    }

    toggleSelectRow = (id: string) => {
        if (this.props.readOnly) {
            return;
        }
        this.props.onChange([id]);
    }

    toggleSelectSubGroup = (ids: string[]) => {
        if (this.props.readOnly) {
            return;
        }
        this.props.onChange(ids);
    }

    toggleSelectGroup = () => {
        const {readOnly, permissions, role, onChange} = this.props;
        if (readOnly) {
            return;
        }
        if (this.getStatus(permissions) === 'checked') {
            const permissionsToToggle = [];
            for (const permission of getRecursivePermissions(permissions)) {
                if (!this.fromParent(permission)) {
                    permissionsToToggle.push(permission);
                }
            }
            this.setState({expanded: true});
            onChange(permissionsToToggle);
        } else if (this.getStatus(permissions) === '') {
            const permissionsToToggle = [];
            let expanded = true;
            if (this.state.prevPermissions.length === 0) {
                for (const permission of getRecursivePermissions(permissions)) {
                    if (!this.fromParent(permission)) {
                        permissionsToToggle.push(permission);
                        expanded = false;
                    }
                }
            } else {
                for (const permission of getRecursivePermissions(permissions)) {
                    if (this.state.prevPermissions.indexOf(permission) !== -1 && !this.fromParent(permission)) {
                        permissionsToToggle.push(permission);
                    }
                }
            }
            onChange(permissionsToToggle);
            this.setState({prevPermissions: [], expanded});
        } else {
            const permissionsToToggle = [];
            for (const permission of getRecursivePermissions(permissions)) {
                if (role && role.permissions.indexOf(permission) === -1 && !this.fromParent(permission)) {
                    permissionsToToggle.push(permission);
                }
            }
            this.setState({prevPermissions: role?.permissions ?? [], expanded: false});
            onChange(permissionsToToggle);
        }
    }

    isInScope = (permission: string) => {
        if (this.props.scope === 'channel_scope' && PermissionsScope[permission] !== 'channel_scope') {
            return false;
        }
        if (this.props.scope === 'team_scope' && PermissionsScope[permission] === 'system_scope') {
            return false;
        }
        return true;
    }

    renderPermission = (permission: string, additionalValues: Record<string, React.ReactNode>) => {
        if (!this.isInScope(permission)) {
            return null;
        }
        const comesFromParent = this.fromParent(permission);
        const active = comesFromParent || this.props.role?.permissions.indexOf(permission) !== -1;
        return (
            <PermissionRow
                key={permission}
                id={permission}
                uniqId={this.props.uniqId + '-' + permission}
                selected={this.props.selected}
                selectRow={this.props.selectRow}
                readOnly={this.props.readOnly || comesFromParent}
                inherited={comesFromParent ? this.props.parentRole : null}
                value={active ? 'checked' : ''}
                onChange={this.toggleSelectRow}
                additionalValues={additionalValues}
            />
        );
    }

    renderGroup = (g: any) => {
        return (
            <PermissionGroup
                key={g.id}
                id={g.id}
                uniqId={this.props.uniqId + '-' + g.id}
                selected={this.props.selected}
                selectRow={this.props.selectRow}
                readOnly={this.props.readOnly}
                permissions={g.permissions}
                additionalValues={this.props.additionalValues}
                role={this.props.role}
                parentRole={this.props.parentRole}
                scope={this.props.scope}
                onChange={this.toggleSelectSubGroup}
                combined={g.combined}
                root={false}
            />
        );
    }

    fromParent = (id: string) => {
        return this.props.parentRole && this.props.parentRole.permissions.indexOf(id) !== -1;
    }

    getStatus = (permissions: Permissions) => {
        let anyChecked = false;
        let anyUnchecked = false;
        for (const permission of permissions) {
            if (typeof permission === 'string') {
                if (!this.isInScope(permission)) {
                    continue;
                }
                anyChecked = anyChecked || this.fromParent(permission) || this.props.role?.permissions.indexOf(permission) !== -1;
                anyUnchecked = anyUnchecked || (!this.fromParent(permission) && this.props.role?.permissions.indexOf(permission) === -1);
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
        return getRecursivePermissions(this.props.permissions).some((permission) => this.isInScope(permission));
    }

    allPermissionsFromParent = (permissions: Permissions) => {
        for (const permission of permissions) {
            if (typeof permission !== 'string') {
                if (!this.allPermissionsFromParent(permission.permissions)) {
                    return false;
                }
                continue;
            }
            if (this.isInScope(permission) && !this.fromParent(permission)) {
                return false;
            }
        }
        return true;
    }

    render = () => {
        const {id, uniqId, permissions, readOnly, combined, root, selected, additionalValues} = this.props;
        if (!this.hasPermissionsOnScope()) {
            return null;
        }
        const permissionsRows = permissions.map((group) => {
            if (typeof group === 'string') {
                const addVals = additionalValues && additionalValues[group] ? additionalValues[group] : {};
                return this.renderPermission(group, addVals);
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

        let inherited;
        if (this.allPermissionsFromParent(this.props.permissions) && this.props.combined) {
            inherited = this.props.parentRole;
        }

        let classes = '';
        if (selected === id) {
            classes += ' selected';
        }

        if (readOnly || this.allPermissionsFromParent(this.props.permissions)) {
            classes += ' read-only';
        }

        if (combined) {
            classes += ' combined';
        }

        return (
            <div className='permission-group'>
                {!root &&
                    <div
                        className={'permission-group-row ' + classes}
                        onClick={this.toggleSelectGroup}
                        id={uniqId}
                    >
                        {!combined &&
                            <div
                                className={'fa fa-caret-right permission-arrow ' + (this.state.expanded ? 'open' : '')}
                                onClick={this.toggleExpanded}
                            />}
                        <PermissionCheckbox
                            value={this.getStatus(this.props.permissions)}
                            id={`${uniqId}-checkbox`}
                        />
                        <span className='permission-name'>
                            <FormattedMessage id={'admin.permissions.group.' + id + '.name'}/>
                        </span>
                        <PermissionDescription
                            additionalValues={additionalValues?.[id] ? additionalValues[id] : {}}
                            inherited={inherited as any}
                            id={id}
                            selectRow={this.props.selectRow}
                            rowType='group'
                        />
                    </div>}
                {!combined &&
                    <div className={'permission-group-permissions ' + (this.state.expanded ? 'open' : '')}>
                        {permissionsRows}
                    </div>}
            </div>
        );
    };
}
