// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import * as Selectors from 'mattermost-redux/selectors/entities/posts';

import store from 'stores/redux_store.jsx';
import {Constants, ModalIdentifiers} from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';
import DeletePostModal from 'components/delete_post_modal';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import EmojiIcon from 'components/svg/emoji_icon';
import Textbox from 'components/textbox.jsx';

const KeyCodes = Constants.KeyCodes;

const getState = store.getState;

export default class EditPostModal extends React.PureComponent {
    static propTypes = {

        /**
         * Set to force form submission on CTRL/CMD + ENTER instead of ENTER
         */
        ctrlSend: PropTypes.bool,

        /**
         * Global config object
         */
        config: PropTypes.object.isRequired,

        /**
         * The maximum length of a post
         */
        maxPostSize: PropTypes.number.isRequired,

        /**
         * Editing post information
         */
        editingPost: PropTypes.shape({

            /**
             * The post being edited
             */
            post: PropTypes.object,

            /**
             * The ID of the post being edited
             */
            postId: PropTypes.string,

            /**
             * The ID of a DOM node to focus with the keyboard when this modal closes
             */
            refocusId: PropTypes.string,

            /**
             * Whether or not to show the modal
             */
            show: PropTypes.bool.isRequired,

            /**
             * What to show in the title of the modal as "Edit {title}"
             */
            title: PropTypes.string,

            /**
             * Whether or not the modal was open from RHS
             */
            isRHS: PropTypes.bool,
        }).isRequired,

        actions: PropTypes.shape({
            addMessageIntoHistory: PropTypes.func.isRequired,
            editPost: PropTypes.func.isRequired,
            hideEditPostModal: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            editText: '',
            postError: '',
            errorClass: null,
            showEmojiPicker: false,
        };
    }

    componentWillUpdate(nextProps) {
        if (!this.props.editingPost.show && nextProps.editingPost.show) {
            this.setState({
                editText: nextProps.editingPost.post.message_source || nextProps.editingPost.post.message,
            });
        }
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
        const emojiAlias = emoji && (emoji.name || (emoji.aliases && emoji.aliases[0]));

        if (!emojiAlias) {
            //Oops.. There went something wrong
            return;
        }

        if (this.state.editText === '') {
            this.setState({editText: ':' + emojiAlias + ': '});
        } else {
            //check whether there is already a blank at the end of the current message
            const newMessage = (/\s+$/.test(this.state.editText)) ?
                this.state.editText + ':' + emojiAlias + ': ' : this.state.editText + ' :' + emojiAlias + ': ';

            this.setState({editText: newMessage});
        }

        this.setState({showEmojiPicker: false});

        this.refs.editbox.focus();
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
                    post: Selectors.getPost(getState(), editingPost.postId),
                    commentCount: editingPost.commentsCount,
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
            this.refs.editbox.blur();
            this.handleEdit();
        } else if (this.props.ctrlSend && e.ctrlKey && Utils.isKeyPressed(e, KeyCodes.ENTER)) {
            e.preventDefault();
            this.refs.editbox.blur();
            this.handleEdit();
        }
    }

    handleKeyDown = (e) => {
        if (this.props.ctrlSend && Utils.isKeyPressed(e, KeyCodes.ENTER) && e.ctrlKey === true) {
            this.handleEdit();
        }
    }

    handleHide = (doRefocus = true) => {
        this.refocusId = doRefocus ? this.props.editingPost.refocusId : null;
        this.props.actions.hideEditPostModal();
    }

    handleEntered = () => {
        this.refs.editbox.focus();
        this.refs.editbox.recalculateSize();
    }

    handleExit = () => {
        this.refs.editbox.hidePreview();
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
        this.setState({editText: '', postError: '', errorClass: null, showEmojiPicker: false});
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
                        rightOffset={50}
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
                    bsClass='modal-body edit-modal-body'
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
                        ref='editbox'
                        characterLimit={this.props.maxPostSize}
                    />
                    <span
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
                        className='btn btn-default'
                        onClick={this.handleHide}
                    >
                        <FormattedMessage
                            id='edit_post.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        type='button'
                        className='btn btn-primary'
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
