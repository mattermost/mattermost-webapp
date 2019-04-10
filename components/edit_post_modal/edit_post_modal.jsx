// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

import {Constants, ModalIdentifiers} from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';
import DeletePostModal from 'components/delete_post_modal';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import EmojiIcon from 'components/svg/emoji_icon';
import Textbox from 'components/textbox';

const KeyCodes = Constants.KeyCodes;

export default class EditPostModal extends React.PureComponent {
    static propTypes = {
        canEditPost: PropTypes.bool,
        canDeletePost: PropTypes.bool,
        ctrlSend: PropTypes.bool,
        config: PropTypes.object.isRequired,
        maxPostSize: PropTypes.number.isRequired,
        editingPost: PropTypes.shape({
            post: PropTypes.object,
            postId: PropTypes.string,
            refocusId: PropTypes.string,
            show: PropTypes.bool.isRequired,
            title: PropTypes.string,
            isRHS: PropTypes.bool,
        }).isRequired,

        actions: PropTypes.shape({
            addMessageIntoHistory: PropTypes.func.isRequired,
            editPost: PropTypes.func.isRequired,
            hideEditPostModal: PropTypes.func.isRequired,
            openModal: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            editText: '',
            postError: '',
            errorClass: null,
            showEmojiPicker: false,
            show: false,
        };

        this.textboxRef = React.createRef();
    }

    static getDerivedStateFromProps = (props, state) => {
        const msg = props.editingPost.post ? props.editingPost.post.message_source || props.editingPost.post.message : '';
        if (props.editingPost.show && !state.show) {
            return {
                editText: msg,
                show: true,
            };
        }
        return null;
    }

    getContainer = () => {
        return this.refs.editModalBody;
    }

    toggleEmojiPicker = () => {
        this.setState({showEmojiPicker: !this.state.showEmojiPicker});
    }

    hideEmojiPicker = () => {
        this.setState({showEmojiPicker: false});
    }

    handleEmojiClick = (emoji) => {
        const emojiAlias = emoji.name || emoji.aliases[0];

        if (!emojiAlias) {
            //Oops.. There went something wrong
            return;
        }

        this.textboxRef.current.getWrappedInstance().addEmojiAtCaret(':' + emojiAlias + ':');

        // draft update will happen in handleChange

        this.setState({showEmojiPicker: false});
    }

    handleGifClick = (gif) => {
        if (this.state.editText === '') {
            this.setState({editText: gif});
        } else {
            const newMessage = ((/\s+$/).test(this.state.editText)) ? this.state.editText + gif : this.state.editText + ' ' + gif;
            this.setState({editText: newMessage});
        }
        this.setState({showEmojiPicker: false});
        this.textboxRef.current.getWrappedInstance().focus();
    }

    getEditPostControls = () => {
        return this.refs.editPostEmoji;
    }

    handlePostError = (postError) => {
        if (this.state.postError !== postError) {
            this.setState({postError});
        }
    }

    handleEdit = async () => {
        if (this.isSaveDisabled()) {
            return;
        }

        const {actions, editingPost} = this.props;
        const updatedPost = {
            message: this.state.editText,
            id: editingPost.postId,
            channel_id: editingPost.post.channel_id,
        };

        if (this.state.postError) {
            this.setState({errorClass: 'animation--highlight'});
            setTimeout(() => {
                this.setState({errorClass: null});
            }, Constants.ANIMATION_TIMEOUT);
            return;
        }

        if (updatedPost.message === (editingPost.post.message_source || editingPost.post.message)) {
            // no changes so just close the modal
            this.handleHide();
            return;
        }

        const hasAttachment = editingPost.post.file_ids && editingPost.post.file_ids.length > 0;
        if (updatedPost.message.trim().length === 0 && !hasAttachment) {
            this.handleHide(false);

            const deletePostModalData = {
                ModalId: ModalIdentifiers.DELETE_POST,
                dialogType: DeletePostModal,
                dialogProps: {
                    post: editingPost.post,
                    commentCount: editingPost.commentCount,
                    isRHS: editingPost.isRHS,
                },
            };

            this.props.actions.openModal(deletePostModalData);
            return;
        }

        actions.addMessageIntoHistory(updatedPost.message);

        const data = await actions.editPost(updatedPost);
        if (data) {
            window.scrollTo(0, 0);
        }

        this.handleHide();
    }

    handleChange = (e) => {
        const message = e.target.value;
        this.setState({
            editText: message,
        });
    }

    handleEditKeyPress = (e) => {
        if (!UserAgent.isMobile() && !this.props.ctrlSend && Utils.isKeyPressed(e, KeyCodes.ENTER) && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            this.textboxRef.current.getWrappedInstance().blur();
            this.handleEdit();
        } else if (this.props.ctrlSend && e.ctrlKey && Utils.isKeyPressed(e, KeyCodes.ENTER)) {
            e.preventDefault();
            this.textboxRef.current.getWrappedInstance().blur();
            this.handleEdit();
        }
    }

    handleKeyDown = (e) => {
        if (this.props.ctrlSend && Utils.isKeyPressed(e, KeyCodes.ENTER) && e.ctrlKey === true) {
            this.handleEdit();
        } else if (Utils.isKeyPressed(e, KeyCodes.ESCAPE) && !this.state.showEmojiPicker) {
            this.handleHide();
        }
    }

    handleHide = (doRefocus = true) => {
        this.refocusId = doRefocus ? this.props.editingPost.refocusId : null;
        this.props.actions.hideEditPostModal();
        this.setState({show: false});
    }

    handleEntered = () => {
        if (this.textboxRef.current) {
            this.textboxRef.current.getWrappedInstance().focus();

            // TODO: needed?
            //this.textboxRef.current.getWrappedInstance().recalculateSize();
        }
    }

    handleExit = () => {
        if (this.textboxRef.current) {
            this.textboxRef.current.getWrappedInstance().hidePreview();
        }
    }

    handleExited = () => {
        const refocusId = this.refocusId;
        if (refocusId) {
            setTimeout(() => {
                const element = document.getElementById(refocusId);
                if (element) {
                    element.focus();
                }
            });
        }

        this.refocusId = null;
        this.setState({editText: '', postError: '', errorClass: null, showEmojiPicker: false, show: false});
    }

    isSaveDisabled = () => {
        const post = this.props.editingPost.post;
        const hasAttachments = post && post.file_ids && post.file_ids.length > 0;
        if (hasAttachments) {
            return !this.props.canEditPost;
        }

        if (this.state.editText !== '') {
            return !this.props.canEditPost;
        }

        return !this.props.canDeletePost;
    }

    render() {
        const errorBoxClass = 'edit-post-footer' + (this.state.postError ? ' has-error' : '');
        let postError = null;
        if (this.state.postError) {
            const postErrorClass = 'post-error' + (this.state.errorClass ? (' ' + this.state.errorClass) : '');
            postError = (<label className={postErrorClass}>{this.state.postError}</label>);
        }

        let emojiPicker = null;
        if (this.props.config.EnableEmojiPicker === 'true') {
            emojiPicker = (
                <span className='emoji-picker__container'>
                    <EmojiPickerOverlay
                        show={this.state.showEmojiPicker}
                        container={this.getContainer}
                        target={this.getEditPostControls}
                        onHide={this.hideEmojiPicker}
                        onEmojiClick={this.handleEmojiClick}
                        onGifClick={this.handleGifClick}
                        enableGifPicker={this.props.config.EnableGifPicker === 'true'}
                        topOffset={-20}
                    />
                    <EmojiIcon
                        className='icon icon--emoji'
                        onClick={this.toggleEmojiPicker}
                    />
                </span>
            );
        }

        return (
            <Modal
                dialogClassName='edit-modal'
                show={this.props.editingPost.show}
                onKeyDown={this.handleKeyDown}
                onHide={this.handleHide}
                onEntered={this.handleEntered}
                onExit={this.handleExit}
                onExited={this.handleExited}
                keyboard={false}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='edit_post.edit'
                            defaultMessage='Edit {title}'
                            values={{
                                title: this.props.editingPost.title,
                            }}
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    bsClass={`modal-body edit-modal-body${this.state.showEmojiPicker ? ' edit-modal-body--add-reaction' : ''}`}
                    ref='editModalBody'
                >
                    <Textbox
                        onChange={this.handleChange}
                        onKeyPress={this.handleEditKeyPress}
                        onKeyDown={this.handleKeyDown}
                        handlePostError={this.handlePostError}
                        value={this.state.editText}
                        channelId={this.props.editingPost.post && this.props.editingPost.post.channel_id}
                        emojiEnabled={this.props.config.EnableEmojiPicker === 'true'}
                        createMessage={Utils.localizeMessage('edit_post.editPost', 'Edit the post...')}
                        supportsCommands={false}
                        suggestionListStyle='bottom'
                        id='edit_textbox'
                        ref={this.textboxRef}
                        characterLimit={this.props.maxPostSize}
                    />
                    <span
                        id='editPostEmoji'
                        ref='editPostEmoji'
                        className='edit-post__actions'
                    >
                        {emojiPicker}
                    </span>
                    <div className={errorBoxClass}>
                        {postError}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-link'
                        onClick={this.handleHide}
                    >
                        <FormattedMessage
                            id='edit_post.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        id='editButton'
                        type='button'
                        className='btn btn-primary'
                        disabled={this.isSaveDisabled()}
                        onClick={this.handleEdit}
                    >
                        <FormattedMessage
                            id='edit_post.save'
                            defaultMessage='Save'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
