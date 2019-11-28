// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import Permissions from 'mattermost-redux/constants/permissions';

import PermissionGroup from '../permission_group.jsx';

import EditPostTimeLimitButton from '../edit_post_time_limit_button';
import EditPostTimeLimitModal from '../edit_post_time_limit_modal';

export default class GuestPermissionsTree extends React.Component {
    static propTypes = {
        scope: PropTypes.string.isRequired,
        role: PropTypes.object.isRequired,
        onToggle: PropTypes.func.isRequired,
        parentRole: PropTypes.object,
        selected: PropTypes.string,
        selectRow: PropTypes.func.isRequired,
        readOnly: PropTypes.bool,
    };

    static defaultProps = {
        role: {
            permissions: [],
        },
    };

    constructor(props) {
        super(props);

        this.state = {
            editTimeLimitModalIsVisible: false,
        };

        this.ADDITIONAL_VALUES = {
            edit_post: {
                editTimeLimitButton: <EditPostTimeLimitButton onClick={this.openPostTimeLimitModal}/>,
            },
        };

        this.permissions = [
            Permissions.CREATE_PRIVATE_CHANNEL,
            Permissions.EDIT_POST,
            Permissions.DELETE_POST,
            {
                id: 'reactions',
                combined: true,
                permissions: [
                    Permissions.ADD_REACTION,
                    Permissions.REMOVE_REACTION,
                ],
            },
        ];
    }

    openPostTimeLimitModal = () => {
        this.setState({editTimeLimitModalIsVisible: true});
    }

    closePostTimeLimitModal = () => {
        this.setState({editTimeLimitModalIsVisible: false});
    }

    toggleGroup = (ids) => {
        if (this.props.readOnly) {
            return;
        }
        this.props.onToggle(this.props.role.name, ids);
    }

    render = () => {
        return (
            <div className='permissions-tree guest'>
                <div className='permissions-tree--header'>
                    <div className='permission-name'>
                        <FormattedMessage
                            id='admin.permissions.permissionsTree.permission'
                            defaultMessage='Permission'
                        />
                    </div>
                    <div className='permission-description'>
                        <FormattedMessage
                            id='admin.permissions.permissionsTree.description'
                            defaultMessage='Description'
                        />
                    </div>
                </div>
                <div className='permissions-tree--body'>
                    <PermissionGroup
                        key='all'
                        id='all'
                        uniqId={this.props.role.name}
                        selected={this.props.selected}
                        selectRow={this.props.selectRow}
                        readOnly={this.props.readOnly}
                        permissions={this.permissions}
                        additionalValues={this.ADDITIONAL_VALUES}
                        role={this.props.role}
                        parentRole={this.props.parentRole}
                        scope={this.props.scope}
                        combined={false}
                        onChange={this.toggleGroup}
                        root={true}
                    />
                </div>
                <EditPostTimeLimitModal
                    onClose={this.closePostTimeLimitModal}
                    show={this.state.editTimeLimitModalIsVisible}
                />
            </div>
        );
    };
}
