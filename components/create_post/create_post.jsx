// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {Posts} from 'mattermost-redux/constants';

import * as ChannelActions from 'actions/channel_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import {emitEmojiPosted} from 'actions/post_actions.jsx';
import EmojiStore from 'stores/emoji_store.jsx';
import Constants, {StoragePrefixes} from 'utils/constants.jsx';
import * as FileUtils from 'utils/file_utils';
import * as PostUtils from 'utils/post_utils.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';

import ConfirmModal from 'components/confirm_modal.jsx';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import FilePreview from 'components/file_preview.jsx';
import FileUpload from 'components/file_upload.jsx';
import MsgTyping from 'components/msg_typing.jsx';
import PostDeletedModal from 'components/post_deleted_modal.jsx';
import EmojiIcon from 'components/svg/emoji_icon';
import Textbox from 'components/textbox.jsx';
import TutorialTip from 'components/tutorial/tutorial_tip.jsx';

const TutorialSteps = Constants.TutorialSteps;
const KeyCodes = Constants.KeyCodes;

export default class CreatePost extends React.Component {
    static propTypes = {

        /**
        *  ref passed from channelView for EmojiPickerOverlay
        */
        getChannelView: PropTypes.func,

        /**
        *  Data used in notifying user for @all and @channel
        */
        currentChannelMembersCount: PropTypes.number,

        /**
        *  Data used in multiple places of the component
        */
        currentChannel: PropTypes.object,

        /**
        *  Data used in executing commands for channel actions passed down to client4 function
        */
        currentTeamId: PropTypes.string,

        /**
        *  Data used for posting message
        */
        currentUserId: PropTypes.string,

        /**
        *  Flag used for handling submit
        */
        ctrlSend: PropTypes.bool,

        /**
        *  Flag used for adding a class center to Postbox based on user pref
        */
        fullWidthTextBox: PropTypes.bool,

        /**
        *  Data used for deciding if tutorial tip is to be shown
        */
        showTutorialTip: PropTypes.string,

        /**
        *  Data used populating message state when triggered by shortcuts
        */
        messageInHistoryItem: PropTypes.string,

        /**
        *  Data used for populating message state from previous draft
        */
        draft: PropTypes.shape({
            message: PropTypes.string.isRequired,
            uploadsInProgress: PropTypes.array.isRequired,
            fileInfos: PropTypes.array.isRequired
        }).isRequired,

        /**
        *  Data used adding reaction on +/- to recent post
        */
        recentPostIdInChannel: PropTypes.string,

        /**
        *  Data used dispatching handleViewAction
        */
        commentCountForPost: PropTypes.number,

        /**
        *  Data used dispatching handleViewAction ex: edit post
        */
        latestReplyablePostId: PropTypes.string,

        /**
        *  Data used for calling edit of post
        */
        currentUsersLatestPost: PropTypes.object,

        actions: PropTypes.shape({

            /**
            *  func called after message submit.
            */
            addMessageIntoHistory: PropTypes.func.isRequired,

            /**
            *  func called for navigation through messages by Up arrow
            */
            moveHistoryIndexBack: PropTypes.func.isRequired,

            /**
            *  func called for navigation through messages by Down arrow
            */
            moveHistoryIndexForward: PropTypes.func.isRequired,

            /**
            *  func called for posting message
            */
            createPost: PropTypes.func.isRequired,

            /**
            *  func called for adding a reaction
            */
            addReaction: PropTypes.func.isRequired,

            /**
            *  func called for removing a reaction
            */
            removeReaction: PropTypes.func.isRequired,

            /**
            *  func called on load of component to clear drafts
            */
            clearDraftUploads: PropTypes.func.isRequired,

            /**
            *  func called for setting drafts
            */
            setDraft: PropTypes.func.isRequired,

            /**
            *  func called for editing posts
            */
            setEditingPost: PropTypes.func.isRequired,

            /**
             *  func called for opening the last replayable post in the RHS
             */
            selectPostFromRightHandSideSearchByPostId: PropTypes.func.isRequired
        }).isRequired
    }

