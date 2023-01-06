// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, KeyboardEvent, useEffect, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import styled, {css} from 'styled-components';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';
import {MagnifyIcon} from '@mattermost/compass-icons/components';

import NoResultsIndicator from 'components/no_results_indicator';
import {NoResultsVariant} from 'components/no_results_indicator/types';

import {KAOMOJI, KaomojiDefinition} from '../constants/kaomoji';

const KaomojiSearchInputWrapper = styled.div`
    display: flex;
    align-items: center;
    background: var(--center-channel-bg);
    border-radius: 4px;
    font-size: 13px;
    margin: 12px;
    border: none;
    padding: 4px;
    box-shadow: inset 0 0 0 1px rgba(var(--center-channel-text-rgb), 0.52);
    transition: box-shadow 300ms ease-in-out;

    &:focus-within {
        box-shadow: inset 0 0 0 2px var(--button-bg);
    }
`;

const KaomojiSearchInput = styled.input`
    width: 100%;
    height: 26px;
    border-width: 0;
    background: var(--center-channel-bg);
    border-radius: inherit;
    font-size: 13px;
`;

const KaomojiResults = styled.div`
    display: flex;
    flex-direction: column;
    height: 392px;
    padding: 0 0 12px 0;
    width: 100%;
    overflow: auto;
`;

const KaomojiResultsItem = styled.div(({selected}: {selected: boolean}) => css`
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid rgba(var(--center-channel-text-rgb), 0.12);
    background-color: rgba(var(--center-channel-text-rgb), ${selected ? 0.08 : 0});

    &:hover {
        background-color: rgba(var(--center-channel-text-rgb), 0.08);
    }
`);

const KaomojiResultsText = styled.div`
    flex: 1;
    font-size: 14px;
    padding: 8px 12px;
    color: rgb(var(--center-channel-text-rgb));
`;

const KaomojiResultsTags = styled.span`
    flex: 1;
    font-size: 10px;
    padding: 4px 12px;
    background-color: rgba(var(--center-channel-text-rgb), 0.08);
    color: rgba(var(--center-channel-text-rgb), 0.52);
`;

type Props = {
    onEnter: (kaomoji: string) => void;
}

const KaomojiPicker = ({onEnter}: Props) => {
    const {formatMessage} = useIntl();
    const [filter, setFilter] = useState('');
    const [filteredList, setFilteredList] = useState<KaomojiDefinition[]>(KAOMOJI);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFilter(e.target.value);
        setFilteredList(KAOMOJI.filter((kaomoji) => kaomoji.tags.some((tag) => tag.includes(e.target.value))));
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
        case 'ArrowUp':
            event.stopPropagation();
            event.preventDefault();

            if (event.shiftKey) {
                // If Shift + Ctrl/Cmd + Up is pressed at any time, select/highlight the string to the left of the cursor.
                event.currentTarget.selectionStart = 0;
            } else {
                // Otherwise, move the kaomoji selector up a row.
                setSelectedIndex(selectedIndex === 0 ? filteredList.length : selectedIndex - 1);
            }
            break;
        case 'ArrowDown':
            event.stopPropagation();
            event.preventDefault();

            if (event.shiftKey) {
                // If Shift + Ctrl/Cmd + Down is pressed at any time, select/highlight the string to the right of the cursor.
                event.currentTarget.selectionEnd = filter.length;
            } else if (filter && event.currentTarget.selectionStart === 0) {
                // If the cursor is at the beginning of the string, move the cursor to the end of the string.
                event.currentTarget.selectionStart = filter.length;
                event.currentTarget.selectionEnd = filter.length;
            } else {
                // Otherwise, move the selection down in the kaomoji picker.
                setSelectedIndex(selectedIndex === filteredList.length ? 0 : selectedIndex + 1);
            }
            break;
        case 'Enter':
            event.stopPropagation();
            event.preventDefault();

            if (filteredList.length) {
                onEnter(filteredList[selectedIndex].string);
            }
            break;
        }
    };

    const KaomojiItem = ({selected, kaomoji}: {selected: boolean; kaomoji: KaomojiDefinition}) => {
        const itemRef = useRef<HTMLDivElement>(null);
        useEffect(() => {
            if (selected) {
                scrollIntoView(itemRef.current!, {
                    behavior: 'smooth',
                    scrollMode: 'if-needed',
                    block: 'center',
                });
            }
        }, [selected]);

        return (
            <KaomojiResultsItem
                ref={itemRef}
                key={`kaomoji_${kaomoji.string}`}
                onClick={() => onEnter(kaomoji.string)}
                selected={selected}
            >
                <KaomojiResultsText>{kaomoji.string}</KaomojiResultsText>
                <KaomojiResultsTags>{kaomoji.tags.map((tag) => `#${tag}`).join(', ')}</KaomojiResultsTags>
            </KaomojiResultsItem>
        );
    };

    return (
        <div
            className='kaomoji-picker__inner'
            role='application'
        >
            <KaomojiSearchInputWrapper>
                <MagnifyIcon color={'rgba(var(--center-channel-text-rgb), 0.52)'}/>
                <KaomojiSearchInput
                    ref={inputRef}
                    id='emojiPickerSearch'
                    aria-label={formatMessage({id: 'emoji_picker.search_emoji', defaultMessage: 'Search for an emoji'})}
                    className='emoji-picker__search'
                    data-testid='emojiInputSearch'
                    type='text'
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    autoComplete='off'
                    placeholder={formatMessage({id: 'emoji_picker.search', defaultMessage: 'Search Emoji'})}
                    value={filter}
                />
            </KaomojiSearchInputWrapper>
            <div>
                {filteredList.length === 0 ? (
                    <NoResultsIndicator
                        variant={NoResultsVariant.ChannelSearch}
                        titleValues={{channelName: `"${filter}"`}}
                    />
                ) : (
                    <KaomojiResults>
                        {filteredList.map((kaomoji, index) => (
                            <KaomojiItem
                                key={`kaomoji_${kaomoji.string}`} // eslint-disable-line react/prop-types
                                kaomoji={kaomoji}
                                selected={index === selectedIndex}
                            />
                        ))}
                    </KaomojiResults>
                )}
            </div>
        </div>
    );
};

export default KaomojiPicker;
