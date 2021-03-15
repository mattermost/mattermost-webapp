// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';
import {FormattedMessage, useIntl} from 'react-intl';

import {setCustomStatus, unsetCustomStatus, removeRecentCustomStatus} from 'mattermost-redux/actions/users';
import {setCustomStatusInitialisationState} from 'mattermost-redux/actions/preferences';
import {Preferences} from 'mattermost-redux/constants';
import {UserCustomStatus} from 'mattermost-redux/types/users';
import {Emoji} from 'mattermost-redux/types/emojis';

import GenericModal from 'components/generic_modal';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import {GlobalState} from 'types/store';
import RenderEmoji from 'components/emoji/render_emoji';
import QuickInput from 'components/quick_input';
import {makeGetCustomStatus, getRecentCustomStatuses, showStatusDropdownPulsatingDot} from 'selectors/views/custom_status';
import Constants from 'utils/constants';
import {t} from 'utils/i18n';

import CustomStatusSuggestion from './custom_status_suggestion';

import 'components/category_modal.scss';
import './custom_status.scss';

type Props = {
    onHide: () => void;
};

const EMOJI_PICKER_WIDTH_OFFSET = 308;

type DefaultUserCustomStatus = {
    emoji: string;
    message: string;
    messageDefault: string;
};

const defaultCustomStatusSuggestions: DefaultUserCustomStatus[] = [
    {emoji: 'calendar', message: t('custom_status.suggestions.in_a_meeting'), messageDefault: 'In a meeting'},
    {emoji: 'hamburger', message: t('custom_status.suggestions.out_for_lunch'), messageDefault: 'Out for lunch'},
    {emoji: 'sneezing_face', message: t('custom_status.suggestions.out_sick'), messageDefault: 'Out sick'},
    {emoji: 'house', message: t('custom_status.suggestions.working_from_home'), messageDefault: 'Working from home'},
    {emoji: 'palm_tree', message: t('custom_status.suggestions.on_a_vacation'), messageDefault: 'On a vacation'},
];

