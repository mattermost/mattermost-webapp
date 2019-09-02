// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, intlShape} from 'react-intl';
import PropTypes from 'prop-types';

import {Constants, ModalIdentifiers} from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';
import DeletePostModal from 'components/delete_post_modal';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import Textbox from 'components/textbox';
import TextboxLinks from 'components/textbox/textbox_links.jsx';

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
            commentCount: PropTypes.number,
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

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            preview: false,
            editText: '',
            postError: '',
            errorClass: null,
            showEmojiPicker: false,
        };
    }

    UNSAFE_componentWillUpdate(nextProps) { // eslint-disable-line camelcase
        if (!this.props.editingPost.show && nextProps.editingPost.show) {
            this.setState({
                editText: nextProps.editingPost.post.message_source || nextProps.editingPost.post.message,
            });
        }
    }

    updatePreview = (newState) => {
        this.setState({preview: newState});
    }

    getContainer = () => {
        return this.refs.editModalBody;
    }

    toggleEmojiPicker = () => {
        this.setState({showEmojiPicker: !this.state.showEmojiPicker});
        if (!this.state.showEmojiPicker && this.editbox) {
            this.editbox.focus();
        }
    }

    hideEmojiPicker = () => {
        this.setState({showEmojiPicker: false});
        if (this.editbox) {
            this.editbox.focus();
        }
    }

    handleEmojiClick = (emoji) => {
        const emojiAlias = emoji && (emoji.name || (emoji.aliases && emoji.aliases[0]));

        if (!emojiAlias) {
            //Oops.. There went something wrong
            return;
        }

        if (this.state.editText === '') {
            this.setState({editText: ':' + emojiAlias + ': '});
        } else {
            //check whether there is already a blank at the end of the current message
            const newMessage = ((/\s+$/).test(this.state.editText)) ?
                this.state.editText + ':' + emojiAlias + ': ' : this.state.editText + ' :' + emojiAlias + ': ';

            this.setState({editText: newMessage});
        }

        this.setState({showEmojiPicker: false});

        if (this.editbox) {
            this.editbox.focus();
        }
    }

    handleGifClick = (gif) => {
        if (this.state.editText === '') {
            this.setState({editText: gif});
        } else {
            const newMessage = ((/\s+$/).test(this.state.editText)) ? this.state.editText + gif : this.state.editText + ' ' + gif;
            this.setState({editText: newMessage});
        }
        this.setState({showEmojiPicker: false});
        this.editbox.focus();
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
            this.editbox.blur();
            this.handleEdit();
        } else if (this.props.ctrlSend && e.ctrlKey && Utils.isKeyPressed(e, KeyCodes.ENTER)) {
            e.preventDefault();
            this.editbox.blur();
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
    }

    handleEntered = () => {
        if (this.editbox) {
            this.editbox.focus();
            this.editbox.recalculateSize();
        }
    }

    handleExit = () => {
        this.setState({preview: false});
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
        this.setState({editText: '', postError: '', errorClass: null, preview: false, showEmojiPicker: false});
    }

    setEditboxRef = (ref) => {
        if (ref && ref.getWrappedInstance) {
            this.editbox = ref.getWrappedInstance();
        }

        if (this.editbox) {
            this.editbox.focus();
        }
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
        const {formatMessage} = this.context.intl;
        const errorBoxClass = 'edit-post-footer' + (this.state.postError ? ' has-error' : '');
        let postError = null;
        if (this.state.postError) {
            const postErrorClass = 'post-error' + (this.state.errorClass ? (' ' + this.state.errorClass) : '');
            postError = (<label className={postErrorClass}>{this.state.postError}</label>);
        }

        let emojiPicker = null;
        const emojiButtonAriaLabel = formatMessage({id: 'emoji_picker.emojiPicker', defaultMessage: 'Emoji Picker'}).toLowerCase();
        if (this.props.config.EnableEmojiPicker === 'true' && !this.state.preview) {
            emojiPicker = (
                <div>
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
                    <button
                        aria-label={emojiButtonAriaLabel}
                        id='editPostEmoji'
                        ref='editPostEmoji'
                        className='style--none post-action'
                        onClick={this.toggleEmojiPicker}
                    >
                        <EmojiIcon
                            className='icon icon--emoji'

                        />
                    </button>
                </div>
            );
        }

        return (
            <Modal
                id='editPostModal'
                dialogClassName='a11y__modal edit-modal'
                show={this.props.editingPost.show}
                onKeyDown={this.handleKeyDown}
                onHide={this.handleHide}
                onEntered={this.handleEntered}
                onExit={this.handleExit}
                onExited={this.handleExited}
                keyboard={false}
                role='dialog'
                aria-labelledby='editPostModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='editPostModalLabel'
                    >
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
                    <div className='post-create__container'>
                        <div className='textarea-wrapper'>
                            <Textbox
                                tabIndex='0'
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
                                ref={this.setEditboxRef}
                                characterLimit={this.props.maxPostSize}
                                preview={this.state.preview}
                            />
                            <div className='post-body__actions'>
                                {emojiPicker}
                            </div>
                        </div>
                        <div className='post-create-footer'>
                            <TextboxLinks
                                characterLimit={this.props.maxPostSize}
                                showPreview={this.state.preview}
                                ref={this.setTextboxLinksRef}
                                updatePreview={this.updatePreview}
                                message={this.state.editText}
                            />
                            <div className={errorBoxClass}>
                                {postError}
                            </div>
                        </div>
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
