// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {updateUserCustomStatus} from 'actions/views/user';
import GenericModal from 'components/generic_modal';
import 'components/category_modal.scss';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import './custom_status.scss';
import {GlobalState} from 'types/store';
import messageHtmlToComponent from '../../utils/message_html_to_component';
import {renderEmoji} from '../../utils/emoticons';

type Props = {
    onHide: () => void;
};

const CustomStatusModal: React.FC<Props> = (props: Props) => {
    const currentUser = useSelector((state: GlobalState) => getCurrentUser(state));
    const userProps = currentUser.props || {};
    const currentCustomStatus = userProps.customStatus ? JSON.parse(userProps.customStatus) : {emoji: '', text: ''};
    const customStatusControlRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [emoji, setEmoji] = useState<string>(currentCustomStatus.emoji);
    const [text, setText] = useState<string>(currentCustomStatus.text);
    const dispatch = useDispatch();
    const handleSubmit = () => {
        const customStatus = {
            emoji: emoji || 'speech_balloon',
            text,
        };
        dispatch(updateUserCustomStatus(customStatus));
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
        setText(event.target.value);
    };
    let customStatusEmoji = <EmojiIcon className={'icon icon--emoji'}/>;
    if (emoji) {
        customStatusEmoji = messageHtmlToComponent(renderEmoji(emoji, ''), false, {emoji: true});
    }

    return (
        <GenericModal
            onHide={props.onHide}
            modalHeaderText={
                <FormattedMessage
                    id='custom_status_modal_header'
                    defaultMessage='Set a Status'
                />
            }
            confirmButtonText={
                <FormattedMessage
                    id='custom_status_modal_confirm'
                    defaultMessage='Set Status'
                />
            }
            id='custom_status_modal'
            className={'modal-overflow StatusModal'}
            handleConfirm={handleSubmit}
        >
            <div>

                <div className='StatusModal__input'>
                    <div
                        ref={customStatusControlRef}
                        className='StatusModal__emoji-container'
                    >
                        <EmojiPickerOverlay
                            target={getCustomStatusControlRef}
                            show={showEmojiPicker}
                            onHide={handleEmojiClose}
                            onEmojiClose={handleEmojiClose}
                            onEmojiClick={handleEmojiClick}
                        />
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
                </div>

            </div>
        </GenericModal>
    );
};

export default CustomStatusModal;