const CustomStatusModal: React.FC<Props> = (props: Props) => {
    const getCustomStatus = makeGetCustomStatus();
    const dispatch = useDispatch();
    const currentCustomStatus = useSelector((state: GlobalState) => getCustomStatus(state)) || {};
    const recentCustomStatuses = useSelector((state: GlobalState) => getRecentCustomStatuses(state));
    const customStatusControlRef = useRef<HTMLDivElement>(null);
    const {formatMessage} = useIntl();
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [text, setText] = useState<string>(currentCustomStatus.text || '');
    const [emoji, setEmoji] = useState<string>(currentCustomStatus.emoji);
    const isStatusSet = emoji || text;
    const isCurrentCustomStatusSet = currentCustomStatus.text || currentCustomStatus.emoji;
    const firstTimeModalOpened = useSelector((state: GlobalState) => showStatusDropdownPulsatingDot(state));

    const handleCustomStatusInitializationState = () => {
        if (firstTimeModalOpened) {
            dispatch(setCustomStatusInitialisationState({[Preferences.CUSTOM_STATUS_MODAL_VIEWED]: true}));
        }
    };

    useEffect(handleCustomStatusInitializationState, []);

    const handleSetStatus = () => {
        const customStatus = {
            emoji: emoji || 'speech_balloon',
            text: text.trim(),
        };
        dispatch(setCustomStatus(customStatus));
    };

    const handleClearStatus = isCurrentCustomStatusSet ? () => dispatch(unsetCustomStatus()) : undefined;

    const getCustomStatusControlRef = () => customStatusControlRef.current;

    const handleEmojiClose = () => setShowEmojiPicker(false);

    const handleEmojiClick = (selectedEmoji: Emoji) => {
        setShowEmojiPicker(false);
        const emojiName = ('name' in selectedEmoji) ? selectedEmoji.name : selectedEmoji.aliases[0];
        setEmoji(emojiName);
    };

    const toggleEmojiPicker = () => setShowEmojiPicker((prevShow) => !prevShow);

    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => setText(event.target.value);

    const handleRecentCustomStatusClear = (status: UserCustomStatus) => dispatch(removeRecentCustomStatus(status));

    const customStatusEmoji = emoji || text ?
        (
            <RenderEmoji
                emojiName={emoji || 'speech_balloon'}
                size={20}
            />
        ) : <EmojiIcon className={'icon icon--emoji'}/>;

    const clearHandle = () => {
        setText('');
        setEmoji('');
    };

    const disableSetStatus = (currentCustomStatus.text === text && currentCustomStatus.emoji === emoji) ||
        (text === '' && emoji === '');

    const handleSuggestionClick = (status: UserCustomStatus) => {
        setEmoji(status.emoji);
        setText(status.text);
    };

    const calculateRightOffSet = () => {
        let rightOffset = Constants.DEFAULT_EMOJI_PICKER_RIGHT_OFFSET;
        const target = getCustomStatusControlRef();
        if (target) {
            rightOffset = window.innerWidth - target.getBoundingClientRect().left - EMOJI_PICKER_WIDTH_OFFSET;
            if (rightOffset < 0) {
                rightOffset = Constants.DEFAULT_EMOJI_PICKER_RIGHT_OFFSET;
            }
        }

        return rightOffset;
    };

    const recentStatuses = (
        <div id='statusSuggestion__recents'>
            <div className='statusSuggestion__title'>
                {formatMessage({id: 'custom_status.suggestions.recent_title', defaultMessage: 'RECENT'})}
            </div>
            {
                recentCustomStatuses.map((status: UserCustomStatus) => (
                    <CustomStatusSuggestion
                        key={status.text}
                        handleSuggestionClick={handleSuggestionClick}
                        handleClear={handleRecentCustomStatusClear}
                        emoji={status.emoji}
                        text={status.text}
                    />
                ))
            }
        </div>
    );

    const renderCustomStatusSuggestions = () => {
        const recentCustomStatusTexts = recentCustomStatuses.map((status: UserCustomStatus) => status.text);
        const customStatusSuggestions = defaultCustomStatusSuggestions.
            map((status) => ({
                emoji: status.emoji,
                text: formatMessage({id: status.message, defaultMessage: status.messageDefault}),
            })).
            filter((status: UserCustomStatus) => !recentCustomStatusTexts.includes(status.text)).
            map((status: UserCustomStatus, index: number) => (
                <CustomStatusSuggestion
                    key={index}
                    handleSuggestionClick={handleSuggestionClick}
                    emoji={status.emoji}
                    text={status.text}
                />
            ));

        if (customStatusSuggestions.length <= 0) {
            return null;
        }

        return (
            <>
                <div className='statusSuggestion__title'>
                    {formatMessage({id: 'custom_status.suggestions.title', defaultMessage: 'SUGGESTIONS'})}
                </div>
                {customStatusSuggestions}
            </>
        );
    };

    const suggestion = (
        <div className='statusSuggestion'>
            <div className='statusSuggestion__content'>
                {recentCustomStatuses.length > 0 && recentStatuses}
                <div id='statusSuggestion__suggestions'>
                    {renderCustomStatusSuggestions()}
                </div>
            </div>
        </div>
    );

    return (
        <GenericModal
            enforceFocus={false}
            onHide={props.onHide}
            modalHeaderText={
                <FormattedMessage
                    id='custom_status.set_status'
                    defaultMessage='Set a status'
                />
            }
            confirmButtonText={
                <FormattedMessage
                    id='custom_status.modal_confirm'
                    defaultMessage='Set Status'
                />
            }
            cancelButtonText={
                <FormattedMessage
                    id='custom_status.modal_cancel'
                    defaultMessage='Clear Status'
                />
            }
            isConfirmDisabled={disableSetStatus}
            id='custom_status_modal'
            className={'StatusModal'}
            handleConfirm={handleSetStatus}
            handleCancel={handleClearStatus}
            confirmButtonClassName='btn btn-primary'
        >
            <div className='StatusModal__body'>
                <div className='StatusModal__input'>
                    <div
                        ref={customStatusControlRef}
                        className='StatusModal__emoji-container'
                    >
                        {showEmojiPicker && (
                            <EmojiPickerOverlay
                                target={getCustomStatusControlRef}
                                show={showEmojiPicker}
                                onHide={handleEmojiClose}
                                onEmojiClose={handleEmojiClose}
                                onEmojiClick={handleEmojiClick}
                                rightOffset={calculateRightOffSet()}
                                leftOffset={3}
                                topOffset={3}
                                defaultHorizontalPosition='right'
                            />
                        )}
                        <button
                            type='button'
                            onClick={toggleEmojiPicker}
                            className={classNames('emoji-picker__container', 'StatusModal__emoji-button', {
                                'StatusModal__emoji-button--active': showEmojiPicker,
                            })}
                        >
                            {customStatusEmoji}
                        </button>
                    </div>
                    <QuickInput
                        value={text}
                        maxLength={Constants.CUSTOM_STATUS_TEXT_CHARACTER_LIMIT}
                        clearable={Boolean(isStatusSet)}
                        onClear={clearHandle}
                        className='form-control'
                        clearClassName='StatusModal__clear-container'
                        tooltipPosition='top'
                        onChange={handleTextChange}
                        placeholder={formatMessage({id: 'custom_status.set_status', defaultMessage: 'Set a status'})}
                    />
                </div>
                {!isStatusSet && suggestion}
            </div>
        </GenericModal>
    );
};

export default CustomStatusModal;
