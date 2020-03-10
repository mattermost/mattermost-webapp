// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';

import {sortFileInfos} from 'mattermost-redux/utils/file_utils';

import * as GlobalActions from 'actions/global_actions.jsx';

import Constants, {Locations} from 'utils/constants';
import {intlShape} from 'utils/react_intl';
import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils.jsx';
import {containsAtChannel, postMessageOnKeyPress, shouldFocusMainTextbox, isErrorInvalidSlashCommand, splitMessageBasedOnCaretPosition} from 'utils/post_utils.jsx';
import {getTable, getPlainText, formatMarkdownTableMessage, isGitHubCodeBlock} from 'utils/paste';

import ConfirmModal from 'components/confirm_modal';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import FilePreview from 'components/file_preview';
import FileUpload from 'components/file_upload';
import MsgTyping from 'components/msg_typing';
import PostDeletedModal from 'components/post_deleted_modal';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import Textbox from 'components/textbox';
import TextboxLinks from 'components/textbox/textbox_links';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import MessageSubmitError from 'components/message_submit_error';

const KeyCodes = Constants.KeyCodes;

class CreateComment extends React.PureComponent {
    static propTypes = {

        /**
         * The channel for which this comment is a part of
         */
        channelId: PropTypes.string.isRequired,

        /**
         * The number of channel members
         */
        channelMembersCount: PropTypes.number.isRequired,

        /**
         * The id of the parent post
         */
        rootId: PropTypes.string.isRequired,

        /**
         * True if the root message was deleted
         */
        rootDeleted: PropTypes.bool.isRequired,

        /**
         * The current history message selected
         */
        messageInHistory: PropTypes.string,

        /**
         * The current draft of the comment
         */
        draft: PropTypes.shape({
            message: PropTypes.string.isRequired,
            uploadsInProgress: PropTypes.array.isRequired,
            fileInfos: PropTypes.array.isRequired,
        }).isRequired,

        /**
         * Whether the submit button is enabled
         */
        enableAddButton: PropTypes.bool.isRequired,

        /**
         * Force message submission on CTRL/CMD + ENTER
         */
        codeBlockOnCtrlEnter: PropTypes.bool,

        /**
         * Set to force form submission on CTRL/CMD + ENTER instead of ENTER
         */
        ctrlSend: PropTypes.bool,

        /**
         * The id of the latest post in this channel
         */
        latestPostId: PropTypes.string,
        locale: PropTypes.string.isRequired,

        /**
         * Create post error id
         */
        createPostErrorId: PropTypes.string,

        /**
         * Called to clear file uploads in progress
         */
        clearCommentDraftUploads: PropTypes.func.isRequired,

        intl: intlShape.isRequired,

        /**
         * Called when comment draft needs to be updated
         */
        onUpdateCommentDraft: PropTypes.func.isRequired,

        /**
         * Called when comment draft needs to be updated for an specific root ID
         */
        updateCommentDraftWithRootId: PropTypes.func.isRequired,

        /**
         * Called when submitting the comment
         */
        onSubmit: PropTypes.func.isRequired,

        /**
         * Called when resetting comment message history index
         */
        onResetHistoryIndex: PropTypes.func.isRequired,

        /**
         * Called when navigating back through comment message history
         */
        onMoveHistoryIndexBack: PropTypes.func.isRequired,

        /**
         * Called when navigating forward through comment message history
         */
        onMoveHistoryIndexForward: PropTypes.func.isRequired,

        /**
         * Called to initiate editing the user's latest post
         */
        onEditLatestPost: PropTypes.func.isRequired,

        /**
         * Function to get the users timezones in the channel
         */
        getChannelTimezones: PropTypes.func.isRequired,

        /**
         * Reset state of createPost request
         */
        resetCreatePostRequest: PropTypes.func.isRequired,

        /**
         * Set if channel is read only
         */
        readOnlyChannel: PropTypes.bool,

        /**
         * Set if @channel should warn in this channel.
         */
        enableConfirmNotificationsToChannel: PropTypes.bool.isRequired,

        /**
         * Set if the emoji picker is enabled.
         */
        enableEmojiPicker: PropTypes.bool.isRequired,

        /**
         * Set if the gif picker is enabled.
         */
        enableGifPicker: PropTypes.bool.isRequired,

        /**
         * Set if the connection may be bad to warn user
         */
        badConnection: PropTypes.bool.isRequired,

        /**
         * The maximum length of a post
         */
        maxPostSize: PropTypes.number.isRequired,
        rhsExpanded: PropTypes.bool.isRequired,

        /**
         * To check if the timezones are enable on the server.
         */
        isTimezoneEnabled: PropTypes.bool.isRequired,

        /**
         * The last time, if any, when the selected post changed. Will be 0 if no post selected.
         */
        selectedPostFocussedAt: PropTypes.number.isRequired,

        isMarkdownPreviewEnabled: PropTypes.bool.isRequired,

        /**
         * Function to set or unset emoji picker for last message
         */
        emitShortcutReactToLastPostFrom: PropTypes.func,

        canPost: PropTypes.bool.isRequired,

        /**
         * To determine if the current user can send special channel mentions
         */
        useChannelMentions: PropTypes.bool.isRequired,
    }

