// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import {debounce} from 'mattermost-redux/actions/helpers';
import {getGroups, searchGroups} from 'mattermost-redux/actions/groups';
import {getAllAssociatedGroupsForReference, getGroup as getGroupById} from 'mattermost-redux/selectors/entities/groups';
import {ActionResult} from 'mattermost-redux/types/actions';

import Input from 'components/widgets/inputs/input/input';

import Constants from 'utils/constants';

import {localizeMessage} from 'utils/utils';
import PeopleList from '../directory/people_list';
import {Group} from '@mattermost/types/groups';
import {GlobalState} from '@mattermost/types/store';
import {getProfilesInGroup as getUsersInGroup} from 'mattermost-redux/actions/users';
import {getProfilesInGroup} from 'mattermost-redux/selectors/entities/users';

import GroupList from './group_list';

const Groups = () => {
    const dispatch = useDispatch();

    // Groups
    const [page, setPage] = useState(0);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);

    // Group Members
    const [membersPage, setMembersPage] = useState(0);
    const [isNextMembersPageLoading, setIsNextMembersPageLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [groupSearchResults, setSearchGroups] = useState([]);
    const [selectedGroupID, setSelectedGroupID] = useState('');

    const groups = useSelector(getAllAssociatedGroupsForReference);
    const groupMembers = useSelector((state: GlobalState) => getProfilesInGroup(state, selectedGroupID));
    const selectedGroup = useSelector((state: GlobalState) => getGroupById(state, selectedGroupID));

    const searchOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    useEffect(() => {
        doSearch(searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        setPage(0);
        setIsNextPageLoading(false);
        dispatch(getGroups(false, 0, 60, true));
    }, []);

    useEffect(() => {
        setMembersPage(0);
        setIsNextMembersPageLoading(false);
        if (selectedGroupID) {
            dispatch(getUsersInGroup(selectedGroupID, 0, 60));
        }
    }, [selectedGroupID]);

    const loadMore = async () => {
        setIsNextPageLoading(true);

        await dispatch(getGroups(false, page + 1, 60, true));
        setPage(page + 1);

        setIsNextPageLoading(false);
    };

    const loadMoreMembers = async () => {
        setIsNextMembersPageLoading(true);

        await dispatch(getUsersInGroup(selectedGroupID, membersPage + 1, 60));
        setMembersPage(membersPage + 1);

        setIsNextMembersPageLoading(false);
    };

    const doSearch = debounce(async (term) => {
        if (!term) {
            return;
        }

        setIsNextPageLoading(true);

        const options = {
            q: term,
            filter_allow_reference: false,
            page: 0,
            per_page: 60,
            include_member_count: true,
        };

        const {data: profiles} = await dispatch(searchGroups(options)) as ActionResult;

        setSearchGroups(profiles);
        setIsNextPageLoading(false);
    }, Constants.SEARCH_TIMEOUT_MILLISECONDS, false, () => {});

    const onClick = (group: Group) => {
        setSelectedGroupID(group.id);
    };

    return (
        <div className='people-directory'>
            <header className={classNames('header directory-header groups-header')}>
                <div className='top'>
                    <span className='people-title'>
                        <FormattedMessage
                            defaultMessage={'{value} user groups'}
                            id={'directory.groups.count'}
                            values={{value: 100}}
                        />
                    </span>
                </div>
            </header>
            <div className='directory-content'>
                <div className='group-directory-list'>
                    <Input
                        type='text'
                        placeholder={localizeMessage('directory.group.search', 'Search for a group')}
                        onChange={searchOnChange}
                        value={searchTerm}
                        data-testid='searchInput'
                        className={'people-search-input'}
                        inputPrefix={<i className={'icon icon-magnify'}/>}
                        height={32}
                    />
                    <GroupList
                        groups={searchTerm ? groupSearchResults : groups}
                        hasNextPage={groups.length < 2800}
                        isNextPageLoading={isNextPageLoading}
                        searchTerms={searchTerm}
                        loadMore={loadMore}
                        onClick={onClick}
                        selectedGroupID={selectedGroupID}
                    />
                </div>
                <div className='group-members-list'>
                    {
                        selectedGroup &&
                        <div className='group-members-list-header'>
                            <span className='group-display-name'>{selectedGroup.display_name}</span>
                            <span className='group-member-count'>
                                <FormattedMessage
                                    id='user_groups_modal.memberCount'
                                    defaultMessage='{member_count} {member_count, plural, one {member} other {members}}'
                                    values={{
                                        member_count: selectedGroup.member_count,
                                    }}
                                />
                            </span>
                        </div>
                    }
                    <PeopleList
                        people={groupMembers}
                        hasNextPage={groupMembers.length < 102}
                        isNextPageLoading={isNextMembersPageLoading}
                        searchTerms={''}
                        loadMore={loadMoreMembers}
                    />
                </div>
            </div>

        </div>
    );
};

export default Groups;