    static defaultProps = {
        latestReplyablePostId: ''
    }

    constructor(props) {
        super(props);
        this.state = {
            message: this.props.draft.message,
            submitting: false,
            showPostDeletedModal: false,
            enableSendButton: false,
            showEmojiPicker: false,
            showConfirmModal: false
        };

        this.lastBlurAt = 0;
    }

    componentWillMount() {
        const enableSendButton = this.handleEnableSendButton(this.state.message, this.props.draft.fileInfos);
        this.props.actions.clearDraftUploads(StoragePrefixes.DRAFT, (key, value) => {
            if (value) {
                return {...value, uploadsInProgress: []};
            }
            return value;
        });

        // wait to load these since they may have changed since the component was constructed (particularly in the case of skipping the tutorial)
        this.setState({
            enableSendButton
        });
    }

    componentDidMount() {
        this.focusTextbox();
        document.addEventListener('keydown', this.showShortcuts);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentChannel.id !== this.props.currentChannel.id) {
            const draft = nextProps.draft;

            this.setState({
                message: draft.message,
                submitting: false,
                serverError: null
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.currentChannel.id !== this.props.currentChannel.id) {
            this.focusTextbox();
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.showShortcuts);
    }

    handlePostError = (postError) => {
        this.setState({postError});
    }

    toggleEmojiPicker = () => {
        this.setState({showEmojiPicker: !this.state.showEmojiPicker});
    }

    hideEmojiPicker = () => {
        this.setState({showEmojiPicker: false});
    }

    doSubmit = (e) => {
        const channelId = this.props.currentChannel.id;
        if (e) {
            e.preventDefault();
        }

        if (this.props.draft.uploadsInProgress.length > 0 || this.state.submitting) {
            return;
        }

        const post = {};
        post.file_ids = [];
        post.message = this.state.message;

        if (post.message.trim().length === 0 && this.props.draft.fileInfos.length === 0) {
            return;
        }

        if (this.state.postError) {
            this.setState({errorClass: 'animation--highlight'});
            setTimeout(() => {
                this.setState({errorClass: null});
            }, Constants.ANIMATION_TIMEOUT);
            return;
        }

        this.props.actions.addMessageIntoHistory(this.state.message);

        this.setState({submitting: true, serverError: null});

        const isReaction = Utils.REACTION_PATTERN.exec(post.message);
        if (post.message.indexOf('/') === 0) {
            this.setState({message: '', postError: null, enableSendButton: false});
            const args = {};
            args.channel_id = channelId;
            args.team_id = this.props.currentTeamId;
            ChannelActions.executeCommand(
                post.message,
                args,
                () => {
                    this.setState({submitting: false});
                },
                (err) => {
                    if (err.sendMessage) {
                        this.sendMessage(post);
                    } else {
                        this.setState({
                            serverError: err.message,
                            submitting: false,
                            message: post.message
                        });
                    }
                }
            );
        } else if (isReaction && EmojiStore.has(isReaction[2])) {
            this.sendReaction(isReaction);
        } else {
            this.sendMessage(post);
        }

        this.setState({
            message: '',
            submitting: false,
            postError: null,
            serverError: null,
            enableSendButton: false
        });

        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, null);

        const fasterThanHumanWillClick = 150;
        const forceFocus = (Date.now() - this.lastBlurAt < fasterThanHumanWillClick);

        this.focusTextbox(forceFocus);
    }

    handleNotifyAllConfirmation = (e) => {
        this.hideNotifyAllModal();
        this.doSubmit(e);
    }

    hideNotifyAllModal = () => {
        this.setState({showConfirmModal: false});
    }

    showNotifyAllModal = () => {
        this.setState({showConfirmModal: true});
    }

