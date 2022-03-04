// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import classNames from 'classnames';

import React, {useCallback, useState} from 'react';

import {useSelector} from 'react-redux';

import {useIntl} from 'react-intl';

import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay';

import EmojiIcon from 'components/widgets/icons/emoji_icon';

import {Emoji} from 'mattermost-redux/types/emojis';
import {splitMessageBasedOnCaretPosition} from 'utils/post_utils';

import {GlobalState} from 'types/store';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

type Props = {
    message: string;
    caretPosition: number;
    setMessageAndCaretPosition: (message: string, caretPosition: number) => void;
    getCreateControls: () => HTMLSpanElement | null;
    focusTextbox: () => void;
};

const EmojiControl = ({
    message,
    caretPosition,
    setMessageAndCaretPosition,
    getCreateControls,
    focusTextbox,
}: Props) => {
    const intl = useIntl();
    const enableGifPicker = useSelector<GlobalState, boolean>((state) => getConfig(state).EnableGifPicker === 'true');
    const emojiButtonAriaLabel = intl.formatMessage({id: 'emoji_picker.emojiPicker', defaultMessage: 'Emoji Picker'}).toLowerCase();

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const toggleEmojiPicker = useCallback(() => {
        setShowEmojiPicker(!showEmojiPicker);
    }, [showEmojiPicker]);

    const handleEmojiClose = useCallback(() => {
        setShowEmojiPicker(false);
    }, []);

    const handleEmojiClick = useCallback((emoji: Emoji) => {
        const emojiAlias = ('short_names' in emoji && emoji.short_names && emoji.short_names[0]) || emoji.name;

        if (!emojiAlias) {
            //Oops.. There went something wrong
            return;
        }

        if (message === '') {
            const newMessage = ':' + emojiAlias + ': ';
            setMessageAndCaretPosition(newMessage, newMessage.length);
        } else {
            const {firstPiece, lastPiece} = splitMessageBasedOnCaretPosition(caretPosition, message);

            // check whether the first piece of the message is empty when cursor is placed at beginning of message and avoid adding an empty string at the beginning of the message
            const newMessage = firstPiece === '' ? `:${emojiAlias}: ${lastPiece}` : `${firstPiece} :${emojiAlias}: ${lastPiece}`;

            const newCaretPosition = firstPiece === '' ? `:${emojiAlias}: `.length : `${firstPiece} :${emojiAlias}: `.length;
            setMessageAndCaretPosition(newMessage, newCaretPosition);
        }

        handleEmojiClose();
        focusTextbox();
    }, [message, caretPosition, setMessageAndCaretPosition, handleEmojiClose, focusTextbox]);

    const handleGifClick = useCallback((gif: string) => {
        if (message === '') {
            setMessageAndCaretPosition(gif, gif.length);
        } else {
            const newMessage = ((/\s+$/).test(message)) ? message + gif : message + ' ' + gif;
            setMessageAndCaretPosition(newMessage, newMessage.length);
        }
        handleEmojiClose();
        focusTextbox();
    }, [message, setMessageAndCaretPosition, handleEmojiClose, focusTextbox]);

    return (
        <div>
            <EmojiPickerOverlay
                show={showEmojiPicker}
                target={getCreateControls}
                onHide={handleEmojiClose}
                onEmojiClose={handleEmojiClose}
                onEmojiClick={handleEmojiClick}
                onGifClick={handleGifClick}
                enableGifPicker={enableGifPicker}
                topOffset={-7}
            />
            <button
                type='button'
                aria-label={emojiButtonAriaLabel}
                onClick={toggleEmojiPicker}
                className={classNames('emoji-picker__container', 'post-action', {
                    'post-action--active': showEmojiPicker,
                })}
            >
                <EmojiIcon
                    id='emojiPickerButton'
                    className={'icon icon--emoji '}
                />
            </button>
        </div>
    );
};

export default EmojiControl;
