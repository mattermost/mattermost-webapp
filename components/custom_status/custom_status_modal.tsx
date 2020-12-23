// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {FormEvent, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';
import {UserProfile} from 'mattermost-redux/types/users';

import GenericModal from 'components/generic_modal';
import 'components/category_modal.scss';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import {localizeMessage} from 'utils/utils.jsx';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

type Props = {
    onHide: () => void;
    currentUser: UserProfile;
};

const CustomStatusModal: React.FC<Props> = (props: Props) => {
    const customStatusControlRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [emoji, setEmoji] = useState<string>('');
    const [customStatusText, setCustomStatusText] = useState<string>('');
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    const getCustomStatusControlRef = () => {
        return customStatusControlRef;
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
        setCustomStatusText(event.target.value);
    };

    return (
        <GenericModal
            onHide={props.onHide}
            modalHeaderText={
                <FormattedMessage
                    id='custom_status_modal_header'
                    defaultMessage='Set a Custom Status'
                />
            }
            confirmButtonText={
                <FormattedMessage
                    id='custom_status_modal_confirm'
                    defaultMessage='Confirm'
                />
            }
            id='custom_status_modal'
            className={'modal-overflow StatusModal'}
        >
            <div>
                <form onSubmit={handleSubmit}>
                    <div className='StatusModal__input'>
                        {/*<div*/}
                        {/*    ref={customStatusControlRef}*/}
                        {/*    className='StatusModal__emoji-container'*/}
                        {/*>*/}
                        {/*    <EmojiPickerOverlay*/}
                        {/*        target={getCustomStatusControlRef}*/}
                        {/*        show={showEmojiPicker}*/}
                        {/*        onHide={handleEmojiClose}*/}
                        {/*        onEmojiClose={handleEmojiClose()}*/}
                        {/*        onEmojiClick={handleEmojiClick}*/}
                        {/*        topOffset={55}*/}
                        {/*    />*/}
                        {/*    <button*/}
                        {/*        type='button'*/}
                        {/*        onClick={toggleEmojiPicker}*/}
                        {/*        className={classNames('emoji-picker__container', 'StatusModal__emoji-button', {*/}
                        {/*            'StatusModal__emoji-button--active': showEmojiPicker,*/}
                        {/*        })}*/}
                        {/*    >*/}
                        {/*        <EmojiIcon className={'icon icon--emoji emoji-rhs '}/>*/}
                        {/*    </button>*/}
                        {/*</div>*/}
                        <input
                            className='form-control'
                            placeholder='Set a status'
                            type='text'
                            value={customStatusText}
                            onChange={handleTextChange}
                        />
                    </div>
                    <div className='StatusModal__footer'>
                        <input
                            className='btn btn-primary'
                            type='submit'
                            value='Set Status'
                        />
                    </div>
                </form>
            </div>
        </GenericModal>
    );
};

export default CustomStatusModal;