    handleSubmit = (e) => {
        const updateChannel = this.props.currentChannel;

        if ((PostUtils.containsAtMention(this.state.message, '@all') || PostUtils.containsAtMention(this.state.message, '@channel')) && this.props.currentChannelMembersCount > Constants.NOTIFY_ALL_MEMBERS && window.mm_config.EnableConfirmNotificationsToChannel === 'true') {
            this.showNotifyAllModal();
            return;
        }

        if (this.state.message.trimRight() === '/header') {
            GlobalActions.showChannelHeaderUpdateModal(updateChannel);
            this.setState({message: ''});
            return;
        }

        const isDirectOrGroup = ((updateChannel.type === Constants.DM_CHANNEL) || (updateChannel.type === Constants.GM_CHANNEL));
        if (!isDirectOrGroup && this.state.message.trimRight() === '/purpose') {
            GlobalActions.showChannelPurposeUpdateModal(updateChannel);
            this.setState({message: ''});
            return;
        }

        if (!isDirectOrGroup && this.state.message.trimRight() === '/rename') {
            GlobalActions.showChannelNameUpdateModal(updateChannel);
            this.setState({message: ''});
            return;
        }

        this.doSubmit(e);
    }

    sendMessage = (post) => {
        post.channel_id = this.props.currentChannel.id;

        const time = Utils.getTimestamp();
        const userId = this.props.currentUserId;
        post.pending_post_id = `${userId}:${time}`;
        post.user_id = userId;
        post.create_at = time;
        post.parent_id = this.state.parentId;

        GlobalActions.emitUserPostedEvent(post);
        this.props.actions.createPost(post, this.props.draft.fileInfos).then(() => GlobalActions.postListScrollChange(true)).catch((err) => {
            if (err.id === 'api.post.create_post.root_id.app_error') {
                // this should never actually happen since you can't reply from this textbox
                this.showPostDeletedModal();
            }

            this.setState({
                submitting: false
            });
        });
    }

