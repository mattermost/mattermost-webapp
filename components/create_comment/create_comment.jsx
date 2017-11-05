// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import * as ChannelActions from 'actions/channel_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import * as PostActions from 'actions/post_actions.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import EmojiStore from 'stores/emoji_store.jsx';
import MessageHistoryStore from 'stores/message_history_store.jsx';
import PostStore from 'stores/post_store.jsx';

import Constants from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';

import {REACTION_PATTERN} from 'components/create_post.jsx';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import FilePreview from 'components/file_preview.jsx';
import FileUpload from 'components/file_upload.jsx';
import MsgTyping from 'components/msg_typing.jsx';
import PostDeletedModal from 'components/post_deleted_modal.jsx';
import Textbox from 'components/textbox.jsx';

const ActionTypes = Constants.ActionTypes;
const KeyCodes = Constants.KeyCodes;

export default class CreateComment extends React.PureComponent {
    static propTypes = {
        userId: PropTypes.string.isRequired,
        teamId: PropTypes.string.isRequired,
        channelId: PropTypes.string.isRequired,
        rootId: PropTypes.string.isRequired,
        draft: PropTypes.shape({
            message: PropTypes.string.isRequired,
            uploadsInProgress: PropTypes.array.isRequired,
            fileInfos: PropTypes.array.isRequired
        }).isRequired,
        enableAddButton: PropTypes.bool.isRequired,
        ctrlSend: PropTypes.bool,
        latestPostId: PropTypes.string,
        getSidebarBody: PropTypes.func,
        createPostErrorId: PropTypes.string
    }

    constructor(props) {
        super(props);

        this.state = {
            showPostDeletedModal: false,
            showEmojiPicker: false
        };

        this.lastBlurAt = 0;
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

        const {draft, rootId} = this.props;

        const newMessage = (function getNewMessage() {
            if (draft.message === '') {
                return `:${emojiAlias}: `;
            }

            // Check whether there is already a blank at the end of the current message
            if ((/\s+$/).test(draft.message)) {
                return `${draft.message}:${emojiAlias}: `;
            }

            return `${draft.message} :${emojiAlias}: `;
        }());

        PostActions.updateCommentDraft(rootId, {...draft, message: newMessage});

        this.setState({showEmojiPicker: false});

        this.focusTextbox();
    }

    componentWillMount() {
        PostStore.clearCommentDraftUploads();
        MessageHistoryStore.resetHistoryIndex('comment');
    }

    componentDidMount() {
        this.focusTextbox();
    }

    componentWillReceiveProps(newProps) {
        if (newProps.createPostErrorId === 'api.post.create_post.root_id.app_error' && newProps.createPostErrorId !== this.props.createPostErrorId) {
            this.showPostDeletedModal();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.draft.uploadsInProgress.length < this.props.draft.uploadsInProgress.length) {
            $('.post-right__scroll').scrollTop($('.post-right__scroll')[0].scrollHeight);
        }

        if (prevProps.rootId !== this.props.rootId) {
            this.focusTextbox();
        }
    }

    handlePostError = (postError) => {
        this.setState({postError});
    }

    handleSubmit = (e) => {
        e.preventDefault();

        const {draft, enableAddButton} = this.props;
        const {message} = draft;

        if (!enableAddButton) {
            return;
        }

        if (draft.uploadsInProgress.length > 0) {
            return;
        }

        if (this.state.postError) {
            this.setState({errorClass: 'animation--highlight'});
            setTimeout(() => {
                this.setState({errorClass: null});
            }, Constants.ANIMATION_TIMEOUT);
            return;
        }

        MessageHistoryStore.storeMessageInHistory(message);

        const isReaction = REACTION_PATTERN.exec(message);
        if (isReaction && EmojiStore.has(isReaction[2])) {
            this.handleSubmitReaction(isReaction);
        } else if (message.indexOf('/') === 0) {
            this.handleSubmitCommand();
        } else {
            this.handleSubmitPost();
        }

        this.setState({
            postError: null,
            serverError: null
        });

        const fasterThanHumanWillClick = 150;
        const forceFocus = (Date.now() - this.lastBlurAt < fasterThanHumanWillClick);
        this.focusTextbox(forceFocus);
    }

    handleSubmitCommand = () => {
        PostActions.updateCommentDraft(this.props.rootId, null);

        this.setState({
            postError: null
        });

        const args = {
            channel_id: this.props.channelId,
            team_id: this.props.teamId,
            root_id: this.props.rootId,
            parent_id: this.props.rootId
        };

        const {
            draft: {
                message
            }
        } = this.props;

        ChannelActions.executeCommand(
            message,
            args,
            null,
            (err) => {
                if (err.sendMessage) {
                    this.handleSubmitPost();
                } else {
                    this.setState({serverError: err.message});
                }
            }
        );
    }

