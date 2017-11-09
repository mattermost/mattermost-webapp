// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import ReactDOM from 'react-dom';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

import * as Selectors from 'mattermost-redux/selectors/entities/posts';

import * as GlobalActions from 'actions/global_actions.jsx';
import store from 'stores/redux_store.jsx';

import Constants from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';

import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';

import Textbox from '../textbox.jsx';

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
         * Global license object
         */
        license: PropTypes.object.isRequired,

        /**
         * Editing post information
         */
        editingPost: PropTypes.object.isRequired,

        actions: PropTypes.shape({
            editPost: PropTypes.func.isRequired,
            addMessageIntoHistory: PropTypes.func.isRequired,
            setEditingPost: PropTypes.func.isRequired
        }).isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            editText: '',
            postError: '',
            errorClass: null,
            showEmojiPicker: false,
            hidding: false
        };
    }

    mustBeShown = () => {
        if (this.state.hidding) {
            return false;
        }
        if (!this.props.editingPost || !this.props.editingPost.post) {
            return false;
        }
        if (this.props.license.IsLicensed === 'true') {
            if (this.props.config.AllowEditPost === Constants.ALLOW_EDIT_POST_NEVER) {
                return false;
            }
            if (this.props.config.AllowEditPost === Constants.ALLOW_EDIT_POST_TIME_LIMIT) {
                if ((this.props.editingPost.post.create_at + (this.props.config.PostEditTimeLimit * 1000)) < Utils.getTimestamp()) {
                    return false;
                }
            }
        }
        return true;
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
        const updatedPost = {
            message: this.state.editText,
            id: this.props.editingPost.postId,
            channel_id: this.props.editingPost.post.channel_id
        };

        if (this.state.postError) {
            this.setState({errorClass: 'animation--highlight'});
            setTimeout(() => {
                this.setState({errorClass: null});
            }, Constants.ANIMATION_TIMEOUT);
            return;
        }

        if (updatedPost.message === this.props.editingPost.post.message) {
            // no changes so just close the modal
            this.handleHide();
            return;
        }

        if (updatedPost.message.trim().length === 0) {
            this.handleHide();
            GlobalActions.showDeletePostModal(Selectors.getPost(getState(), this.props.editingPost.postId), this.props.editingPost.commentsCount);
            return;
        }

        this.props.actions.addMessageIntoHistory(updatedPost.message);

        const data = await this.props.actions.editPost(updatedPost);
        if (data) {
            window.scrollTo(0, 0);
        }

        this.handleHide();
    }

    handleChange = (e) => {
        const message = e.target.value;
        this.setState({
            editText: message
        });
    }

    handleEditKeyPress = (e) => {
        if (!UserAgent.isMobile() && !this.props.ctrlSend && e.which === KeyCodes.ENTER && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            ReactDOM.findDOMNode(this.refs.editbox).blur();
            this.handleEdit();
        } else if (this.props.ctrlSend && e.ctrlKey && e.which === KeyCodes.ENTER) {
            e.preventDefault();
            ReactDOM.findDOMNode(this.refs.editbox).blur();
            this.handleEdit();
        }
    }

    handleKeyDown = (e) => {
        if (this.props.ctrlSend && e.keyCode === KeyCodes.ENTER && e.ctrlKey === true) {
            this.handleEdit();
        }
    }

    handleHide = () => {
        this.setState({hidding: true});
    }

    handleEnter = () => {
        this.setState({
            editText: this.props.editingPost.post.message
        });
    }

    handleEntered = () => {
        this.refs.editbox.focus();
        this.refs.editbox.recalculateSize();
    }

    handleExit = () => {
        this.refs.editbox.hidePreview();
    }

    handleExited = () => {
        const refocusId = this.props.editingPost.refocusId;
        if (refocusId !== '') {
            setTimeout(() => {
                const element = document.getElementById(refocusId);
                if (element) {
                    element.focus();
                }
            });
        }
        this.props.actions.setEditingPost();
        this.setState({editText: '', postError: '', errorClass: null, hidding: false, showEmojiPicker: false});
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
                    <span
                        className='icon icon--emoji'
                        onClick={this.toggleEmojiPicker}
                        dangerouslySetInnerHTML={{__html: Constants.EMOJI_ICON_SVG}}
                    />
                </span>
            );
        }

        return (
            <Modal
                dialogClassName='edit-modal'
                show={this.mustBeShown()}
                onKeyDown={this.handleKeyDown}
                onHide={this.handleHide}
                onEnter={this.handleEnter}
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
                                title: this.props.editingPost.title
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