    sendReaction(isReaction) {
        const channelId = this.props.currentChannel.id;
        const action = isReaction[1];
        const emojiName = isReaction[2];
        const postId = this.props.recentPostIdInChannel;

        if (postId && action === '+') {
            this.props.actions.addReaction(postId, emojiName);
            emitEmojiPosted(emojiName);
        } else if (postId && action === '-') {
            this.props.actions.removeReaction(postId, emojiName);
        }

        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, null);
    }

    focusTextbox = (keepFocus = false) => {
        if (this.refs.textbox && (keepFocus || !UserAgent.isMobile())) {
            this.refs.textbox.focus();
        }
    }

    postMsgKeyPress = (e) => {
        if (!UserAgent.isMobile() && ((this.props.ctrlSend && e.ctrlKey) || !this.props.ctrlSend)) {
            if (e.which === KeyCodes.ENTER && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                ReactDOM.findDOMNode(this.refs.textbox).blur();
                this.handleSubmit(e);
            }
        }

        GlobalActions.emitLocalUserTypingEvent(this.props.currentChannel.id, '');
    }

    handleChange = (e) => {
        const message = e.target.value;
        const channelId = this.props.currentChannel.id;
        const enableSendButton = this.handleEnableSendButton(message, this.props.draft.fileInfos);
        this.setState({
            message,
            enableSendButton
        });

        const draft = {
            ...this.props.draft,
            message
        };

        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, draft);
    }

    handleFileUploadChange = () => {
        this.focusTextbox(true);
    }

    handleUploadStart = (clientIds, channelId) => {
        const uploadsInProgress = [
            ...this.props.draft.uploadsInProgress,
            ...clientIds
        ];

        const draft = {
            ...this.props.draft,
            uploadsInProgress
        };

        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, draft);

        // this is a bit redundant with the code that sets focus when the file input is clicked,
        // but this also resets the focus after a drag and drop
        this.focusTextbox();
    }

    handleFileUploadComplete = (fileInfos, clientIds, channelId) => {
        const draft = {...this.props.draft};

        // remove each finished file from uploads
        for (let i = 0; i < clientIds.length; i++) {
            const index = draft.uploadsInProgress.indexOf(clientIds[i]);

            if (index !== -1) {
                draft.uploadsInProgress = draft.uploadsInProgress.filter((item, itemIndex) => index !== itemIndex);
            }
        }

        draft.fileInfos = draft.fileInfos.concat(fileInfos);
        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, draft);

        if (channelId === this.props.currentChannel.id) {
            this.setState({
                enableSendButton: true
            });
        }
    }

    handleUploadError = (err, clientId, channelId) => {
        const draft = this.props.draft;
        let message = err;
        if (message && typeof message !== 'string') {
            // err is an AppError from the server
            message = err.message;
        }

        if (clientId !== -1) {
            const index = draft.uploadsInProgress.indexOf(clientId);

            if (index !== -1) {
                const uploadsInProgress = draft.uploadsInProgress.filter((item, itemIndex) => index !== itemIndex);
                const modifiedDraft = {
                    ...draft,
                    uploadsInProgress
                };
                this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, modifiedDraft);
            }
        }

        this.setState({serverError: message});
    }

    removePreview = (id) => {
        let modifiedDraft = {};
        const draft = {...this.props.draft};
        const channelId = this.props.currentChannel.id;

        // Clear previous errors
        this.setState({serverError: null});

        // id can either be the id of an uploaded file or the client id of an in progress upload
        let index = draft.fileInfos.findIndex((info) => info.id === id);
        if (index === -1) {
            index = draft.uploadsInProgress.indexOf(id);

            if (index !== -1) {
                const uploadsInProgress = draft.uploadsInProgress.filter((item, itemIndex) => index !== itemIndex);

                modifiedDraft = {
                    ...draft,
                    uploadsInProgress
                };

                // draft.uploadsInProgress.splice(index, 1);
                this.refs.fileUpload.getWrappedInstance().cancelUpload(id);
            }
        } else {
            const fileInfos = draft.fileInfos.filter((item, itemIndex) => index !== itemIndex);

            modifiedDraft = {
                ...draft,
                fileInfos
            };
        }

        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, modifiedDraft);
        const enableSendButton = this.handleEnableSendButton(this.state.message, draft.fileInfos);

        this.setState({enableSendButton});

        this.handleFileUploadChange();
    }

    showShortcuts(e) {
        if ((e.ctrlKey || e.metaKey) && e.keyCode === KeyCodes.FORWARD_SLASH) {
            e.preventDefault();

            GlobalActions.toggleShortcutsModal();
        }
    }

    getFileCount = (channelId) => {
        if (channelId === this.props.currentChannel.id) {
            return this.props.draft.fileInfos.length + this.props.draft.uploadsInProgress.length;
        }

        const draft = this.props.draft;
        return draft.fileInfos.length + draft.uploadsInProgress.length;
    }

    getFileUploadTarget = () => {
        return this.refs.textbox;
    }

    getCreatePostControls = () => {
        return this.refs.createPostControls;
    }

    fillMessageFromHistory() {
        const lastMessage = this.props.messageInHistoryItem;
        if (lastMessage) {
            this.setState({
                message: lastMessage
            });
        }
    }

    handleKeyDown = (e) => {
        if (this.props.ctrlSend && e.keyCode === KeyCodes.ENTER && e.ctrlKey === true) {
            this.postMsgKeyPress(e);
            return;
        }

        if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && e.keyCode === KeyCodes.UP && this.state.message === '') {
            e.preventDefault();

            const lastPost = this.props.currentUsersLatestPost;
            if (!lastPost) {
                return;
            }

            let type;
            if (lastPost.root_id && lastPost.root_id.length > 0) {
                type = Utils.localizeMessage('create_post.comment', Posts.MESSAGE_TYPES.COMMENT);
            } else {
                type = Utils.localizeMessage('create_post.post', Posts.MESSAGE_TYPES.POST);
            }
            this.props.actions.setEditingPost(lastPost.id, this.props.commentCountForPost, '#post_textbox', type);
        } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.shiftKey && e.keyCode === KeyCodes.UP && this.state.message === '') {
            e.preventDefault();
            const latestReplyablePostId = this.props.latestReplyablePostId;

            if (latestReplyablePostId) {
                this.props.actions.selectPostFromRightHandSideSearchByPostId(latestReplyablePostId);
            }
        }

        if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.keyCode === KeyCodes.UP || e.keyCode === KeyCodes.DOWN)) {
            e.preventDefault();
            if (e.keyCode === KeyCodes.UP) {
                this.props.actions.moveHistoryIndexBack(Posts.MESSAGE_TYPES.POST).then(() => this.fillMessageFromHistory());
            } else {
                this.props.actions.moveHistoryIndexForward(Posts.MESSAGE_TYPES.POST).then(() => this.fillMessageFromHistory());
            }
        }
    }

    handleBlur = () => {
        this.lastBlurAt = Date.now();
    }

    showPostDeletedModal = () => {
        this.setState({
            showPostDeletedModal: true
        });
    }

    hidePostDeletedModal = () => {
        this.setState({
            showPostDeletedModal: false
        });
    }

    handleEmojiClick = (emoji) => {
        const emojiAlias = emoji.name || emoji.aliases[0];

        if (!emojiAlias) {
            //Oops.. There went something wrong
            return;
        }

        if (this.state.message === '') {
            this.setState({message: ':' + emojiAlias + ': '});
        } else {
            //check whether there is already a blank at the end of the current message
            const newMessage = (/\s+$/.test(this.state.message)) ? this.state.message + ':' + emojiAlias + ': ' : this.state.message + ' :' + emojiAlias + ': ';

            this.setState({message: newMessage});
        }

        this.setState({showEmojiPicker: false});

        this.focusTextbox();
    }

    createTutorialTip() {
        const screens = [];

        screens.push(
            <div>
                <FormattedHTMLMessage
                    id='create_post.tutorialTip'
                    defaultMessage='<h4>Sending Messages</h4><p>Type here to write a message and press <strong>Enter</strong> to post it.</p><p>Click the <strong>Attachment</strong> button to upload an image or a file.</p>'
                />
            </div>
        );

        return (
            <TutorialTip
                id='postTextboxTipMessage'
                placement='top'
                screens={screens}
                overlayClass='tip-overlay--chat'
                diagnosticsTag='tutorial_tip_1_sending_messages'
            />
        );
    }

    handleEnableSendButton(message, fileInfos) {
        return message.trim().length !== 0 || fileInfos.length !== 0;
    }

    render() {
        const members = this.props.currentChannelMembersCount - 1;

        const notifyAllTitle = (
            <FormattedMessage
                id='notify_all.title.confirm'
                defaultMessage='Confirm sending notifications to entire channel'
            />
        );

        const notifyAllConfirm = (
            <FormattedMessage
                id='notify_all.confirm'
                defaultMessage='Confirm'
            />
        );

        const notifyAllMessage = (
            <FormattedMessage
                id='notify_all.question'
                defaultMessage='By using @all or @channel you are about to send notifications to {totalMembers} people. Are you sure you want to do this?'
                values={{
                    totalMembers: members
                }}
            />
        );

        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className='has-error'>
                    <label className='control-label'>{this.state.serverError}</label>
                </div>
            );
        }

        let postError = null;
        if (this.state.postError) {
            const postErrorClass = 'post-error' + (this.state.errorClass ? (' ' + this.state.errorClass) : '');
            postError = <label className={postErrorClass}>{this.state.postError}</label>;
        }

        let preview = null;
        if (this.props.draft.fileInfos.length > 0 || this.props.draft.uploadsInProgress.length > 0) {
            preview = (
                <FilePreview
                    fileInfos={this.props.draft.fileInfos}
                    onRemove={this.removePreview}
                    uploadsInProgress={this.props.draft.uploadsInProgress}
                />
            );
        }

        let postFooterClassName = 'post-create-footer';
        if (postError) {
            postFooterClassName += ' has-error';
        }

        let tutorialTip = null;
        if (parseInt(this.props.showTutorialTip, 10) === TutorialSteps.POST_POPOVER && global.window.mm_config.EnableTutorial === 'true') {
            tutorialTip = this.createTutorialTip();
        }

        let centerClass = '';
        if (!this.props.fullWidthTextBox) {
            centerClass = 'center';
        }

        let sendButtonClass = 'send-button theme';
        if (!this.state.enableSendButton) {
            sendButtonClass += ' disabled';
        }

        let attachmentsDisabled = '';
        if (!FileUtils.canUploadFiles()) {
            attachmentsDisabled = ' post-create--attachment-disabled';
        }

        const fileUpload = (
            <FileUpload
                ref='fileUpload'
                getFileCount={this.getFileCount}
                getTarget={this.getFileUploadTarget}
                onFileUploadChange={this.handleFileUploadChange}
                onUploadStart={this.handleUploadStart}
                onFileUpload={this.handleFileUploadComplete}
                onUploadError={this.handleUploadError}
                postType='post'
                channelId=''
            />
        );

        let emojiPicker = null;
        if (window.mm_config.EnableEmojiPicker === 'true') {
            emojiPicker = (
                <span className='emoji-picker__container'>
                    <EmojiPickerOverlay
                        show={this.state.showEmojiPicker}
                        container={this.props.getChannelView}
                        target={this.getCreatePostControls}
                        onHide={this.hideEmojiPicker}
                        onEmojiClick={this.handleEmojiClick}
                        rightOffset={15}
                        topOffset={-7}
                    />
                    <EmojiIcon
                        id='emojiPickerButton'
                        className={'icon icon--emoji ' + (this.state.showEmojiPicker ? 'active' : '')}
                        onClick={this.toggleEmojiPicker}
                    />
                </span>
            );
        }

        return (
            <form
                id='create_post'
                ref='topDiv'
                role='form'
                className={centerClass}
                onSubmit={this.handleSubmit}
            >
                <div className={'post-create' + attachmentsDisabled}>
                    <div className='post-create-body'>
                        <div className='post-body__cell'>
                            <Textbox
                                onChange={this.handleChange}
                                onKeyPress={this.postMsgKeyPress}
                                onKeyDown={this.handleKeyDown}
                                handlePostError={this.handlePostError}
                                value={this.state.message}
                                onBlur={this.handleBlur}
                                emojiEnabled={window.mm_config.EnableEmojiPicker === 'true'}
                                createMessage={Utils.localizeMessage('create_post.write', 'Write a message...')}
                                channelId={this.props.currentChannel.id}
                                popoverMentionKeyClick={true}
                                id='post_textbox'
                                ref='textbox'
                            />
                            <span
                                ref='createPostControls'
                                className='post-body__actions'
                            >
                                {fileUpload}
                                {emojiPicker}
                                <a
                                    className={sendButtonClass}
                                    onClick={this.handleSubmit}
                                >
                                    <i className='fa fa-paper-plane'/>
                                </a>
                            </span>
                        </div>
                        {tutorialTip}
                    </div>
                    <div
                        id='postCreateFooter'
                        className={postFooterClassName}
                    >
                        <MsgTyping
                            channelId={this.props.currentChannel.id}
                            parentId=''
                        />
                        {postError}
                        {preview}
                        {serverError}
                    </div>
                </div>
                <PostDeletedModal
                    show={this.state.showPostDeletedModal}
                    onHide={this.hidePostDeletedModal}
                />
                <ConfirmModal
                    title={notifyAllTitle}
                    message={notifyAllMessage}
                    confirmButtonText={notifyAllConfirm}
                    show={this.state.showConfirmModal}
                    onConfirm={this.handleNotifyAllConfirmation}
                    onCancel={this.hideNotifyAllModal}
                />
            </form>
        );
    }
}
