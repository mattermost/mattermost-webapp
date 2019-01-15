// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Constants from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';

import ChannelMembersDropdown from 'components/channel_members_dropdown';
import SearchableUserList from 'components/searchable_user_list/searchable_user_list_container.jsx';

const USERS_PER_PAGE = 50;

export default class MemberListChannel extends React.PureComponent {
    static propTypes = {
        currentTeamId: PropTypes.string.isRequired,
        currentChannelId: PropTypes.string.isRequired,
        searchTerm: PropTypes.string.isRequired,
        usersToDisplay: PropTypes.arrayOf(PropTypes.object).isRequired,
        actionUserProps: PropTypes.object.isRequired,
        totalChannelMembers: PropTypes.number.isRequired,
        channel: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            searchProfiles: PropTypes.func.isRequired,
            getChannelStats: PropTypes.func.isRequired,
            setModalSearchTerm: PropTypes.func.isRequired,
            loadProfilesAndTeamMembersAndChannelMembers: PropTypes.func.isRequired,
            loadStatusesForProfilesList: PropTypes.func.isRequired,
            loadTeamMembersAndChannelMembersForProfilesList: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.searchTimeoutId = 0;

        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        const {
            actions,
            currentChannelId,
            currentTeamId,
        } = this.props;

        actions.loadProfilesAndTeamMembersAndChannelMembers(0, Constants.PROFILE_CHUNK_SIZE, currentTeamId, currentChannelId).then(({data}) => {
            if (data) {
                this.loadComplete();
            }
        });

        actions.getChannelStats(currentChannelId);
    }

    componentWillUnmount() {
        this.props.actions.setModalSearchTerm('');
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.searchTerm !== nextProps.searchTerm) {
            clearTimeout(this.searchTimeoutId);
            const searchTerm = nextProps.searchTerm;

            if (searchTerm === '') {
                this.loadComplete();
                this.searchTimeoutId = '';
                return;
            }

            const searchTimeoutId = setTimeout(
                async () => {
                    const {data} = await this.props.actions.searchProfiles(searchTerm, {team_id: nextProps.currentTeamId, in_channel_id: nextProps.currentChannelId});

                    if (searchTimeoutId !== this.searchTimeoutId) {
                        return;
                    }

                    this.setState({loading: true});

                    nextProps.actions.loadStatusesForProfilesList(data);
                    nextProps.actions.loadTeamMembersAndChannelMembersForProfilesList(data, nextProps.currentTeamId, nextProps.currentChannelId).then(({data: membersLoaded}) => {
                        if (membersLoaded) {
                            this.loadComplete();
                        }
                    });
                },
                Constants.SEARCH_TIMEOUT_MILLISECONDS
            );

            this.searchTimeoutId = searchTimeoutId;
        }
    }

    loadComplete = () => {
        this.setState({loading: false});
    }

    nextPage = (page) => {
        this.props.actions.loadProfilesAndTeamMembersAndChannelMembers(page + 1, USERS_PER_PAGE);
    }

    handleSearch = (term) => {
        this.props.actions.setModalSearchTerm(term);
    }

    render() {
        const channelIsArchived = this.props.channel.delete_at !== 0;
        return (
            <SearchableUserList
                users={this.props.usersToDisplay}
                usersPerPage={USERS_PER_PAGE}
                total={this.props.totalChannelMembers}
                nextPage={this.nextPage}
                search={this.handleSearch}
                actions={channelIsArchived ? [] : [ChannelMembersDropdown]}
                actionUserProps={this.props.actionUserProps}
                focusOnMount={!UserAgent.isMobile()}
            />
        );
    }
}
