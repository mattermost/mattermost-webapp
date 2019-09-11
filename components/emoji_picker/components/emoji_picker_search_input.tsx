import React, {forwardRef} from "react";
import {FormattedMessage} from "react-intl";

import {t} from "utils/i18n";
import LocalizedInput from "components/localized_input/localized_input";

interface EmojiPickerSearchInputProps {
    onChange: (...args: any[]) => any,
    onKeyDown: (...args: any[]) => any,
}

const EmojiPickerSearchInput = forwardRef<HTMLInputElement, EmojiPickerSearchInputProps>(({
    onChange,
    onKeyDown,
}, forwardedRef) => (
    <div className='emoji-picker__search-container'>
        <span className='fa fa-search emoji-picker__search-icon'/>
        <FormattedMessage
            id='emoji_picker.search_emoji'
            defaultMessage='Search for an emoji'
        >
            {(ariaLabel) => (
                // @ts-ignore
                <LocalizedInput
                    id='emojiPickerSearch'
                    aria-label={ariaLabel}
                    ref={forwardedRef}
                    className='emoji-picker__search'
                    data-testid='emojiInputSearch'
                    type='text'
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    placeholder={{id: t('emoji_picker.search'), defaultMessage: 'Search Emoji'}}
                />
            )}
        </FormattedMessage>
    </div>
));

export default EmojiPickerSearchInput;
