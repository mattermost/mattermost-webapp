// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {Constants, ModalIdentifiers} from 'utils/constants';
import {splitMessageBasedOnCaretPosition, postMessageOnKeyPress} from 'utils/post_utils.jsx';

import {intlShape} from 'utils/react_intl';
import * as Utils from 'utils/utils.jsx';
import {getTable, formatMarkdownTableMessage, isGitHubCodeBlock, formatGithubCodePaste} from 'utils/paste';

import DeletePostModal from 'components/delete_post_modal';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import Textbox from 'components/textbox';
import TextboxLinks from 'components/textbox/textbox_links';

const KeyCodes = Constants.KeyCodes;
const TOP_OFFSET = 0;
const RIGHT_OFFSET = 10;

class EditPostModal extends React.PureComponent {
    static propTypes = {
        canEditPost: PropTypes.bool,
        canDeletePost: PropTypes.bool,
        codeBlockOnCtrlEnter: PropTypes.bool,
        ctrlSend: PropTypes.bool,
        config: PropTypes.object.isRequired,
        intl: intlShape.isRequired,
        maxPostSize: PropTypes.number.isRequired,
        shouldShowPreview: PropTypes.bool.isRequired,
        useChannelMentions: PropTypes.bool.isRequired,

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
            setShowPreview: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            editText: '',
            caretPosition: ''.length,
            postError: '',
            errorClass: null,
            showEmojiPicker: false,
            renderScrollbar: false,
            scrollbarWidth: 0,
            prevShowState: props.editingPost.show,
        };