    handleSubmitPost = () => {
        const {userId, channelId, rootId, draft} = this.props;
        const time = Utils.getTimestamp();

        const post = {
            file_ids: [],
            message: draft.message,
            channel_id: channelId,
            root_id: rootId,
            parent_id: rootId,
            pending_post_id: `${userId}:${time}`,
            user_id: userId,
            create_at: time
        };

        GlobalActions.emitUserCommentedEvent(post);

        PostActions.createPost(post, draft.fileInfos);

        this.setState({
            postError: null,
            serverError: null
        });

        const fasterThanHumanWillClick = 150;
        const forceFocus = (Date.now() - this.lastBlurAt < fasterThanHumanWillClick);
        this.focusTextbox(forceFocus);
    }

    handleSubmitReaction = (isReaction) => {
        const action = isReaction[1];

        const emojiName = isReaction[2];
        const postId = this.props.latestPostId;

        if (action === '+') {
            PostActions.addReaction(this.props.channelId, postId, emojiName);
        } else if (action === '-') {
            PostActions.removeReaction(this.props.channelId, postId, emojiName);
        }

        PostActions.updateCommentDraft(this.props.rootId, null);
    }

    commentMsgKeyPress = (e) => {
        if (!UserAgent.isMobile() && ((this.props.ctrlSend && e.ctrlKey) || !this.props.ctrlSend)) {
            if (e.which === KeyCodes.ENTER && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                ReactDOM.findDOMNode(this.refs.textbox).blur();
                this.handleSubmit(e);
            }
        }

        GlobalActions.emitLocalUserTypingEvent(this.props.channelId, this.props.rootId);
    }

    handleChange = (e) => {
        const message = e.target.value;

        const {draft, rootId} = this.props;
        const updatedDraft = {...draft, message};
        PostActions.updateCommentDraft(rootId, updatedDraft);

        $('.post-right__scroll').parent().scrollTop($('.post-right__scroll')[0].scrollHeight);
    }

    handleKeyDown = (e) => {
        if (this.props.ctrlSend && e.keyCode === KeyCodes.ENTER && e.ctrlKey) {
            this.commentMsgKeyPress(e);
            return;
        }

        const {draft} = this.props;
        const {message} = draft;

        if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && e.keyCode === KeyCodes.UP && message === '') {
            e.preventDefault();

            const lastPost = PostStore.getCurrentUsersLatestPost(this.props.channelId, this.props.rootId);
            if (!lastPost) {
                return;
            }

            AppDispatcher.handleViewAction({
                type: ActionTypes.RECEIVED_EDIT_POST,
                refocusId: '#reply_textbox',
                title: Utils.localizeMessage('create_comment.commentTitle', 'Comment'),
                message: lastPost.message,
                postId: lastPost.id,
                channelId: lastPost.channel_id,
                comments: PostStore.getCommentCount(lastPost)
            });
        }