    static getDerivedStateFromProps(props, state) {
        let updatedState = {
            createPostErrorId: props.createPostErrorId,
            rootId: props.rootId,
            messageInHistory: props.messageInHistory,
            draft: state.draft || {...props.draft, caretPosition: props.draft.message.length, uploadsInProgress: []},
        };

        const rootChanged = props.rootId !== state.rootId;
        const messageInHistoryChanged = props.messageInHistory !== state.messageInHistory;
        if (rootChanged || messageInHistoryChanged) {
            updatedState = {...updatedState, draft: {...props.draft, uploadsInProgress: rootChanged ? [] : props.draft.uploadsInProgress}};
        }

        if (props.createPostErrorId === 'api.post.create_post.root_id.app_error' && props.createPostErrorId !== state.createPostErrorId) {
            updatedState = {...updatedState, showPostDeletedModal: true};
        }

        return updatedState;
    }

    constructor(props) {
        super(props);

        this.state = {
            showPostDeletedModal: false,
            showConfirmModal: false,
            showEmojiPicker: false,
            showPreview: false,
            channelTimezoneCount: 0,
            uploadsProgressPercent: {},
            renderScrollbar: false,
            suggestionListStyle: 'top',
        };

        this.lastBlurAt = 0;
        this.draftsForPost = {};
        this.doInitialScrollToBottom = false;
    }

    componentDidMount() {
        this.props.clearCommentDraftUploads();
        this.props.onResetHistoryIndex();
        this.focusTextbox();
        document.addEventListener('paste', this.pasteHandler);
        document.addEventListener('keydown', this.focusTextboxIfNecessary);

        // When draft.message is not empty, set doInitialScrollToBottom to true so that
        // on next component update, the actual this.scrollToBottom() will be called.
        // This is made so that the this.scrollToBottom() will be called only once.
        if (this.props.draft.message !== '') {
            this.doInitialScrollToBottom = true;
        }
    }

    componentWillUnmount() {
        this.props.resetCreatePostRequest();
        document.removeEventListener('paste', this.pasteHandler);
        document.removeEventListener('keydown', this.focusTextboxIfNecessary);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.draft.uploadsInProgress.length < this.state.draft.uploadsInProgress.length) {
            this.scrollToBottom();
        }

        // Focus on textbox when emoji picker is closed
        if (prevState.showEmojiPicker && !this.state.showEmojiPicker) {
            this.focusTextbox();
        }

        // Focus on textbox when returned from preview mode
        if (prevState.showPreview && !this.state.showPreview) {
            this.focusTextbox();
        }

        if (prevProps.rootId !== this.props.rootId || prevProps.selectedPostFocussedAt !== this.props.selectedPostFocussedAt) {
            this.focusTextbox();
        }

