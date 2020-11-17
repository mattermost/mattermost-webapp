// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';

import {localizeMessage} from 'utils/utils.jsx';

import CheckboxCheckedIcon from 'components/widgets/icons/checkbox_checked_icon.jsx';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';

export default class GroupRow extends React.PureComponent {
    static propTypes = {
        primary_key: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        mattermost_group_id: PropTypes.string,
        has_syncables: PropTypes.bool,
        checked: PropTypes.bool,
        failed: PropTypes.bool,
        onCheckToggle: PropTypes.func,
        readOnly: PropTypes.bool,
        actions: PropTypes.shape({
            link: PropTypes.func.isRequired,
            unlink: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        };
    }

    onRowClick = () => {
        if (this.props.readOnly) {
            return;
        }
        this.props.onCheckToggle(this.props.primary_key);
    }

    linkHandler = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (this.props.readOnly) {
            return;
        }
        this.setState({loading: true});
        await this.props.actions.link(this.props.primary_key);
        this.setState({loading: false});
    }

    unlinkHandler = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (this.props.readOnly) {
            return;
        }
        this.setState({loading: true});
        await this.props.actions.unlink(this.props.primary_key);
        this.setState({loading: false});
    }

    renderActions = () => {
        if (!this.props.mattermost_group_id) {
            return null;
        }
        if (this.props.has_syncables) {
            return (
                <Link
                    to={'/admin_console/user_management/groups/' + this.props.mattermost_group_id}
                    id={`${this.props.name}_edit`}
                >
                    <FormattedMessage
                        id='admin.group_settings.group_row.edit'
                        defaultMessage='Edit'
                    />
                </Link>
            );
        }
        return (
            <Link
                to={'/admin_console/user_management/groups/' + this.props.mattermost_group_id}
                id={`${this.props.name}_configure`}
            >
                <FormattedMessage
                    id='admin.group_settings.group_row.configure'
                    defaultMessage='Configure'
                />
            </Link>
        );
    }

    renderLinked = () => {
        if (this.state.loading) {
            return (
                <a href='#'>
                    {this.props.mattermost_group_id &&
                        <LoadingSpinner text={localizeMessage('admin.group_settings.group_row.unlinking', 'Unlinking')}/>
                    }
                    {!this.props.mattermost_group_id &&
                        <LoadingSpinner text={localizeMessage('admin.group_settings.group_row.linking', 'Linking')}/>
                    }
                </a>
            );
        }
        if (this.props.mattermost_group_id) {
            if (this.props.failed) {
                return (
                    <a
                        href='#'
                        onClick={this.unlinkHandler}
                        className='warning'
                    >
                        <i className='icon fa fa-exclamation-triangle'/>
                        <FormattedMessage
                            id='admin.group_settings.group_row.unlink_failed'
                            defaultMessage='Unlink failed'
                        />
                    </a>
                );
            }
            return (
                <a
                    href='#'
                    onClick={this.unlinkHandler}
                    className={this.props.readOnly ? 'disabled' : ''}
                >
                    <i className='icon fa fa-link'/>
                    <FormattedMessage
                        id='admin.group_settings.group_row.linked'
                        defaultMessage='Linked'
                    />
                </a>
            );
        }
        if (this.props.failed) {
            return (
                <a
                    href='#'
                    onClick={this.linkHandler}
                    className='warning'
                >
                    <i className='icon fa fa-exclamation-triangle'/>
                    <FormattedMessage
                        id='admin.group_settings.group_row.link_failed'
                        defaultMessage='Link failed'
                    />
                </a>
            );
        }
        return (
            <a
                href='#'
                onClick={this.linkHandler}
                className={this.props.readOnly ? 'disabled' : ''}
            >
                <i className='icon fa fa-unlink'/>
                <FormattedMessage
                    id='admin.group_settings.group_row.not_linked'
                    defaultMessage='Not Linked'
                />
            </a>
        );
    }

    render = () => {
        return (
            <div
                id={`${this.props.name}_group`}
                className={'group ' + (this.props.checked ? 'checked' : '')}
                onClick={this.onRowClick}
            >
                <div className='group-row'>
                    <div className='group-name'>
                        <div
                            className={'group-check ' + (this.props.checked ? 'checked' : '')}
                        >
                            {this.props.checked && <CheckboxCheckedIcon/>}
                        </div>
                        <span>
                            {this.props.name}
                        </span>
                    </div>
                    <div className='group-content'>
                        <span className='group-description'>
                            {this.renderLinked()}
                        </span>
                        <span className='group-actions'>
                            {this.renderActions()}
                        </span>
                    </div>
                </div>
            </div>
        );
    };
}
