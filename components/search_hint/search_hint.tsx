// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, MessageDescriptor} from 'react-intl';

type Props = {
    withTitle?: boolean;
    updateSearchTerms: (term: string) => void;
    onMouseDown: () => void;
}

interface SearchOption {
    searchTerm: string;
    message: MessageDescriptor;
}

const options = [{searchTerm: 'From', message: {id: 'search_list_option.from', defaultMessage: 'Messages from a user'}},
    {searchTerm: 'In', message: {id: 'search_list_option.in', defaultMessage: 'Messages in a channel'}},
    {searchTerm: 'On', message: {id: 'search_list_option.on', defaultMessage: 'Messages on a date'}},
    {searchTerm: 'Before', message: {id: 'search_list_option.before', defaultMessage: 'Messages before a date'}},
    {searchTerm: 'After', message: {id: 'search_list_option.after', defaultMessage: 'Messages after a date'}},
    {searchTerm: '-', message: {id: 'search_list_option.exclude', defaultMessage: 'Exclude search terms'}},
    {searchTerm: '"', message: {id: 'search_list_option.phrases', defaultMessage: 'Messages with phrases'}},
];

export const SearchHint = (props: Props) => {
    return (
        <React.Fragment>
            {props.withTitle &&
                <h4>
                    <FormattedMessage
                        id='search_bar.usage.title'
                        defaultMessage='Search Options'
                    />
                </h4>
            }
            <ul
                role='list'
                className='suggestions-list'
                onMouseDown={props.onMouseDown}
            >
                {options.map((option) => (
                    <li
                        className='option'
                        key={option.searchTerm}
                        onClick={() => props.updateSearchTerms(`${option.searchTerm}:`)}
                    >
                        <FormattedMessage
                            id={option.message.id}
                            defaultMessage={option.message.defaultMessage}
                        />
                    </li>))}
            </ul>
        </React.Fragment>
    );
};