        if (this.doInitialScrollToBottom) {
            this.scrollToBottom();
            this.doInitialScrollToBottom = false;
        }
    }

    updatePreview = (newState) => {
        this.setState({showPreview: newState});
    }

    focusTextboxIfNecessary = (e) => {
        // Should only focus if RHS is expanded
        if (!this.props.rhsExpanded) {
            return;
        }

        // Bit of a hack to not steal focus from the channel switch modal if it's open
        // This is a special case as the channel switch modal does not enforce focus like
        // most modals do
        if (document.getElementsByClassName('channel-switch-modal').length) {
            return;
        }

        if (shouldFocusMainTextbox(e, document.activeElement)) {
            this.focusTextbox();
        }
    }

    pasteHandler = (e) => {
        if (!e.clipboardData || !e.clipboardData.items || e.target.id !== 'reply_textbox') {
            return;
        }

        const table = getTable(e.clipboardData);
        if (!table) {
            return;
        }

        e.preventDefault();

        const {draft} = this.state;
        let message = '';
        if (isGitHubCodeBlock(table.className)) {
            message = '```\n' + getPlainText(e.clipboardData) + '\n```';
        } else {
            message = formatMarkdownTableMessage(table, draft.message.trim());
        }

        const updatedDraft = {...draft, message};

        this.props.onUpdateCommentDraft(updatedDraft);
        this.setState({draft: updatedDraft});
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

        const {draft} = this.state;

        let newMessage = '';
        if (draft.message === '') {
            newMessage = `:${emojiAlias}: `;
        } else {
            const {draft: {message}} = this.state;
            const {firstPiece, lastPiece} = splitMessageBasedOnCaretPosition(this.state.caretPosition, message);

            // check whether the first piece of the message is empty when cursor is placed at beginning of message and avoid adding an empty string at the beginning of the message
            newMessage = firstPiece === '' ? `:${emojiAlias}: ${lastPiece} ` : `${firstPiece} :${emojiAlias}: ${lastPiece} `;

            const newCaretPosition = firstPiece === '' ? `:${emojiAlias}: `.length : `${firstPiece} :${emojiAlias}: `.length;

            const textbox = this.refs.textbox.getWrappedInstance().getInputBox();

            this.setState({
                caretPosition: newCaretPosition,
            }, () => {
                Utils.setCaretPosition(textbox, newCaretPosition);
            });
        }

        const modifiedDraft = {
            ...draft,
            message: newMessage,
        };

        this.props.onUpdateCommentDraft(modifiedDraft);
        this.draftsForPost[this.props.rootId] = modifiedDraft;

        this.setState({
            showEmojiPicker: false,
            draft: modifiedDraft,
        });
    }

    handleGifClick = (gif) => {
        const {draft} = this.state;

        let newMessage = '';
        if (draft.message === '') {
            newMessage = gif;
        } else if ((/\s+$/).test(draft.message)) {
            // Check whether there is already a blank at the end of the current message
            newMessage = `${draft.message}${gif} `;
        } else {
            newMessage = `${draft.message} ${gif} `;
        }

        const modifiedDraft = {
            ...draft,
            message: newMessage,
        };

        this.props.onUpdateCommentDraft(modifiedDraft);
        this.draftsForPost[this.props.rootId] = modifiedDraft;

        this.setState({
            showEmojiPicker: false,
            draft: modifiedDraft,
        });

        this.focusTextbox();
    }

    handlePostError = (postError) => {
        this.setState({postError});
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        this.updatePreview(false);

        const {channelMembersCount, enableConfirmNotificationsToChannel, useChannelMentions, isTimezoneEnabled} = this.props;
        const {draft} = this.state;
        if (!useChannelMentions && containsAtChannel(draft.message, {checkAllMentions: true})) {
            const updatedDraft = {
                ...draft,
                props: {
                    ...draft.props,
                    mentionHighlightDisabled: true,
                },
            };

            this.props.onUpdateCommentDraft(updatedDraft);
            this.setState({draft: updatedDraft});
        }

        if (enableConfirmNotificationsToChannel && useChannelMentions &&
            channelMembersCount > Constants.NOTIFY_ALL_MEMBERS &&
            containsAtChannel(this.state.draft.message)) {
            if (isTimezoneEnabled) {
                const {data} = await this.props.getChannelTimezones(this.props.channelId);
                if (data) {
                    this.setState({channelTimezoneCount: data.length});
                } else {
                    this.setState({channelTimezoneCount: 0});
                }
            }
            this.showNotifyAllModal();
            return;
        }

        await this.doSubmit(e);
    }

    doSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }

        const {draft} = this.state;
        const enableAddButton = this.shouldEnableAddButton();

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

        if (this.props.rootDeleted) {
            this.showPostDeletedModal();
            return;
        }

        const fasterThanHumanWillClick = 150;
        const forceFocus = (Date.now() - this.lastBlurAt < fasterThanHumanWillClick);
        this.focusTextbox(forceFocus);

        const serverError = this.state.serverError;
        let ignoreSlash = false;
        if (isErrorInvalidSlashCommand(serverError) && draft.message === serverError.submittedMessage) {
            ignoreSlash = true;
        }

        const options = {ignoreSlash};

        try {
            await this.props.onSubmit(options);

            this.setState({
                postError: null,
                serverError: null,
            });
        } catch (err) {
            if (isErrorInvalidSlashCommand(err)) {
                this.props.onUpdateCommentDraft(draft);
            }
            err.submittedMessage = draft.message;
            this.setState({serverError: err});
            return;
        }

        this.setState({draft: {...this.props.draft, uploadsInProgress: []}});
    }

    commentMsgKeyPress = (e) => {
        const {
            ctrlSend,
            codeBlockOnCtrlEnter,
        } = this.props;

        const {allowSending, withClosedCodeBlock, message} = postMessageOnKeyPress(e, this.state.draft.message, ctrlSend, codeBlockOnCtrlEnter, 0, 0, this.state.caretPosition);

        if (allowSending) {
            e.persist();
            if (this.refs.textbox) {
                this.refs.textbox.getWrappedInstance().blur();
            }

            if (withClosedCodeBlock && message) {
                const {draft} = this.state;
                const updatedDraft = {...draft, message};
                this.props.onUpdateCommentDraft(updatedDraft);
                this.setState({draft: updatedDraft}, () => this.handleSubmit(e));
                this.draftsForPost[this.props.rootId] = updatedDraft;
            } else {
                this.handleSubmit(e);
            }

            this.updatePreview(false);
            setTimeout(() => {
                this.focusTextbox();
            });
        }

        this.emitTypingEvent();
    }

    reactToLastMessage = (e) => {
        e.preventDefault();

        const {emitShortcutReactToLastPostFrom} = this.props;

        // Here we are not handling conditions such as check for modals,  popups etc as shortcut is only trigger on
        // textbox input focus. Since all of them will already be closed as soon as they loose focus.
        emitShortcutReactToLastPostFrom(Locations.RHS_ROOT);
    }

    emitTypingEvent = () => {
        const {channelId, rootId} = this.props;
        GlobalActions.emitLocalUserTypingEvent(channelId, rootId);
    }

    scrollToBottom = () => {
        const $el = $('.post-right__scroll');
        if ($el[0]) {
            $el.parent().scrollTop($el[0].scrollHeight);
        }
    }

    handleChange = (e) => {
        const message = e.target.value;

        let serverError = this.state.serverError;
        if (isErrorInvalidSlashCommand(serverError)) {
            serverError = null;
        }

        const {draft} = this.state;
        const updatedDraft = {...draft, message};
        this.props.onUpdateCommentDraft(updatedDraft);
        this.setState({draft: updatedDraft, serverError}, () => {
            this.scrollToBottom();
        });
        this.draftsForPost[this.props.rootId] = updatedDraft;
    }

    handleMouseUpKeyUp = (e) => {
        const caretPosition = Utils.getCaretPosition(e.target);
        this.setState({
            caretPosition,
        });
    }

    handleKeyDown = (e) => {
        const ctrlOrMetaKeyPressed = e.ctrlKey || e.metaKey;
        const lastMessageReactionKeyCombo = ctrlOrMetaKeyPressed && e.shiftKey && Utils.isKeyPressed(e, KeyCodes.BACK_SLASH);

        if (
            (this.props.ctrlSend || this.props.codeBlockOnCtrlEnter) &&
            Utils.isKeyPressed(e, Constants.KeyCodes.ENTER) &&
            (e.ctrlKey || e.metaKey)
        ) {
            this.updatePreview(false);
            this.commentMsgKeyPress(e);
            return;
        }

        const {draft} = this.state;
        const {message} = draft;

        if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && Utils.isKeyPressed(e, Constants.KeyCodes.UP) && message === '') {
            e.preventDefault();
            if (this.refs.textbox) {
                this.refs.textbox.getWrappedInstance().blur();
            }

            const {data: canEditNow} = this.props.onEditLatestPost();
            if (!canEditNow) {
                this.focusTextbox(true);
            }
        }

        if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey) {
            if (Utils.isKeyPressed(e, Constants.KeyCodes.UP)) {
                e.preventDefault();
                this.props.onMoveHistoryIndexBack();
            } else if (Utils.isKeyPressed(e, Constants.KeyCodes.DOWN)) {
                e.preventDefault();
                this.props.onMoveHistoryIndexForward();
            }
        }

        if (lastMessageReactionKeyCombo) {
            this.reactToLastMessage(e);
        }
    }

    handleFileUploadChange = () => {
        this.focusTextbox();
    }

    handleUploadStart = (clientIds) => {
        const {draft} = this.state;
        const uploadsInProgress = [...draft.uploadsInProgress, ...clientIds];

        const modifiedDraft = {
            ...draft,
            uploadsInProgress,
        };
        this.props.onUpdateCommentDraft(modifiedDraft);
        this.setState({draft: modifiedDraft});
        this.draftsForPost[this.props.rootId] = modifiedDraft;

        // this is a bit redundant with the code that sets focus when the file input is clicked,
        // but this also resets the focus after a drag and drop
        this.focusTextbox();
    }

    handleUploadProgress = ({clientId, name, percent, type}) => {
        const uploadsProgressPercent = {...this.state.uploadsProgressPercent, [clientId]: {percent, name, type}};
        this.setState({uploadsProgressPercent});
    }

    handleFileUploadComplete = (fileInfos, clientIds, channelId, rootId) => {
        const draft = this.draftsForPost[rootId];
        const uploadsInProgress = [...draft.uploadsInProgress];
        const newFileInfos = sortFileInfos([...draft.fileInfos, ...fileInfos], this.props.locale);

        // remove each finished file from uploads
        for (let i = 0; i < clientIds.length; i++) {
            const index = uploadsInProgress.indexOf(clientIds[i]);

            if (index !== -1) {
                uploadsInProgress.splice(index, 1);
            }
        }

        const modifiedDraft = {
            ...draft,
            fileInfos: newFileInfos,
            uploadsInProgress,
        };
        this.props.updateCommentDraftWithRootId(rootId, modifiedDraft);
        this.draftsForPost[rootId] = modifiedDraft;
        if (this.props.rootId === rootId) {
            this.setState({draft: modifiedDraft});
        }
    }

    handleUploadError = (err, clientId = -1, currentChannelId, rootId = -1) => {
        if (clientId !== -1) {
            const draft = {...this.draftsForPost[rootId]};
            const uploadsInProgress = [...draft.uploadsInProgress];

            const index = uploadsInProgress.indexOf(clientId);
            if (index !== -1) {
                uploadsInProgress.splice(index, 1);
            }

            const modifiedDraft = {
                ...draft,
                uploadsInProgress,
            };
            this.props.updateCommentDraftWithRootId(rootId, modifiedDraft);
            this.draftsForPost[rootId] = modifiedDraft;
            if (this.props.rootId === rootId) {
                this.setState({draft: modifiedDraft});
            }
        }

        let serverError = err;
        if (err && typeof err === 'string') {
            serverError = new Error(err);
        }

        this.setState({serverError}, () => {
            if (serverError) {
                this.scrollToBottom();
            }
        });
    }

    removePreview = (id) => {
        const {draft} = this.state;
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

                if (this.refs.fileUpload && this.refs.fileUpload.getWrappedInstance()) {
                    this.refs.fileUpload.getWrappedInstance().cancelUpload(id);
                }
            }
        } else {
            fileInfos.splice(index, 1);
        }

        const modifiedDraft = {
            ...draft,
            fileInfos,
            uploadsInProgress,
        };

        this.props.onUpdateCommentDraft(modifiedDraft);
        this.setState({draft: modifiedDraft});
        this.draftsForPost[this.props.rootId] = modifiedDraft;

        this.handleFileUploadChange();
    }

    getFileCount = () => {
        const {
            draft: {
                fileInfos,
                uploadsInProgress,
            },
        } = this.state;
        return fileInfos.length + uploadsInProgress.length;
    }

    getFileUploadTarget = () => {
        return this.refs.textbox.getWrappedInstance();
    }

    getCreateCommentControls = () => {
        return this.refs.createCommentControls;
    }

    shouldEnableAddButton = () => {
        if (this.props.enableAddButton) {
            return true;
        }

        return isErrorInvalidSlashCommand(this.state.serverError);
    }

    focusTextbox = (keepFocus = false) => {
        if (this.refs.textbox && (keepFocus || !UserAgent.isMobile())) {
            this.refs.textbox.getWrappedInstance().focus();
        }
    }

    showPostDeletedModal = () => {
        this.setState({
            showPostDeletedModal: true,
        });
    }

    hidePostDeletedModal = () => {
        this.setState({
            showPostDeletedModal: false,
        });

        this.props.resetCreatePostRequest();
    }

    handleBlur = () => {
        this.lastBlurAt = Date.now();
    }

    handleHeightChange = (height, maxHeight) => {
        this.setState({renderScrollbar: height > maxHeight});
    }

    render() {
        const {draft} = this.state;
        const readOnlyChannel = this.props.readOnlyChannel || !this.props.canPost;
        const {formatMessage} = this.props.intl;
        const enableAddButton = this.shouldEnableAddButton();
        const {renderScrollbar} = this.state;
        const ariaLabelReplyInput = Utils.localizeMessage('accessibility.sections.rhsFooter', 'reply input region');

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

        let notifyAllMessage = '';
        if (this.state.channelTimezoneCount && this.props.isTimezoneEnabled) {
            notifyAllMessage = (
                <FormattedMarkdownMessage
                    id='notify_all.question_timezone'
                    defaultMessage='By using @all or @channel you are about to send notifications to **{totalMembers} people** in **{timezones, number} {timezones, plural, one {timezone} other {timezones}}**. Are you sure you want to do this?'
                    values={{
                        totalMembers: this.props.channelMembersCount - 1,
                        timezones: this.state.channelTimezoneCount,
                    }}
                />
            );
        } else {
            notifyAllMessage = (
                <FormattedMessage
                    id='notify_all.question'
                    defaultMessage='By using @all or @channel you are about to send notifications to {totalMembers} people. Are you sure you want to do this?'
                    values={{
                        totalMembers: this.props.channelMembersCount - 1,
                    }}
                />
            );
        }

        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <MessageSubmitError
                    id='postServerError'
                    error={this.state.serverError}
                    submittedMessage={this.state.serverError.submittedMessage}
                    handleSubmit={this.handleSubmit}
                />
            );
        }

        let postError = null;
        if (this.state.postError) {
            const postErrorClass = 'post-error' + (this.state.errorClass ? (' ' + this.state.errorClass) : '');
            postError = <label className={postErrorClass}>{this.state.postError}</label>;
        }

        let preview = null;
        if (!readOnlyChannel && (draft.fileInfos.length > 0 || draft.uploadsInProgress.length > 0)) {
            preview = (
                <FilePreview
                    fileInfos={draft.fileInfos}
                    onRemove={this.removePreview}
                    uploadsInProgress={draft.uploadsInProgress}
                    uploadsProgressPercent={this.state.uploadsProgressPercent}
                    ref='preview'
                />
            );
        }

        let uploadsInProgressText = null;
        if (draft.uploadsInProgress.length > 0) {
            uploadsInProgressText = (
                <span className='post-right-comments-upload-in-progress'>
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

        let addButtonClass = 'btn btn-primary comment-btn';
        if (!enableAddButton) {
            addButtonClass += ' disabled';
        }

        let fileUpload;
        if (!readOnlyChannel && !this.state.showPreview) {
            fileUpload = (
                <FileUpload
                    ref='fileUpload'
                    fileCount={this.getFileCount()}
                    getTarget={this.getFileUploadTarget}
                    onFileUploadChange={this.handleFileUploadChange}
                    onUploadStart={this.handleUploadStart}
                    onFileUpload={this.handleFileUploadComplete}
                    onUploadError={this.handleUploadError}
                    onUploadProgress={this.handleUploadProgress}
                    rootId={this.props.rootId}
                    postType='comment'
                />
            );
        }

        let emojiPicker = null;
        const emojiButtonAriaLabel = formatMessage({id: 'emoji_picker.emojiPicker', defaultMessage: 'Emoji Picker'}).toLowerCase();

        if (this.props.enableEmojiPicker && !readOnlyChannel && !this.state.showPreview) {
            emojiPicker = (
                <div>
                    <EmojiPickerOverlay
                        show={this.state.showEmojiPicker}
                        target={this.getCreateCommentControls}
                        onHide={this.hideEmojiPicker}
                        onEmojiClose={this.hideEmojiPicker}
                        onEmojiClick={this.handleEmojiClick}
                        onGifClick={this.handleGifClick}
                        enableGifPicker={this.props.enableGifPicker}
                        topOffset={55}
                    />
                    <button
                        aria-label={emojiButtonAriaLabel}
                        type='button'
                        onClick={this.toggleEmojiPicker}
                        className='style--none emoji-picker__container post-action'
                    >
                        <EmojiIcon className={'icon icon--emoji emoji-rhs ' + (this.state.showEmojiPicker ? 'active' : '')}/>
                    </button>
                </div>
            );
        }

        let createMessage;
        if (readOnlyChannel) {
            createMessage = Utils.localizeMessage('create_post.read_only', 'This channel is read-only. Only members with permission can post here.');
        } else {
            createMessage = Utils.localizeMessage('create_comment.addComment', 'Add a comment...');
        }

        let scrollbarClass = '';
        if (renderScrollbar) {
            scrollbarClass = ' scroll';
        }

        const textboxRef = this.refs.textbox;
        if (textboxRef) {
            const textboxPosTop = textboxRef.getWrappedInstance().getInputBox().getBoundingClientRect().top;
            if (textboxPosTop < Constants.SUGGESTION_LIST_SPACE_RHS) {
                this.setState({suggestionListStyle: 'bottom'});
            } else {
                this.setState({suggestionListStyle: 'top'});
            }
        }

        return (
            <form onSubmit={this.handleSubmit}>
                <div
                    role='form'
                    id='rhsFooter'
                    aria-label={ariaLabelReplyInput}
                    tabIndex='-1'
                    className={`post-create a11y__region${scrollbarClass}`}
                    data-a11y-sort-order='4'
                >
                    <div
                        id={this.props.rootId}
                        className='post-create-body comment-create-body'
                    >
                        <div className='post-body__cell'>
                            <Textbox
                                onChange={this.handleChange}
                                onKeyPress={this.commentMsgKeyPress}
                                onKeyDown={this.handleKeyDown}
                                onMouseUp={this.handleMouseUpKeyUp}
                                onKeyUp={this.handleMouseUpKeyUp}
                                onComposition={this.emitTypingEvent}
                                onHeightChange={this.handleHeightChange}
                                handlePostError={this.handlePostError}
                                value={readOnlyChannel ? '' : draft.message}
                                onBlur={this.handleBlur}
                                createMessage={createMessage}
                                emojiEnabled={this.props.enableEmojiPicker}
                                initialText=''
                                channelId={this.props.channelId}
                                isRHS={true}
                                popoverMentionKeyClick={true}
                                id='reply_textbox'
                                ref='textbox'
                                disabled={readOnlyChannel}
                                characterLimit={this.props.maxPostSize}
                                preview={this.state.showPreview}
                                suggestionListStyle={this.state.suggestionListStyle}
                                badConnection={this.props.badConnection}
                                listenForMentionKeyClick={true}
                                useChannelMentions={this.props.useChannelMentions}
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
                    <div
                        className='post-create-footer'
                    >
                        <div className='d-flex justify-content-between'>
                            <div className='col'>
                                <MsgTyping
                                    channelId={this.props.channelId}
                                    postId={this.props.rootId}
                                />
                                {postError}
                            </div>
                            <div className='col col-auto'>
                                <TextboxLinks
                                    characterLimit={this.props.maxPostSize}
                                    showPreview={this.state.showPreview}
                                    updatePreview={this.updatePreview}
                                    message={readOnlyChannel ? '' : this.state.message}
                                    isMarkdownPreviewEnabled={this.props.isMarkdownPreviewEnabled}
                                />
                            </div>
                        </div>
                        <div className='text-right mt-2'>
                            {uploadsInProgressText}
                            <input
                                type='button'
                                disabled={!enableAddButton}
                                id='addCommentButton'
                                className={addButtonClass}
                                value={formatMessage({id: 'create_comment.comment', defaultMessage: 'Add Comment'})}
                                onClick={this.handleSubmit}
                            />
                            {preview}
                            {serverError}
                        </div>
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

export default injectIntl(CreateComment);
