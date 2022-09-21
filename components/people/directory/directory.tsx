// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import Input from 'components/widgets/inputs/input/input';

import {localizeMessage} from 'utils/utils';

import './directory.scss';

const Directory = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const searchOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    useEffect(() => {
        // Search for a user
    }, [searchTerm]);

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
                            values={{value: 186}}
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
        </>
    );
};

export default Directory;
