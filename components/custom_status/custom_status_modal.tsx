// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';
import {FormattedMessage, useIntl} from 'react-intl';
import moment from 'moment-timezone';

import {setCustomStatus, unsetCustomStatus, removeRecentCustomStatus} from 'mattermost-redux/actions/users';
import {setCustomStatusInitialisationState} from 'mattermost-redux/actions/preferences';
import {Preferences} from 'mattermost-redux/constants';
import {UserCustomStatus, CustomStatusDuration} from 'mattermost-redux/types/users';
import {Emoji} from 'mattermost-redux/types/emojis';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getUserTimezone} from 'mattermost-redux/selectors/entities/timezone';

import GenericModal from 'components/generic_modal';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import {GlobalState} from 'types/store';
import RenderEmoji from 'components/emoji/render_emoji';
import {getCustomStatus, getRecentCustomStatuses, showStatusDropdownPulsatingDot} from 'selectors/views/custom_status';
import {areTimezonesEnabledAndSupported} from 'selectors/general';
import {Constants} from 'utils/constants';
import {getCurrentDateAndTimeForTimezone} from 'utils/timezone';
import QuickInput, {MaxLengthInput} from 'components/quick_input';
import {t} from 'utils/i18n';

import CustomStatusSuggestion from 'components/custom_status/custom_status_suggestion';
import ExpiryMenu from 'components/custom_status/expiry_menu';
import DateTimeInput, {getRoundedTime} from 'components/custom_status/date_time_input';

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
    const dispatch = useDispatch();
    const currentCustomStatus = useSelector((state: GlobalState) => getCustomStatus(state)) || {};
    const recentCustomStatuses = useSelector((state: GlobalState) => getRecentCustomStatuses(state));
    const customStatusControlRef = useRef<HTMLDivElement>(null);
    const {formatMessage} = useIntl();
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [text, setText] = useState<string>(currentCustomStatus.text || '');
    const [emoji, setEmoji] = useState<string>(currentCustomStatus.emoji || '');
    const [expiry, setExpiry] = useState<CustomStatusDuration>(currentCustomStatus.duration || CustomStatusDuration.FOUR_HOURS);
    const isStatusSet = emoji || text;
    const isCurrentCustomStatusSet = currentCustomStatus.text || currentCustomStatus.emoji;
    const firstTimeModalOpened = useSelector((state: GlobalState) => showStatusDropdownPulsatingDot(state));
    const showDateAndTimeField = isStatusSet && expiry === CustomStatusDuration.DATE_AND_TIME;

    const currentUserId = useSelector(getCurrentUserId);
    const userTimezone = useSelector((state: GlobalState) => getUserTimezone(state, currentUserId));
    const enableTimezone = useSelector(areTimezonesEnabledAndSupported);

    let currentTime = new Date();
    let timezone: string | undefined;
    if (enableTimezone) {
        timezone = userTimezone.manualTimezone;
        if (userTimezone.useAutomaticTimezone) {
            timezone = userTimezone.automaticTimezone;
        }
        currentTime = getCurrentDateAndTimeForTimezone(timezone);
    }

    let initialCustomExpiryTime: Date = getRoundedTime(currentTime);
    if (currentCustomStatus.duration === CustomStatusDuration.DATE_AND_TIME) {
        initialCustomExpiryTime = new Date(currentCustomStatus.expires_at);
    }
    const [customExpiryTime, setCustomExpiryTime] = useState<Date>(initialCustomExpiryTime);

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
            duration: expiry,
            expires_at: calculateExpiryTime(),
        };
        dispatch(setCustomStatus(customStatus));
    };

    const calculateExpiryTime = (): string => {
        switch (expiry) {
        case CustomStatusDuration.DONT_CLEAR:
            return '';
        case CustomStatusDuration.THIRTY_MINUTES:
            return moment().add(30, 'minutes').seconds(0).milliseconds(0).toISOString();
        case CustomStatusDuration.ONE_HOUR:
            return moment().add(1, 'hour').seconds(0).milliseconds(0).toISOString();
        case CustomStatusDuration.FOUR_HOURS:
            return moment().add(4, 'hours').seconds(0).milliseconds(0).toISOString();
        case CustomStatusDuration.TODAY:
            return moment().endOf('day').toISOString();
        case CustomStatusDuration.THIS_WEEK:
            return moment().endOf('week').toISOString();
        case CustomStatusDuration.DATE_AND_TIME:
            return customExpiryTime.toISOString();
        default:
            return '';
        }
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

    const handleExpiryChange = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, expiryValue: CustomStatusDuration) => {
        event.preventDefault();
        setExpiry(expiryValue);
    };

    const customStatusEmoji = emoji || text ?
        (
            <RenderEmoji
                emojiName={emoji || 'speech_balloon'}
                size={20}
            />
        ) : <EmojiIcon className={'icon icon--emoji'}/>;

    const clearHandle = () => {
        setEmoji('');
        setText('');
    };

    let disableSetStatus = (currentCustomStatus.text === text && currentCustomStatus.emoji === emoji) ||
        (text === '' && emoji === '') || (text.length > Constants.CUSTOM_STATUS_TEXT_CHARACTER_LIMIT);

    disableSetStatus = disableSetStatus &&
        ((expiry !== CustomStatusDuration.DATE_AND_TIME && currentCustomStatus.duration === expiry) ||
            (expiry === CustomStatusDuration.DATE_AND_TIME && customExpiryTime.getTime() === new Date(currentCustomStatus.expires_at).getTime()));

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

    const showSuggestions = !isStatusSet || (currentCustomStatus?.emoji === emoji && text && currentCustomStatus?.text === text);

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
                        inputComponent={MaxLengthInput}
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
                {showSuggestions && suggestion}
                {showDateAndTimeField && (
                    <DateTimeInput
                        time={customExpiryTime}
                        handleChange={setCustomExpiryTime}
                        timezone={timezone}
                    />
                )}
                {isStatusSet && (
                    <ExpiryMenu
                        expiry={expiry}
                        handleExpiryChange={handleExpiryChange}
                    />
                )}
            </div>
        </GenericModal >
    );
};

export default CustomStatusModal;
