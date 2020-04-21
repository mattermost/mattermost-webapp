// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {FormattedMessage, MessageDescriptor} from 'react-intl';
import classNames from 'classnames';

import {t} from 'utils/i18n';

interface SearchTerm {
    searchTerm: string;
    message: MessageDescriptor;
}

type Props = {
    withTitle?: boolean;
    updateSearchTerms: (term: string) => void;
    onMouseDown?: () => void;
    options: SearchTerm[];
}

export const SearchHint = (props: Props) => {
    const [index, setIndex] = useState(0);

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowDown') {
            const newIndex = index === props.options.length - 1 ? 0 : index + 1;
            setIndex(newIndex);
        }

        if (event.key === 'ArrowUp') {
            const newIndex = index === 0 ? props.options.length - 1 : index - 1;
            setIndex(newIndex);
        }

        if (event.key === 'Enter') {
            props.updateSearchTerms(props.options[index].searchTerm);
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    });

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
                        className={classNames('search-hint__suggestions-list__option', {highlighted: index === optionIndex})}
                        key={option.searchTerm}
                        onClick={() => props.updateSearchTerms(option.searchTerm)}
                        onMouseOver={() => setIndex(optionIndex)}
                    >
                        <div className='search-hint__suggestion-list__flex-wrap'>
                            <span className='search-hint__suggestion-list__label'>{option.searchTerm}</span>
                        </div>
                        <div className='search-hint__suggestion-list__value'>
                            <FormattedMessage
                                id={t(option.message.id)}
                                defaultMessage={option.message.defaultMessage}
                            />
                        </div>
                    </li>))}
            </ul>
        </React.Fragment>
    );
};
