// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import GroupRow from 'components/admin_console/group_settings/group_row.jsx';

export default class GroupsList extends React.PureComponent {
    static propTypes = {
        groups: PropTypes.arrayOf(PropTypes.object),
        loading: PropTypes.bool,
        actions: PropTypes.shape({
            link: PropTypes.func.isRequired,
            unlink: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        groups: [],
    };

    constructor(props) {
        super(props);
        this.state = {
            checked: {},
        };
    }

    onCheckToggle = (key) => {
        const newChecked = {...this.state.checked};
        newChecked[key] = !newChecked[key];
        this.setState({checked: newChecked});
    }

    linkSelectedGroups = () => {
        for (const group of this.props.groups) {
            if (this.state.checked[group.primary_key] && !group.mattermost_group_id) {
                this.props.actions.link(group.primary_key);
            }
        }
    }

    unlinkSelectedGroups = () => {
        for (const group of this.props.groups) {
            if (this.state.checked[group.primary_key] && group.mattermost_group_id) {
                this.props.actions.unlink(group.primary_key);
            }
        }
    }

    selectionActionButtonType = () => {
        let hasSelectedLinked = false;
        for (const group of this.props.groups) {
            if (this.state.checked[group.primary_key]) {
                if (!group.mattermost_group_id) {
                    return 'link';
                }
                hasSelectedLinked = true;
            }
        }
        if (hasSelectedLinked) {
            return 'unlink';
        }

        return 'disabled';
    }

    renderSelectionActionButton = () => {
        switch (this.selectionActionButtonType()) {
        case 'link':
            return (
                <button
                    className='btn btn-primary'
                    onClick={this.linkSelectedGroups}
                >
                    <i className='icon fa fa-link'/>
                    <FormattedMessage
                        id='admin.group_settings.groups_list.link_selected'
                        defaultMessage='Link Selected Groups'
                    />
                </button>
            );
        case 'unlink':
            return (
                <button
                    className='btn btn-primary'
                    onClick={this.unlinkSelectedGroups}
                >
                    <i className='icon fa fa-unlink'/>
                    <FormattedMessage
                        id='admin.group_settings.groups_list.unlink_selected'
                        defaultMessage='Unlink Selected Groups'
                    />
                </button>
            );
        default:
            return (
                <button
                    className='btn btn-inactive disabled'
                >
                    <i className='icon fa fa-link'/>
                    <FormattedMessage
                        id='admin.group_settings.groups_list.link_selected'
                        defaultMessage='Link Selected Groups'
                    />
                </button>
            );
        }
    }

    renderRows = () => {
        if (this.props.loading) {
            return (
                <div className='groups-list-loading'>
                    <i className='fa fa-spinner fa-pulse fa-2x'/>
                </div>
            );
        }
        if (this.props.groups.length === 0) {
            return (
                <div className='groups-list-empty'>
                    <FormattedMessage
                        id='admin.group_settings.groups_list.no-groups-found'
                        defaultMessage='No groups found'
                    />
                </div>
            );
        }
        return this.props.groups.map((item) => {
            return (
                <GroupRow
                    key={item.primary_key}
                    primary_key={item.primary_key}
                    name={item.name}
                    mattermost_group_id={item.mattermost_group_id}
                    has_syncables={item.has_syncables}
                    failed={item.failed}
                    checked={Boolean(this.state.checked[item.primary_key])}
                    onCheckToggle={this.onCheckToggle}
                    actions={{
                        link: this.props.actions.link,
                        unlink: this.props.actions.unlink,
                    }}
                />
            );
        });
    }

    render = () => {
        return (
            <div className='groups-list'>
                <div className='groups-list--global-actions'>
                    <div/>
                    <div className='group-list-link-unlink'>
                        {this.renderSelectionActionButton()}
                    </div>
                </div>
                <div className='groups-list--header'>
                    <div className='group-name'>
                        <FormattedMessage
                            id='admin.group_settings.groups_list.nameHeader'
                            defaultMessage='Name'
                        />
                    </div>
                    <div className='group-description'>
                        <FormattedMessage
                            id='admin.group_settings.groups_list.mappingHeader'
                            defaultMessage='AD/LDAP Linking'
                        />
                    </div>
                    <div className='group-actions'/>
                </div>
                <div className='groups-list--body'>
                    {this.renderRows()}
                </div>
            </div>
        );
    }
}

