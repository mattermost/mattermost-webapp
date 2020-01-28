// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {UserProfile} from 'mattermost-redux/types/users';
import {FormattedMessage} from 'react-intl';

import NextIcon from 'components/widgets/icons/fa_next_icon';
import PreviousIcon from 'components/widgets/icons/fa_previous_icon';

import GroupUsersRow from './group_users_row';

const GROUP_MEMBERS_PAGE_SIZE = 10;

interface AdminGroupUsersProps {
    members: Partial<UserProfile>& {last_picture_update?: number}[];
    total: number;
}

interface AdminGroupUsersState {
    page: number;
}

export default class AdminGroupUsers extends React.PureComponent<AdminGroupUsersProps, AdminGroupUsersState> {
    state: AdminGroupUsersState = {
        page: 0
    }

    previousPage = async () => {
        const page = this.state.page < 1 ? 0 : this.state.page - 1;
        this.setState({page});
    };

    nextPage = async () => {
        const page = (this.state.page + 1) * GROUP_MEMBERS_PAGE_SIZE >= this.props.total ? this.state.page : this.state.page + 1;
        this.setState({page});
    };

    renderRow = (member: Partial<UserProfile> & {last_picture_update?: number}) => (
        <GroupUsersRow
            key={member.id}
            user={member}
            displayName={member.first_name + ' ' + member.last_name}
            lastPictureUpdate={member.last_picture_update || 0}
        />
    );
    renderRows = () => {
        const offset = this.state.page * GROUP_MEMBERS_PAGE_SIZE;
        return this.props.members.slice(offset, offset + GROUP_MEMBERS_PAGE_SIZE).map(this.renderRow);
    };
    renderPagination = () => {
        const {page} = this.state;
        const startCount = (page * GROUP_MEMBERS_PAGE_SIZE) + 1;
        let endCount = (page * GROUP_MEMBERS_PAGE_SIZE) + GROUP_MEMBERS_PAGE_SIZE;
        const total = this.props.total;
        if (endCount > total) {
            endCount = total;
        }
        const lastPage = endCount === total;
        const firstPage = page === 0;
        return (
            <div className='groups-list--footer'>
                <div className='counter'>
                    <FormattedMessage
                        id='admin.team_channel_settings.list.paginatorCount'
                        defaultMessage='{startCount, number} - {endCount, number} of {total, number}'
                        values={{
                            startCount,
                            endCount,
                            total
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
    };
    render = () => {
        return (
            <div className='groups-list groups-list-less-padding'>
                <div className='groups-list--header'>
                    <div className='group-name'>
                        <FormattedMessage
                            id='admin.team_channel_settings.user_list.nameHeader'
                            defaultMessage='Name'
                        />
                    </div>
                    <div className='group-content'>
                        <div className='group-description group-users--header-padded'>
                            <FormattedMessage
                                id='admin.team_channel_settings.user_list.roleHeader'
                                defaultMessage='Role'
                            />
                        </div>
                        <div className='group-description group-users--header-padded'>
                            <FormattedMessage
                                id='admin.team_channel_settings.user_list.groupsHeader'
                                defaultMessage='Groups'
                            />
                        </div>
                    </div>
                </div>
                <div className='groups-list--body'>
                    {this.renderRows()}
                </div>

                {this.renderPagination()}
            </div>
        );
    };
}
