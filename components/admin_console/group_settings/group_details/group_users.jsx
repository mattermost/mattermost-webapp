// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import GroupUsersRow from 'components/admin_console/group_settings/group_details/group_users_row';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import NextIcon from 'components/widgets/icons/fa_next_icon';
import PreviousIcon from 'components/widgets/icons/fa_previous_icon';

const GROUP_MEMBERS_PAGE_SIZE = 20;

export default class GroupUsers extends React.PureComponent {
    static propTypes = {
        groupID: PropTypes.string.isRequired,
        members: PropTypes.arrayOf(PropTypes.object),
        total: PropTypes.number.isRequired,
        getMembers: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            page: 0,
        };
    }

    componentDidMount() {
        this.props.getMembers(this.props.groupID, 0, GROUP_MEMBERS_PAGE_SIZE).then(() => {
            this.setState({loading: false});
        });
    }

    previousPage = async () => {
        const page = this.state.page < 1 ? 0 : this.state.page - 1;
        this.setState({page, loading: true});
        await this.props.getMembers(this.props.groupID, page, GROUP_MEMBERS_PAGE_SIZE);
        this.setState({loading: false});
    }

    nextPage = async () => {
        const page = (this.state.page + 1) * GROUP_MEMBERS_PAGE_SIZE >= this.props.total ? this.state.page : this.state.page + 1;
        this.setState({page, loading: true});
        await this.props.getMembers(this.props.groupID, page, GROUP_MEMBERS_PAGE_SIZE);
        this.setState({loading: false});
    }

    renderRows = () => {
        if (this.props.members.length === 0) {
            return (
                <div className='group-users-empty'>
                    <FormattedMessage
                        id='admin.group_settings.group_details.group_users.no-users-found'
                        defaultMessage='No users found'
                    />
                </div>
            );
        }
        return this.props.members.map((member) => {
            return (
                <GroupUsersRow
                    key={member.id}
                    username={member.username}
                    displayName={member.first_name + ' ' + member.last_name}
                    email={member.email}
                    userId={member.id}
                    lastPictureUpdate={member.last_picture_update}
                />
            );
        });
    }

    renderPagination = () => {
        if (this.props.members.length === 0) {
            return (<div className='group-users--footer empty'/>);
        }

        const startCount = (this.state.page * GROUP_MEMBERS_PAGE_SIZE) + 1;
        let endCount = (this.state.page * GROUP_MEMBERS_PAGE_SIZE) + GROUP_MEMBERS_PAGE_SIZE;
        const total = this.props.total;
        if (endCount > total) {
            endCount = total;
        }
        const lastPage = endCount === total;
        const firstPage = this.state.page === 0;

        return (
            <div className='group-users--footer'>
                <div className='counter'>
                    <FormattedMessage
                        id='admin.group_settings.groups_list.paginatorCount'
                        defaultMessage='{startCount, number} - {endCount, number} of {total, number}'
                        values={{
                            startCount,
                            endCount,
                            total,
                        }}
                    />
                </div>
                <button
                    className={'btn btn-link prev ' + (firstPage ? 'disabled' : '')}
                    onClick={this.previousPage}
                    disabled={firstPage}
                >
                    <PreviousIcon/>
                </button>
                <button
                    className={'btn btn-link next ' + (lastPage ? 'disabled' : '')}
                    onClick={this.nextPage}
                    disabled={lastPage}
                >
                    <NextIcon/>
                </button>
            </div>
        );
    }

    render = () => {
        return (
            <div className='group-users'>
                <div className='group-users--header'>
                    <FormattedMarkdownMessage
                        id='admin.group_settings.group_profile.group_users.ldapConnector'
                        defaultMessage={'AD/LDAP Connector is configured to sync and manage this group and its users. [Click here to view](/admin_console/authentication/ldap)'}
                    />
                </div>
                <div className='group-users--body'>
                    <div className={'group-users-loading ' + (this.state.loading ? 'active' : '')}>
                        <i className='fa fa-spinner fa-pulse fa-2x'/>
                    </div>
                    {this.renderRows()}
                </div>
                {this.renderPagination()}
            </div>
        );
    };
}
