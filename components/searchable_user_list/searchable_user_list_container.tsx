// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {UserProfile} from 'mattermost-redux/types/users';
import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import {TeamMembership} from 'mattermost-redux/types/teams';

import SearchableUserList from './searchable_user_list';

type Props = {
    users: UserProfile[] | null;
    usersPerPage: number;
    total: number;
    extraInfo?: {[key: string]: Array<string | JSX.Element>};
    nextPage: (page: number) => void;
    search: (term: string) => void;
    actions?: React.ReactNode[];
    actionProps?: {
        mfaEnabled: boolean;
        enableUserAccessTokens: boolean;
        experimentalEnableAuthenticationTransfer: boolean;
        doPasswordReset: (user: UserProfile) => void;
        doEmailReset: (user: UserProfile) => void;
        doManageTeams: (user: UserProfile) => void;
        doManageRoles: (user: UserProfile) => void;
        doManageTokens: (user: UserProfile) => void;
        isDisabled: boolean | undefined;
    };
    actionUserProps?: {
        [userId: string]: {
            channel?: Channel;
            teamMember: TeamMembership;
            channelMember?: ChannelMembership;
        };
    };
    focusOnMount?: boolean;
}

type State = {
    term: string;
    page: number;
};

export default class SearchableUserListContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            term: '',
            page: 0,
        };
    }

    handleTermChange = (term: string) => {
        this.setState({term});
    }

    nextPage = () => {
        this.setState({page: this.state.page + 1});

        this.props.nextPage(this.state.page + 1);
    }

    previousPage = () => {
        this.setState({page: this.state.page - 1});
    }

    search = (term: string) => {
        this.props.search(term);

        if (term !== '') {
            this.setState({page: 0});
        }
    }

    render() {
        return (
            <SearchableUserList
                {...this.props}
                nextPage={this.nextPage}
                previousPage={this.previousPage}
                search={this.search}
                page={this.state.page}
                term={this.state.term}
                onTermChange={this.handleTermChange}
            />
        );
    }
}
