// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Constants from 'utils/constants';
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
        this.state = {
            loading: true,
            searchTerm: props.searchTerm,
            searchTimeoutId: 0,
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

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.searchTerm !== prevState.searchTerm) {
            return {searchTerm: nextProps.searchTerm}
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.searchTerm !== this.props.searchTerm) {
            clearTimeout(this.state.searchTimeoutId);
            const searchTerm = this.props.searchTerm;

            if (searchTerm === '') {
                this.loadComplete();
                this.setState({searchTimeoutId: null});
                return;
            }

            const searchTimeoutId = setTimeout(
                async () => {
                    const {data} = await prevProps.actions.searchProfiles(searchTerm, {team_id: this.props.currentTeamId, in_channel_id: this.props.currentChannelId});

                    if (searchTimeoutId !== this.state.searchTimeoutId) {
                        return;
                    }

                    this.setState({loading: true});

                    this.props.actions.loadStatusesForProfilesList(data);
                    this.props.actions.loadTeamMembersAndChannelMembersForProfilesList(data, this.props.currentTeamId, this.props.currentChannelId).then(({data: membersLoaded}) => {
                        if (membersLoaded) {
                            this.loadComplete();
                        }
                    });
                },
                Constants.SEARCH_TIMEOUT_MILLISECONDS
            );

            this.setState({searchTimeoutId});
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