        this.editModalBody = React.createRef();
    }

    static getDerivedStateFromProps(props, state) {
        if (props.editingPost.show && !state.prevShowState) {
            return {
                editText: props.editingPost.post.message_source || props.editingPost.post.message,
                prevShowState: props.editingPost.show,
            };
        }

        return null;
    }

    componentDidMount() {
        document.addEventListener('paste', this.handlePaste);
    }

    componentWillUnmount() {
        document.removeEventListener('paste', this.handlePaste);
    }

    setShowPreview = (newPreviewValue) => {
        this.props.actions.setShowPreview(newPreviewValue);
    }

    getContainer = () => {
        return this.editModalBody.current;
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
            const {editText} = this.state;
            const {firstPiece, lastPiece} = splitMessageBasedOnCaretPosition(this.state.caretPosition, editText);

            // check whether the first piece of the message is empty when cursor
            // is placed at beginning of message and avoid adding an empty string at the beginning of the message
            const newMessage = firstPiece === '' ? `:${emojiAlias}: ${lastPiece}` : `${firstPiece} :${emojiAlias}: ${lastPiece}`;

            const newCaretPosition = firstPiece === '' ? `:${emojiAlias}: `.length : `${firstPiece} :${emojiAlias}: `.length;

            const textbox = this.editbox.getInputBox();

            this.setState({
                editText: newMessage,
                caretPosition: newCaretPosition,
            }, () => {
                Utils.setCaretPosition(textbox, newCaretPosition);
            });
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

    getTarget = () => {
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

    handlePaste = (e) => {
        if (!e.clipboardData || !e.clipboardData.items || !this.props.canEditPost || e.target.id !== 'edit_textbox') {
            return;
        }
        const {clipboardData} = e;
        const table = getTable(clipboardData);
        if (!table) {
            return;
        }

        e.preventDefault();

        const {editText} = this.state;
        let message = editText;
        let newCaretPosition = this.state.caretPosition;

        if (isGitHubCodeBlock(table.className)) {
            const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste(this.state.caretPosition, message, clipboardData);
            newCaretPosition = this.state.caretPosition + formattedCodeBlock.length;
            message = formattedMessage;
        } else {
            message = formatMarkdownTableMessage(table, editText.trim(), newCaretPosition);
            newCaretPosition = message.length - (editText.length - newCaretPosition);
        }

        this.setState({
            editText: message,
            caretPosition: newCaretPosition,
        }, () => {
            Utils.setCaretPosition(this.editbox.getInputBox(), newCaretPosition);
        });
    }

    handleEditKeyPress = (e) => {
        const {ctrlSend, codeBlockOnCtrlEnter} = this.props;

        const {allowSending, ignoreKeyPress} = postMessageOnKeyPress(e, this.state.editText, ctrlSend, codeBlockOnCtrlEnter, Date.now(), this.lastChannelSwitchAt, this.state.caretPosition);

        if (ignoreKeyPress) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (allowSending) {
            e.preventDefault();
            this.editbox.blur();
            this.handleEdit();
        }
    }

    handleMouseUpKeyUp = (e) => {
        const caretPosition = Utils.getCaretPosition(e.target);
        this.setState({
            caretPosition,
        });
    }

    handleSelect = (e) => {
        Utils.adjustSelection(this.editbox.getInputBox(), e);
    }

    handleKeyDown = (e) => {
        const {ctrlSend, codeBlockOnCtrlEnter} = this.props;

        const ctrlOrMetaKeyPressed = e.ctrlKey || e.metaKey;
        const ctrlKeyCombo = ctrlOrMetaKeyPressed && !e.altKey && !e.shiftKey;
        const ctrlEnterKeyCombo = (ctrlSend || codeBlockOnCtrlEnter) && Utils.isKeyPressed(e, KeyCodes.ENTER) && ctrlOrMetaKeyPressed;
        const markdownHotkey = Utils.isKeyPressed(e, KeyCodes.B) || Utils.isKeyPressed(e, KeyCodes.I);

        // listen for line break key combo and insert new line character
        if (Utils.isUnhandledLineBreakKeyCombo(e)) {
            e.stopPropagation(); // perhaps this should happen in all of these cases? or perhaps Modal should not be listening?
            this.setState({editText: Utils.insertLineBreakFromKeyEvent(e)});
        } else if (ctrlEnterKeyCombo) {
            this.handleEdit();
        } else if (Utils.isKeyPressed(e, KeyCodes.ESCAPE) && !this.state.showEmojiPicker) {
            this.handleHide();
        } else if (ctrlKeyCombo && markdownHotkey) {
            this.applyHotkeyMarkdown(e);
        }
    }

    applyHotkeyMarkdown = (e) => {
        const res = Utils.applyHotkeyMarkdown(e);

        this.setState({
            editText: res.message,
        }, () => {
            const textbox = this.editbox.getInputBox();
            Utils.setSelectionRange(textbox, res.selectionStart, res.selectionEnd);
        });
    }

    handleHide = (doRefocus = true) => {
        this.refocusId = doRefocus ? this.props.editingPost.refocusId : null;
        this.props.actions.hideEditPostModal();
    }

    handleCheckForChangesHide = () => {
        if (this.state.editText !== this.props.editingPost.post.message) {
            return;
        }

        this.handleHide();
    }

    handleEntered = () => {
        if (this.editbox) {
            this.editbox.focus();
            this.editbox.recalculateSize();
        }
    }

    handleHeightChange = (height, maxHeight) => {
        if (this.editbox) {
            this.setState({
                renderScrollbar: height > maxHeight,
                scrollbarWidth: Utils.scrollbarWidth(this.editbox.getInputBox()),
            });
        }
    }

    handleExit = () => {
        this.props.actions.setShowPreview(false);
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
        this.setState({editText: '', postError: '', errorClass: null, showEmojiPicker: false, prevShowState: false});
        this.props.actions.setShowPreview(false);
    }

    setEditboxRef = (ref) => {
        this.editbox = ref;

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

        if (this.state.editText.trim() !== '') {
            return !this.props.canEditPost;
        }

        return !this.props.canDeletePost;
    }

    render() {
        const {formatMessage} = this.props.intl;
        const errorBoxClass = 'edit-post-footer' + (this.state.postError ? ' has-error' : '');
        let postError = null;
        if (this.state.postError) {
            const postErrorClass = 'post-error' + (this.state.errorClass ? (' ' + this.state.errorClass) : '');
            postError = (<label className={postErrorClass}>{this.state.postError}</label>);
        }

        let emojiPicker = null;
        const emojiButtonAriaLabel = formatMessage({id: 'emoji_picker.emojiPicker', defaultMessage: 'Emoji Picker'}).toLowerCase();
        if (this.props.config.EnableEmojiPicker === 'true' && !this.props.shouldShowPreview) {
            emojiPicker = (
                <div>
                    <EmojiPickerOverlay
                        show={this.state.showEmojiPicker}
                        container={this.getContainer}
                        target={this.getTarget}
                        onHide={this.hideEmojiPicker}
                        onEmojiClick={this.handleEmojiClick}
                        onGifClick={this.handleGifClick}
                        enableGifPicker={this.props.config.EnableGifPicker === 'true'}
                        topOffset={TOP_OFFSET}
                        rightOffset={RIGHT_OFFSET}
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
                onSelect={this.handleSelect}
                onHide={this.handleCheckForChangesHide}
                onEntered={this.handleEntered}
                onExit={this.handleExit}
                onExited={this.handleExited}
                keyboard={false}
                role='dialog'
                aria-labelledby='editPostModalLabel'
            >
                <Modal.Header
                    closeButton={true}
                    onHide={this.handleHide}
                >
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
                    ref={this.editModalBody}
                >
                    <div className='post-create__container'>
                        <div
                            className={classNames('textarea-wrapper', {scroll: this.state.renderScrollbar})}
                            style={this.state.renderScrollbar && this.state.scrollbarWidth ? {'--detected-scrollbar-width': `${this.state.scrollbarWidth}px`} : undefined}
                        >
                            <Textbox
                                tabIndex='0'
                                onChange={this.handleChange}
                                onKeyPress={this.handleEditKeyPress}
                                onKeyDown={this.handleKeyDown}
                                onSelect={this.handleSelect}
                                onMouseUp={this.handleMouseUpKeyUp}
                                onKeyUp={this.handleMouseUpKeyUp}
                                onHeightChange={this.handleHeightChange}
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
                                preview={this.props.shouldShowPreview}
                                useChannelMentions={this.props.useChannelMentions}
                            />
                            <div className='post-body__actions'>
                                {emojiPicker}
                            </div>
                        </div>
                        <div className='post-create-footer'>
                            <TextboxLinks
                                characterLimit={this.props.maxPostSize}
                                showPreview={this.props.shouldShowPreview}
                                ref={this.setTextboxLinksRef}
                                updatePreview={this.setShowPreview}
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

export default injectIntl(EditPostModal);
/* eslint-disable react/no-string-refs */
