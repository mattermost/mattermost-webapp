// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';
import {setCustomStatus, unsetCustomStatus, removeRecentCustomStatus} from 'mattermost-redux/actions/users';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {Tooltip} from 'react-bootstrap';

import {UserCustomStatus} from 'mattermost-redux/types/users';

import GenericModal from 'components/generic_modal';
import 'components/category_modal.scss';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import './custom_status.scss';
import {GlobalState} from 'types/store';
import OverlayTrigger from 'components/overlay_trigger';
import Constants from 'utils/constants';
import RenderEmoji from 'components/emoji/render_emoji';

import {showStatusDropdownPulsatingDot} from 'utils/custom_status';
import {setCustomStatusInitialisationState} from 'actions/views/custom_status';

import CustomStatusSuggestion from './custom_status_suggestion';

type Props = {
    onHide: () => void;
};

const EMOJI_PICKER_WIDTH_OFFSET = 308;
const defaultCustomStatusSuggestions: UserCustomStatus[] = [
    {emoji: 'calendar', text: 'In a meeting'},
    {emoji: 'hamburger', text: 'Out for lunch'},
    {emoji: 'sneezing_face', text: 'Out Sick'},
    {emoji: 'house', text: 'Working from home'},
    {emoji: 'palm_tree', text: 'On a vacation'},
];

const CustomStatusModal: React.FC<Props> = (props: Props) => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state: GlobalState) => getCurrentUser(state));
    const userProps = currentUser.props || {};
    const currentCustomStatus = userProps.customStatus ? JSON.parse(userProps.customStatus) : {emoji: '', text: ''};
    const recentCustomStatuses = userProps.recentCustomStatuses ? JSON.parse(userProps.recentCustomStatuses) : [];
    const customStatusControlRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [text, setText] = useState<string>(currentCustomStatus.text);
    const [emoji, setEmoji] = useState<string>(currentCustomStatus.emoji);
    const isStatusSet = emoji || text;
    const firstTimeModalOpened = useSelector((state: GlobalState) => showStatusDropdownPulsatingDot(state));

    const handleCustomStatusInitializationState = () => {
        if (firstTimeModalOpened) {
            dispatch(setCustomStatusInitialisationState({hasOpenedSetCustomStatusModal: true}));
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

    const handleClearStatus = () => {
        dispatch(unsetCustomStatus());
    };

    const getCustomStatusControlRef = () => {
        return customStatusControlRef.current;
    };

    const handleEmojiClose = () => {
        setShowEmojiPicker(false);
    };

    const handleEmojiClick = (selectedEmoji: any) => {
        setShowEmojiPicker(false);
        const emojiName = selectedEmoji.name || selectedEmoji.aliases[0];
        setEmoji(emojiName);
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleTextChange = (event: any) => {
        const inputText = event.target.value;
        if (inputText.length <= Constants.CUSTOM_STATUS_TEXT_CHARACTER_LIMIT) {
            setText(inputText);
        }
    };

    const handleRecentCustomStatusClear = (status: any) => {
        dispatch(removeRecentCustomStatus(status));
    };

    let customStatusEmoji = <EmojiIcon className={'icon icon--emoji'}/>;
    if (emoji || text) {
        customStatusEmoji = (
            <RenderEmoji
                emoji={emoji || 'speech_balloon'}
                size={20}
            />
        );
    }

    const clearHandle = () => {
        setText('');
        setEmoji('');
    };

    const clearButton = isStatusSet ?
        (
            <div
                className='StatusModal__clear-container'
            >
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='top'
                    overlay={
                        <Tooltip id='clear-custom-status'>
                            {'Clear'}
                        </Tooltip>
                    }
                >
                    <span
                        className='input-clear-x'
                        onClick={clearHandle}
                    >
                        <i className='icon icon-close-circle'/>
                    </span>
                </OverlayTrigger>
            </div>
        ) : null;

    const disableSetStatus = (currentCustomStatus.text === text && currentCustomStatus.emoji === emoji) ||
        (text === '' && emoji === '');

    const handleSuggestionClick = (status: any) => {
        setEmoji(status.emoji);
        setText(status.text);
    };

    const calculateRightOffSet = () => {
        let rightOffset = Constants.DEFAULT_EMOJI_PICKER_RIGHT_OFFSET;
        const target = getCustomStatusControlRef();
        if (target) {
            const anyTarget: any = target;
            rightOffset = window.innerWidth - anyTarget.getBoundingClientRect().left - EMOJI_PICKER_WIDTH_OFFSET;
            if (rightOffset < 0) {
                rightOffset = Constants.DEFAULT_EMOJI_PICKER_RIGHT_OFFSET;
            }
        }

        return rightOffset;
    };

    const recentStatuses = (
        <div>
            <div className='statusSuggestion__title'>
                {'RECENT'}
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
            filter((status: UserCustomStatus) => !recentCustomStatusTexts.includes(status.text)).
            map((status: UserCustomStatus, index: number) => (
                <CustomStatusSuggestion
                    key={index}
                    handleSuggestionClick={handleSuggestionClick}
                    emoji={status.emoji}
                    text={status.text}
                />
            ));

        if (customStatusSuggestions.length > 0) {
            return (
                <>
                    <div className='statusSuggestion__title'>
                        {'SUGGESTIONS'}
                    </div>
                    {customStatusSuggestions}
                </>
            );
        }

        return null;
    };

    const suggestion = (
        <div className='statusSuggestion'>
            <div className='statusSuggestion__content'>
                {recentCustomStatuses.length > 0 && recentStatuses}
                <div>
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
                    id='custom_status_modal_header'
                    defaultMessage='Set a status'
                />
            }
            confirmButtonText={
                <FormattedMessage
                    id='custom_status_modal_confirm'
                    defaultMessage='Set Status'
                />
            }
            cancelButtonText={
                <FormattedMessage
                    id='custom_status_modal_cancel'
                    defaultMessage='Clear Status'
                />
            }
            isConfirmDisabled={disableSetStatus}
            id='custom_status_modal'
            className={'StatusModal'}
            handleConfirm={handleSetStatus}
            handleCancel={(currentCustomStatus.text || currentCustomStatus.emoji) ?
                handleClearStatus : undefined
            }
        >
            <div className='StatusModal__body'>
                <div className='StatusModal__input'>
                    <div
                        ref={customStatusControlRef}
                        className='StatusModal__emoji-container'
                    >
                        {showEmojiPicker &&
                            <EmojiPickerOverlay
                                target={getCustomStatusControlRef}
                                show={showEmojiPicker}
                                onHide={handleEmojiClose}
                                onEmojiClose={handleEmojiClose}
                                onEmojiClick={handleEmojiClick}
                                rightOffset={calculateRightOffSet()}
                            />
                        }
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
                    <input
                        className='form-control'
                        placeholder='Set a status'
                        type='text'
                        value={text}
                        onChange={handleTextChange}
                    />
                    {clearButton}
                </div>
                {!isStatusSet && suggestion}
            </div>
        </GenericModal>
    );
};

export default CustomStatusModal;
