// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import {debounce} from 'mattermost-redux/actions/helpers';
import {getProfiles as fetchProfiles, searchProfiles} from 'mattermost-redux/actions/users';
import {getProfiles} from 'mattermost-redux/selectors/entities/users';
import {ActionResult} from 'mattermost-redux/types/actions';

import {Constants} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import Input from 'components/widgets/inputs/input/input';

import PeopleList from './people_list';

import './directory.scss';
import TeamFilterDropdown from 'components/admin_console/filter/team_filter_dropdown';
import { FilterValues } from 'components/admin_console/filter/filter';

const Directory = () => {
    const dispatch = useDispatch();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchPeople, setSearchPeople] = useState([]);

    const [filterValues, setFilterValues] = useState<FilterValues>({
        team_ids: {
            name: (
                <FormattedMessage
                    id='admin.team_settings.title'
                    defaultMessage='Teams'
                />
            ),
            value: [], // Use a state variable for values here
        },
    });

    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);

    const people = useSelector(getProfiles);

    const searchOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    useEffect(() => {
        doSearch(searchTerm);
    }, [searchTerm]);

    const initialLoad = useCallback(async () => {
        setPage(0);
        setIsNextPageLoading(false);
        const {data: response} = await dispatch(fetchProfiles(0, 60, {include_total_count: true, exclude_bots: true})) as ActionResult;

        if (response.total_count) {
            setTotalCount(response.total_count);
        }
    }, []);

    useEffect(() => {
        initialLoad();
    }, [initialLoad]);

    const loadMore = async () => {
        setIsNextPageLoading(true);

        await dispatch(fetchProfiles(page + 1, 60));
        setPage(page + 1);

        setIsNextPageLoading(false);
    };

    const doSearch = debounce(async (term) => {
        if (!term) {
            return;
        }

        setIsNextPageLoading(true);

        const options = {
            allow_inactive: false,
        };

        const {data: profiles} = await dispatch(searchProfiles(term, options)) as ActionResult;

        setSearchPeople(profiles);
        setIsNextPageLoading(false);
    }, Constants.SEARCH_TIMEOUT_MILLISECONDS, false, () => {});

    const updateValues = async (values: FilterValues, optionKey: string) => {
        const options = {
            ...values,
        };
        setFilterValues(options);
    }

    return (
        <div className='people-directory'>
            <header className={classNames('header directory-header')}>
                <div className='top'>
                    <span className='people-title'>
                        <FormattedMessage
                            defaultMessage={'{value} people'}
                            id={'directory.people.count'}
                            values={{value: (searchTerm ? searchPeople.length : totalCount)}}
                        />
                    </span>
                </div>
                <div className='bottom'>
                    <Input
                        type='text'
                        placeholder={localizeMessage('directory.people.search', 'Search for a person')}
                        onChange={searchOnChange}
                        value={searchTerm}
                        data-testid='searchInput'
                        className={'people-search-input'}
                        inputPrefix={<i className={'icon icon-magnify'}/>}
                    />
                    <TeamFilterDropdown
                        option={{
                            name: '',
                            values: {
                                ...filterValues,
                            },
                            keys: ['teams'],
                        }}
                        optionKey='team'
                        updateValues={updateValues}
                    />
                </div>
            </header>
            <PeopleList
                people={searchTerm ? searchPeople : people}
                hasNextPage={people.length < totalCount}
                isNextPageLoading={isNextPageLoading}
                searchTerms={searchTerm}
                loadMore={loadMore}
            />
        </div>
    );
};

export default Directory;