        if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.keyCode === Constants.KeyCodes.UP || e.keyCode === Constants.KeyCodes.DOWN)) {
            const lastMessage = MessageHistoryStore.nextMessageInHistory(e.keyCode, message, 'comment');
            if (lastMessage !== null) {
                e.preventDefault();
                PostActions.updateCommentDraft(this.props.rootId, {...draft, message: lastMessage});
            }
        }
    }

    handleFileUploadChange = () => {
        this.focusTextbox();
    }

    handleUploadStart = (clientIds) => {
        const {draft} = this.props;
        const uploadsInProgress = [...draft.uploadsInProgress, ...clientIds];

        PostActions.updateCommentDraft(this.props.rootId, {...draft, uploadsInProgress});

        // this is a bit redundant with the code that sets focus when the file input is clicked,
        // but this also resets the focus after a drag and drop
        this.focusTextbox();
    }

    handleFileUploadComplete = (fileInfos, clientIds) => {
        const {draft} = this.props;
        const uploadsInProgress = [...draft.uploadsInProgress];
        const newFileInfos = [...draft.fileInfos, ...fileInfos];

        // remove each finished file from uploads
        for (let i = 0; i < clientIds.length; i++) {
            const index = uploadsInProgress.indexOf(clientIds[i]);

            if (index !== -1) {
                uploadsInProgress.splice(index, 1);
            }
        }

        PostActions.updateCommentDraft(this.props.rootId, {...draft, fileInfos: newFileInfos, uploadsInProgress});

        // Focus on preview if needed/possible - if user has switched teams since starting the file upload,
        // the preview will be undefined and the switch will fail
        if (typeof this.refs.preview != 'undefined' && this.refs.preview) {
            this.refs.preview.refs.container.scrollIntoView();
        }
    }

    handleUploadError = (err, clientId) => {
        if (clientId !== -1) {
            const {draft} = this.props;
            const uploadsInProgress = [...draft.uploadsInProgress];

            const index = uploadsInProgress.indexOf(clientId);
            if (index !== -1) {
                uploadsInProgress.splice(index, 1);
            }

            PostActions.updateCommentDraft(this.props.rootId, {...draft, uploadsInProgress});
        }

        this.setState({serverError: err});
    }

    removePreview = (id) => {
        const {draft} = this.props;
        const fileInfos = [...draft.fileInfos];
        const uploadsInProgress = [...draft.uploadsInProgress];

        // Clear previous errors
        this.handleUploadError(null);

        // id can either be the id of an uploaded file or the client id of an in progress upload
        let index = fileInfos.findIndex((info) => info.id === id);
        if (index === -1) {
            index = uploadsInProgress.indexOf(id);

            if (index !== -1) {
                uploadsInProgress.splice(index, 1);
                this.refs.fileUpload.getWrappedInstance().cancelUpload(id);
            }
        } else {
            fileInfos.splice(index, 1);
        }

        PostActions.updateCommentDraft(this.props.rootId, {...draft, fileInfos, uploadsInProgress});

        this.handleFileUploadChange();
    }

    getFileCount = () => {
        const {
            draft: {
                fileInfos,
                uploadsInProgress
            }
        } = this.props;
        return fileInfos.length + uploadsInProgress.length;
    }

    getFileUploadTarget = () => {
        return this.refs.textbox;
    }

    getCreateCommentControls = () => {
        return this.refs.createCommentControls;
    }

    focusTextbox = (keepFocus = false) => {
        if (keepFocus || !UserAgent.isMobile()) {
            this.refs.textbox.focus();
        }
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

    handleBlur = () => {
        this.lastBlurAt = Date.now();
    }

    render() {
        const {draft} = this.props;

        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className='form-group has-error'>
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
        if (draft.fileInfos.length > 0 || draft.uploadsInProgress.length > 0) {
            preview = (
                <FilePreview
                    fileInfos={draft.fileInfos}
                    onRemove={this.removePreview}
                    uploadsInProgress={draft.uploadsInProgress}
                    ref='preview'
                />
            );
        }

        let uploadsInProgressText = null;
        if (draft.uploadsInProgress.length > 0) {
            uploadsInProgressText = (
                <span className='pull-right post-right-comments-upload-in-progress'>
                    {draft.uploadsInProgress.length === 1 ? (
                        <FormattedMessage
                            id='create_comment.file'
                            defaultMessage='File uploading'
                        />
                    ) : (
                        <FormattedMessage
                            id='create_comment.files'
                            defaultMessage='Files uploading'
                        />
                    )}
                </span>
            );
        }

        let addButtonClass = 'btn btn-primary comment-btn pull-right';
        if (!this.props.enableAddButton) {
            addButtonClass += ' disabled';
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
                postType='comment'
                channelId={this.props.channelId}
            />
        );

        let emojiPicker = null;
        if (window.mm_config.EnableEmojiPicker === 'true') {
            emojiPicker = (
                <span className='emoji-picker__container'>
                    <EmojiPickerOverlay
                        show={this.state.showEmojiPicker}
                        container={this.props.getSidebarBody}
                        target={this.getCreateCommentControls}
                        onHide={this.hideEmojiPicker}
                        onEmojiClick={this.handleEmojiClick}
                        rightOffset={15}
                        topOffset={55}
                    />
                    <span
                        className={'icon icon--emoji emoji-rhs ' + (this.state.showEmojiPicker ? 'active' : '')}
                        dangerouslySetInnerHTML={{__html: Constants.EMOJI_ICON_SVG}}
                        onClick={this.toggleEmojiPicker}
                    />
                </span>
            );
        }

        return (
            <form onSubmit={this.handleSubmit}>
                <div className='post-create'>
                    <div
                        id={this.props.rootId}
                        className='post-create-body comment-create-body'
                    >
                        <div className='post-body__cell'>
                            <Textbox
                                onChange={this.handleChange}
                                onKeyPress={this.commentMsgKeyPress}
                                onKeyDown={this.handleKeyDown}
                                handlePostError={this.handlePostError}
                                value={draft.message}
                                onBlur={this.handleBlur}
                                createMessage={Utils.localizeMessage('create_comment.addComment', 'Add a comment...')}
                                emojiEnabled={window.mm_config.EnableEmojiPicker === 'true'}
                                initialText=''
                                channelId={this.props.channelId}
                                isRHS={true}
                                popoverMentionKeyClick={true}
                                id='reply_textbox'
                                ref='textbox'
                            />
                            <span
                                ref='createCommentControls'
                                className='post-body__actions'
                            >
                                {fileUpload}
                                {emojiPicker}
                            </span>
                        </div>
                    </div>
                    <MsgTyping
                        channelId={this.props.channelId}
                        parentId={this.props.rootId}
                    />
                    <div className='post-create-footer'>
                        <input
                            type='button'
                            className={addButtonClass}
                            value={Utils.localizeMessage('create_comment.comment', 'Add Comment')}
                            onClick={this.handleSubmit}
                        />
                        {uploadsInProgressText}
                        {postError}
                        {preview}
                        {serverError}
                    </div>
                </div>
                <PostDeletedModal
                    show={this.state.showPostDeletedModal}
                    onHide={this.hidePostDeletedModal}
                />
            </form>
        );
    }
}
