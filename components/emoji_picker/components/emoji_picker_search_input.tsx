import React, {forwardRef, ChangeEventHandler, KeyboardEventHandler} from "react";
import {FormattedMessage} from "react-intl";

import {t} from "utils/i18n";
import LocalizedInput from "components/localized_input/localized_input";

interface EmojiPickerSearchInputProps {
    onChange: ChangeEventHandler<HTMLInputElement>;
    onKeyDown: KeyboardEventHandler<HTMLInputElement>;
}

const placeholder = {id: t('emoji_picker.search'), defaultMessage: 'Search Emoji'};

const EmojiPickerSearchInput: React.RefForwardingComponent<HTMLInputElement, EmojiPickerSearchInputProps> = ({
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
                    placeholder={placeholder}
                />
            )}
        </FormattedMessage>
    </div>
);

export default forwardRef(EmojiPickerSearchInput);
