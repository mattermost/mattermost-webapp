// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {
    ChangeEvent,
    FC,
    forwardRef,
    KeyboardEvent,
    memo,
    useCallback,
} from 'react';
import {useDispatch} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import {searchCustomEmojis} from 'mattermost-redux/actions/emojis';

import {t} from 'utils/i18n';

import LocalizedInput from 'components/localized_input/localized_input';

import {EMOJI_PER_ROW} from '../constants';

interface Props {
    filter: string;
    customEmojisEnabled: boolean;
    cursor: [number, number];
    handleFilterChange: (filter: string) => void;
    resetCursorPosition: () => void;
    selectNextEmoji: (offset?: number) => void;
    selectPrevEmoji: (offset?: number) => void;
}

const EmojiPickerSearch: FC<Props> = forwardRef<HTMLInputElement, Props>(({filter, customEmojisEnabled, cursor, handleFilterChange, resetCursorPosition, selectNextEmoji, selectPrevEmoji}: Props, ref) => {
    const dispatch = useDispatch();

    const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        // remove trailing and leading colons
        const value = event.target.value.toLowerCase().replace(/^:|:$/g, '');
        handleFilterChange(value);

        if (customEmojisEnabled && value && value.trim().length) {
            dispatch(searchCustomEmojis(value));
        }

        if (cursor[0] !== -1 || cursor[1] !== -1) {
            resetCursorPosition();
        }
    },
    [dispatch, customEmojisEnabled, handleFilterChange],
    );

    const handleSearchKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
        case 'ArrowRight':
            if ((cursor[0] !== -1 || cursor[1] !== -1) || (event.currentTarget?.selectionStart ?? 0) + 1 > filter.length) {
                event.preventDefault();
                selectNextEmoji();
            }
            break;
        case 'ArrowLeft':
            if (cursor[0] > 0 || cursor[1] > 0) {
                event.preventDefault();
                selectPrevEmoji();
            } else if (cursor[0] === 0 && cursor[1] === 0) {
                resetCursorPosition();
                event.currentTarget.selectionStart = filter.length;
                event.currentTarget.selectionEnd = filter.length;
                event.preventDefault();

                // this.searchInputRef?.current?.focus();
            }
            break;
        case 'ArrowUp':
            event.preventDefault();

            if (event.shiftKey) {
                // If Shift + Ctrl/Cmd + Up is pressed at any time, select/highlight the string to the left of the cursor.
                event.currentTarget.selectionStart = 0;
            } else if (cursor[0] === -1) {
                // If cursor is on the textbox, set the cursor to the beginning of the string.
                event.currentTarget.selectionStart = 0;
                event.currentTarget.selectionEnd = 0;
            } else if (cursor[0] === 0 && cursor[1] < EMOJI_PER_ROW) {
                // If the cursor is highlighting an emoji in the top row, move the cursor back into the text box to the end of the string.
                resetCursorPosition();
                event.currentTarget.selectionStart = filter.length;
                event.currentTarget.selectionEnd = filter.length;

                // this.searchInputRef?.current?.focus();
            } else {
                // Otherwise, move the emoji selector up a row.
                selectPrevEmoji(EMOJI_PER_ROW);
            }
            break;
        case 'ArrowDown':
            event.preventDefault();

            if (event.shiftKey) {
                // If Shift + Ctrl/Cmd + Down is pressed at any time, select/highlight the string to the right of the cursor.
                event.currentTarget.selectionEnd = filter.length;
            } else if (filter && event.currentTarget.selectionStart === 0) {
                // If the cursor is at the beginning of the string, move the cursor to the end of the string.
                event.currentTarget.selectionStart = filter.length;
                event.currentTarget.selectionEnd = filter.length;
            } else {
                // Otherwise, move the selection down in the emoji picker.
                selectNextEmoji(EMOJI_PER_ROW);
            }
            break;
        case 'Enter': {
            event.preventDefault();

            // const clickedEmoji = this.getCurrentEmojiByCursor(this.state.cursor);
            // if (clickedEmoji) {
            //     this.handleEmojiClick(clickedEmoji);
            // }
            break;
        }
        }
    }, [cursor, filter, resetCursorPosition, selectNextEmoji, selectPrevEmoji]);

    return (
        <div className='emoji-picker__text-container'>
            <span className='icon-magnify icon emoji-picker__search-icon'/>
            <FormattedMessage
                id='emoji_picker.search_emoji'
                defaultMessage='Search for an emoji'
            >
                {(ariaLabel) => (
                    <LocalizedInput
                        id='emojiPickerSearch'
                        aria-label={`${ariaLabel}`}
                        ref={ref}
                        className='emoji-picker__search'
                        data-testid='emojiInputSearch'
                        type='text'
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchKeyDown}
                        autoComplete='off'
                        placeholder={{
                            id: t('emoji_picker.search'),
                            defaultMessage: 'Search Emoji',
                        }}
                        value={filter}
                    />
                )}
            </FormattedMessage>
        </div>
    );
},
);

EmojiPickerSearch.displayName = 'EmojiPickerSearch';

export default memo(EmojiPickerSearch);
