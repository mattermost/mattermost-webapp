// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import GenericModal from 'components/generic_modal';
import '../category_modal.scss';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import {localizeMessage} from 'utils/utils.jsx';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

// import { ActionFunc } from 'mattermost-redux/types/actions';
// import { UserCustomStatus } from 'mattermost-redux/src/types/users';

type Props = {
    onHide: () => void;
    userId: string;
    actions: {
        setCustomStatus: (status: UserCustomStatus) => ActionFunc
    }
};

type State = {
    showEmojiPicker: boolean,
    userId: string;
    message: string;
    currentDate: Date;
}

export default class CustomStatusInputModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            showEmojiPicker: false,
            userId: props.userId || '',
            message: '',
            currentDate: new Date(),
        };
    }

    getText = () => {
        const modalHeaderText = (
            <FormattedMessage
                id='custom_status_input_modal'
                defaultMessage='Set a Custom Status'
            />
        );
        const confirmButtonText = (
            <FormattedMessage
                id='custum_status_input_modal_confirm'
                defaultMessage='Confirm'
            />
        );

        return {
            modalHeaderText,
            confirmButtonText,
        };
    }

    handleChange = (event: any) => {
        this.setState({ message: event.target.value });
    }

    handleSubmit = (event: any) => {
        event.preventDefault();
        this.props.actions.setCustomStatus({
            user_id: this.props.userId,
            text: this.state.message,
            emoji: '',
            expire_time: '',
        });
    }

    hideEmojiPicker = (event: any) => {
        this.setState({ showEmojiPicker: false });
    }

    toggleEmojiPicker = (event: any) => {
        this.setState({ showEmojiPicker: !this.state.showEmojiPicker });
    }

    handleEmojiClick = (emoji) => {
        const emojiAlias = emoji.name || emoji.aliases[0];

        if (!emojiAlias) {
            //Oops.. There went something wrong
            return;
        }

        this.setState({
            showEmojiPicker: false,
        });
    }

    getCreateCommentControls = () => {
        return this.refs.createCommentControls;
    }

    render() {
        const {
            modalHeaderText,
            confirmButtonText,
        } = this.getText();

        return (
            <GenericModal
                onHide={this.props.onHide}
                modalHeaderText={modalHeaderText}
                confirmButtonText={confirmButtonText}
                id='customStatusChangeInputModal'
                className={'modal-overflow StatusModal'}
            >
                <div>
                    <form onSubmit={this.handleSubmit}>
                        <div className='StatusModal__input'>
                            <div
                                ref='createCommentControls'
                                className='StatusModal__emoji-container'
                            >
                                <EmojiPickerOverlay
                                    target={this.getCreateCommentControls}
                                    show={this.state.showEmojiPicker}
                                    onHide={this.hideEmojiPicker}
                                    onEmojiClose={this.hideEmojiPicker}
                                    onEmojiClick={this.handleEmojiClick}
                                    topOffset={55}
                                />
                                <button
                                    type='button'
                                    onClick={this.toggleEmojiPicker}
                                    className={classNames('emoji-picker__container', 'StatusModal__emoji-button', {
                                        'StatusModal__emoji-button--active': this.state.showEmojiPicker,
                                    })}
                                >
                                    <EmojiIcon className={'icon icon--emoji emoji-rhs '} />
                                </button>
                            </div>
                            <input
                                className='form-control'
                                placeholder='Set a status'
                                type='text'
                                value={this.state.message}
                                onChange={this.handleChange}
                            />
                        </div>
                        <div className='StatusModal__footer'>
                            <MenuWrapper id='statusTimerDropdown'>
                                <button className='style--none'>
                                    <span>{'Clear after:'}</span>
                                    <strong className='ml-1 mr-1'>{'1 hour'}</strong>
                                    <i className='icon icon-chevron-down icon--xs icon-14'/>
                                </button>
                                <Menu
                                    openLeft={false}
                                    ariaLabel={localizeMessage('custom_status.clear_after', 'Clear custom status after')}
                                >
                                    <Menu.ItemAction
                                        text={localizeMessage('custom_status.clear_after.one_hour', '1 hour')}
                                    />
                                    <Menu.ItemAction
                                        text={localizeMessage('custom_status.clear_after.four_hours', '4 hours')}
                                    />
                                    <Menu.ItemAction
                                        text={localizeMessage('custom_status.clear_after.today', 'Today')}
                                    />
                                    <Menu.ItemAction
                                        text={localizeMessage('custom_status.clear_after.this_week', 'This week')}
                                    />
                                </Menu>
                            </MenuWrapper>
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
    }
}
