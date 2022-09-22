// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {FormattedMessage} from 'react-intl';

import {getProfiles as fetchProfiles} from 'mattermost-redux/actions/users';
import {getProfiles} from 'mattermost-redux/selectors/entities/users';

import classNames from 'classnames';

import {localizeMessage} from 'utils/utils';

import Input from 'components/widgets/inputs/input/input';

import PeopleList from './people_list';

import './directory.scss';

const Directory = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useDispatch();

    const [page, setPage] = useState(0);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);

    const people = useSelector(getProfiles);

    const searchOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    useEffect(() => {
        // Search for a user 
    }, [searchTerm]);

    useEffect(() => {
        setPage(0);
        setIsNextPageLoading(false);
        dispatch(fetchProfiles(0, 15));
    }, []);

    const loadMore = async () => {
        setIsNextPageLoading(true);

        await dispatch(fetchProfiles(page + 1, 15));
        setPage(page + 1);

        setIsNextPageLoading(false);
    };

    return (
        <>
            <header
                className={classNames('header directory-header')}
            >
                <div className='top'>
                    <span className='people-title'>
                        <FormattedMessage
                            defaultMessage={'{value} people'}
                            id={'directory.people.count'}
                            values={{value: 62}}
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
                </div>
            </header>
            <PeopleList 
                people={people}
                hasNextPage={people.length < 62}
                isNextPageLoading={isNextPageLoading}
                searchTerms={''}
                loadMore={loadMore}
            />
        </>
    );
};

export default Directory;
