// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, MessageDescriptor} from 'react-intl';
import classNames from 'classnames';

interface SearchTerm {
    searchTerm: string;
    message: MessageDescriptor;
    additionalDisplay?: string;
}

type Props = {
    withTitle?: boolean;
    onOptionSelected: (term: string) => void;
    onMouseDown?: () => void | undefined;
    options: SearchTerm[];
    highlightedIndex?: number;
    onOptionHover?: (index: number) => void;
}

const SearchHint = (props: Props) => {
    const handleOnOptionHover = (optionIndex: number) => {
        if (props.onOptionHover) {
            props.onOptionHover(optionIndex);
        }
    };

    return (
        <React.Fragment>
            {props.withTitle &&
                <h4 className='search-hint__title'>
                    <FormattedMessage
                        id='search_bar.usage.title'
                        defaultMessage='Search Options'
                    />
                </h4>
            }
            <ul
                role='list'
                className='search-hint__suggestions-list'
                onMouseDown={props.onMouseDown}
            >
                {props.options.map((option, optionIndex) => (
                    <li
                        className={classNames('search-hint__suggestions-list__option', {highlighted: optionIndex === props.highlightedIndex})}
                        key={option.searchTerm}
                        onMouseDown={() => props.onOptionSelected(option.searchTerm)}
                        onMouseOver={() => handleOnOptionHover(optionIndex)}
                    >
                        <div className='search-hint__suggestion-list__flex-wrap'>
                            <span className='search-hint__suggestion-list__label'>{option.additionalDisplay ? option.additionalDisplay : option.searchTerm}</span>
                        </div>
                        <div className='search-hint__suggestion-list__value'>
                            <FormattedMessage
                                id={option.message.id}
                                defaultMessage={option.message.defaultMessage}
                            />
                        </div>
                    </li>))}
            </ul>
        </React.Fragment>
    );
};

export default SearchHint;
