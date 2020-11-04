// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import {FormattedMessage, injectIntl} from 'react-intl';

import {Posts} from 'mattermost-redux/constants';
import {sortFileInfos} from 'mattermost-redux/utils/file_utils';

import * as GlobalActions from 'actions/global_actions.jsx';
import Constants, {StoragePrefixes, ModalIdentifiers, Locations, A11yClassNames} from 'utils/constants';
import {t} from 'utils/i18n';
import {
    containsAtChannel,
    postMessageOnKeyPress,
    shouldFocusMainTextbox,
    isErrorInvalidSlashCommand,
    splitMessageBasedOnCaretPosition,
    groupsMentionedInText,
} from 'utils/post_utils.jsx';
import {getTable, formatMarkdownTableMessage, formatGithubCodePaste, isGitHubCodeBlock} from 'utils/paste';
import {intlShape} from 'utils/react_intl';
import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils.jsx';

import ConfirmModal from 'components/confirm_modal';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import EditChannelPurposeModal from 'components/edit_channel_purpose_modal';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import FilePreview from 'components/file_preview';
import FileUpload from 'components/file_upload';
import CallButton from 'components/call_button';
import LocalizedIcon from 'components/localized_icon';
import MsgTyping from 'components/msg_typing';
import PostDeletedModal from 'components/post_deleted_modal';
import ResetStatusModal from 'components/reset_status_modal';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import Textbox from 'components/textbox';
import TextboxLinks from 'components/textbox/textbox_links';
import TutorialTip from 'components/tutorial/tutorial_tip';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import MessageSubmitError from 'components/message_submit_error';

const KeyCodes = Constants.KeyCodes;

// Temporary fix for IE-11, see MM-13423
function trimRight(str) {
    if (String.prototype.trimRight) {
        return str.trimRight();
    }

    return str.replace(/\s*$/, '');
}

class CreatePost extends React.PureComponent {
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
         * Force message submission on CTRL/CMD + ENTER
         */
        codeBlockOnCtrlEnter: PropTypes.bool,

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
        showTutorialTip: PropTypes.bool.isRequired,

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
            fileInfos: PropTypes.array.isRequired,
        }).isRequired,

        /**
         *  Data used dispatching handleViewAction
         */
        commentCountForPost: PropTypes.number,

        /**
         *  Data used dispatching handleViewAction ex: edit post
         */
        latestReplyablePostId: PropTypes.string,
        locale: PropTypes.string.isRequired,

        /**
         *  Data used for calling edit of post
         */
        currentUsersLatestPost: PropTypes.object,

        /**
         *  Set if the channel is read only.
         */
        readOnlyChannel: PropTypes.bool,

        /**
         * Whether or not file upload is allowed.
         */
        canUploadFiles: PropTypes.bool.isRequired,

        /**
         * Whether to show the emoji picker.
         */
        enableEmojiPicker: PropTypes.bool.isRequired,

        /**
         * Whether to show the gif picker.
         */
        enableGifPicker: PropTypes.bool.isRequired,

        /**
         * Whether to check with the user before notifying the whole channel.
         */
        enableConfirmNotificationsToChannel: PropTypes.bool.isRequired,

        /**
         * The maximum length of a post
         */
        maxPostSize: PropTypes.number.isRequired,
        emojiMap: PropTypes.object.isRequired,

        /**
         * If our connection is bad
         */
        badConnection: PropTypes.bool.isRequired,

        /**
         * Whether to display a confirmation modal to reset status.
         */
        userIsOutOfOffice: PropTypes.bool.isRequired,
        rhsExpanded: PropTypes.bool.isRequired,

        /**
         * To check if the timezones are enable on the server.
         */
        isTimezoneEnabled: PropTypes.bool.isRequired,

        canPost: PropTypes.bool.isRequired,

        /**
         * To determine if the current user can send special channel mentions
         */
        useChannelMentions: PropTypes.bool.isRequired,

        intl: intlShape.isRequired,

        /**
         * Should preview be showed
         */
        shouldShowPreview: PropTypes.bool.isRequired,

        actions: PropTypes.shape({

            /**
             * Set show preview for textbox
             */
            setShowPreview: PropTypes.func.isRequired,

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
             *  func called for adding a reaction
             */
            addReaction: PropTypes.func.isRequired,

            /**
             *  func called for posting message
             */
            onSubmitPost: PropTypes.func.isRequired,

            /**
             *  func called for removing a reaction
             */
            removeReaction: PropTypes.func.isRequired,

            /**
             *  func called on load of component to clear drafts
             */
            clearDraftUploads: PropTypes.func.isRequired,

            /**
             * hooks called before a message is sent to the server
             */
            runMessageWillBePostedHooks: PropTypes.func.isRequired,

            /**
             * hooks called before a slash command is sent to the server
             */
            runSlashCommandWillBePostedHooks: PropTypes.func.isRequired,

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
            selectPostFromRightHandSideSearchByPostId: PropTypes.func.isRequired,

            /**
             * Function to open a modal
             */
            openModal: PropTypes.func.isRequired,

            executeCommand: PropTypes.func.isRequired,

            /**
             * Function to get the users timezones in the channel
             */
            getChannelTimezones: PropTypes.func.isRequired,
            scrollPostListToBottom: PropTypes.func.isRequired,

            /**
             * Function to set or unset emoji picker for last message
             */
            emitShortcutReactToLastPostFrom: PropTypes.func,

            getChannelMemberCountsByGroup: PropTypes.func,
        }).isRequired,

        groupsWithAllowReference: PropTypes.object,
        channelMemberCountsByGroup: PropTypes.object,
        useGroupMentions: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        latestReplyablePostId: '',
    }

    static getDerivedStateFromProps(props, state) {
        let updatedState = {currentChannel: props.currentChannel};
        if (props.currentChannel.id !== state.currentChannel.id) {
            updatedState = {
                ...updatedState,
                message: props.draft.message,
                submitting: false,
                serverError: null,
            };
        }
        return updatedState;
    }

    constructor(props) {
        super(props);
        this.state = {
            message: this.props.draft.message,
            caretPosition: this.props.draft.message.length,
            submitting: false,
            showPostDeletedModal: false,
            showEmojiPicker: false,
            showConfirmModal: false,
            channelTimezoneCount: 0,
            uploadsProgressPercent: {},
            renderScrollbar: false,
            scrollbarWidth: 0,
            currentChannel: props.currentChannel,
            mentions: [],
            memberNotifyCount: 0,
        };

        this.lastBlurAt = 0;
        this.lastChannelSwitchAt = 0;
        this.draftsForChannel = {};
        this.lastOrientation = null;

        this.topDiv = React.createRef();
        this.textboxRef = React.createRef();
        this.fileUploadRef = React.createRef();
        this.createPostControlsRef = React.createRef();
    }

    componentDidMount() {
        const {useGroupMentions, currentChannel, isTimezoneEnabled, actions} = this.props;
        this.onOrientationChange();
        actions.setShowPreview(false);
        actions.clearDraftUploads(StoragePrefixes.DRAFT, (key, value) => {
            if (value) {
                return {...value, uploadsInProgress: []};
            }
            return value;
        });
        this.focusTextbox();
        document.addEventListener('paste', this.pasteHandler);
        document.addEventListener('keydown', this.documentKeyHandler);
        this.setOrientationListeners();

        if (useGroupMentions) {
            actions.getChannelMemberCountsByGroup(currentChannel.id, isTimezoneEnabled);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {useGroupMentions, currentChannel, isTimezoneEnabled, actions} = this.props;
        if (prevProps.currentChannel.id !== currentChannel.id) {
            this.lastChannelSwitchAt = Date.now();
            this.focusTextbox();
            if (useGroupMentions) {
                actions.getChannelMemberCountsByGroup(currentChannel.id, isTimezoneEnabled);
            }
        }

        if (currentChannel.id !== prevProps.currentChannel.id) {
            actions.setShowPreview(false);
        }

        // Focus on textbox when emoji picker is closed
        if (prevState.showEmojiPicker && !this.state.showEmojiPicker) {
            this.focusTextbox();
        }
    }

    componentWillUnmount() {
        document.removeEventListener('paste', this.pasteHandler);
        document.removeEventListener('keydown', this.documentKeyHandler);
        this.removeOrientationListeners();
        if (this.saveDraftFrame) {
            const channelId = this.props.currentChannel.id;
            this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, this.draftsForChannel[channelId]);
            cancelAnimationFrame(this.saveDraftFrame);
        }
    }

    setShowPreview = (newPreviewValue) => {
        this.props.actions.setShowPreview(newPreviewValue);
    }

    setOrientationListeners = () => {
        if ((window.screen.orientation) && ('onchange' in window.screen.orientation)) {
            window.screen.orientation.addEventListener('change', this.onOrientationChange);
        } else if ('onorientationchange' in window) {
            window.addEventListener('orientationchange', this.onOrientationChange);
        }
    };

    removeOrientationListeners = () => {
        if ((window.screen.orientation) && ('onchange' in window.screen.orientation)) {
            window.screen.orientation.removeEventListener('change', this.onOrientationChange);
        } else if ('onorientationchange' in window) {
            window.removeEventListener('orientationchange', this.onOrientationChange);
        }
    };

    onOrientationChange = () => {
        if (!UserAgent.isIosWeb()) {
            return;
        }

        const LANDSCAPE_ANGLE = 90;
        let orientation = 'portrait';
        if (window.orientation) {
            orientation = Math.abs(window.orientation) === LANDSCAPE_ANGLE ? 'landscape' : 'portrait';
        }

        if (window.screen.orientation) {
            orientation = window.screen.orientation.type.split('-')[0];
        }

        if (this.lastOrientation && orientation !== this.lastOrientation && (document.activeElement || {}).id === 'post_textbox') {
            this.textboxRef.current.blur();
        }

        this.lastOrientation = orientation;
    }

    handlePostError = (postError) => {
        this.setState({postError});
    }

    toggleEmojiPicker = () => {
        this.setState({showEmojiPicker: !this.state.showEmojiPicker});
    }

    hideEmojiPicker = () => {
        this.handleEmojiClose();
    }

    doSubmit = async (e) => {
        const channelId = this.props.currentChannel.id;
        if (e) {
            e.preventDefault();
        }

        if (this.props.draft.uploadsInProgress.length > 0 || this.state.submitting) {
            return;
        }

        let message = this.state.message;
        let ignoreSlash = false;
        const serverError = this.state.serverError;

        if (serverError && isErrorInvalidSlashCommand(serverError) && serverError.submittedMessage === message) {
            message = serverError.submittedMessage;
            ignoreSlash = true;
        }

        const post = {};
        post.file_ids = [];
        post.message = message;

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
        if (post.message.indexOf('/') === 0 && !ignoreSlash) {
            this.setState({message: '', postError: null});
            let args = {};
            args.channel_id = channelId;
            args.team_id = this.props.currentTeamId;

            const hookResult = await this.props.actions.runSlashCommandWillBePostedHooks(post.message, args);

            if (hookResult.error) {
                this.setState({
                    serverError: {
                        ...hookResult.error,
                        submittedMessage: post.message,
                    },
                    message: post.message,
                });
            } else if (!hookResult.data.message && !hookResult.data.args) {
                // do nothing with an empty return from a hook
            } else {
                post.message = hookResult.data.message;
                args = hookResult.data.args;

                const {error} = await this.props.actions.executeCommand(post.message, args);

                if (error) {
                    if (error.sendMessage) {
                        await this.sendMessage(post);
                    } else {
                        this.setState({
                            serverError: {
                                ...error,
                                submittedMessage: post.message,
                            },
                            message: post.message,
                        });
                    }
                }
            }
        } else if (isReaction && this.props.emojiMap.has(isReaction[2])) {
            this.sendReaction(isReaction);

            this.setState({message: ''});
        } else {
            const {error} = await this.sendMessage(post);

            if (!error) {
                this.setState({message: ''});
            }
        }

        this.setState({
            submitting: false,
            postError: null,
        });

        cancelAnimationFrame(this.saveDraftFrame);
        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, null);
        this.draftsForChannel[channelId] = null;

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

    getStatusFromSlashCommand = () => {
        const {message} = this.state;
        const tokens = message.split(' ');

        if (tokens.length > 0) {
            return tokens[0].substring(1);
        }
        return '';
    };

    isStatusSlashCommand = (command) => {
        return command === 'online' || command === 'away' ||
            command === 'dnd' || command === 'offline';
    };

    handleSubmit = async (e) => {
        const {
            currentChannel: updateChannel,
            userIsOutOfOffice,
            groupsWithAllowReference,
            channelMemberCountsByGroup,
            currentChannelMembersCount,
            useGroupMentions,
        } = this.props;

        const notificationsToChannel = this.props.enableConfirmNotificationsToChannel && this.props.useChannelMentions;
        let memberNotifyCount = 0;
        let channelTimezoneCount = 0;
        let mentions = [];
        const notContainsAtChannel = !containsAtChannel(this.state.message);
        if (this.props.enableConfirmNotificationsToChannel && notContainsAtChannel && useGroupMentions) {
            // Groups mentioned in users text
            mentions = groupsMentionedInText(this.state.message, groupsWithAllowReference);
            if (mentions.length > 0) {
                mentions = mentions.
                    map((group) => {
                        const mappedValue = channelMemberCountsByGroup[group.id];
                        if (mappedValue && mappedValue.channel_member_count > Constants.NOTIFY_ALL_MEMBERS && mappedValue.channel_member_count > memberNotifyCount) {
                            memberNotifyCount = mappedValue.channel_member_count;
                            channelTimezoneCount = mappedValue.channel_member_timezones_count;
                        }
                        return `@${group.name}`;
                    });
                mentions = [...new Set(mentions)];
            }
        }

        if (notificationsToChannel &&
            currentChannelMembersCount > Constants.NOTIFY_ALL_MEMBERS &&
            !notContainsAtChannel) {
            memberNotifyCount = currentChannelMembersCount - 1;
            mentions = ['@all', '@channel'];
            if (this.props.isTimezoneEnabled) {
                const {data} = await this.props.actions.getChannelTimezones(this.props.currentChannel.id);
                channelTimezoneCount = data ? data.length : 0;
            }
        }

        if (memberNotifyCount > 0) {
            this.setState({
                channelTimezoneCount,
                memberNotifyCount,
                mentions,
            });
            this.showNotifyAllModal();
            return;
        }

        const status = this.getStatusFromSlashCommand();
        if (userIsOutOfOffice && this.isStatusSlashCommand(status)) {
            const resetStatusModalData = {
                ModalId: ModalIdentifiers.RESET_STATUS,
                dialogType: ResetStatusModal,
                dialogProps: {newStatus: status},
            };

            this.props.actions.openModal(resetStatusModalData);

            this.setState({message: ''});
            return;
        }

        if (trimRight(this.state.message) === '/header') {
            const editChannelHeaderModalData = {
                modalId: ModalIdentifiers.EDIT_CHANNEL_HEADER,
                dialogType: EditChannelHeaderModal,
                dialogProps: {channel: updateChannel},
            };

            this.props.actions.openModal(editChannelHeaderModalData);

            this.setState({message: ''});
            return;
        }

        const isDirectOrGroup = ((updateChannel.type === Constants.DM_CHANNEL) || (updateChannel.type === Constants.GM_CHANNEL));
        if (!isDirectOrGroup && trimRight(this.state.message) === '/purpose') {
            const editChannelPurposeModalData = {
                modalId: ModalIdentifiers.EDIT_CHANNEL_PURPOSE,
                dialogType: EditChannelPurposeModal,
                dialogProps: {channel: updateChannel},
            };

            this.props.actions.openModal(editChannelPurposeModalData);

            this.setState({message: ''});
            return;
        }

        if (!isDirectOrGroup && trimRight(this.state.message) === '/rename') {
            GlobalActions.showChannelNameUpdateModal(updateChannel);
            this.setState({message: ''});
            return;
        }

        await this.doSubmit(e);
    }

    sendMessage = async (originalPost) => {
        const {
            actions,
            currentChannel,
            currentUserId,
            draft,
            useGroupMentions,
            useChannelMentions,
            groupsWithAllowReference,
        } = this.props;

        let post = originalPost;

        post.channel_id = currentChannel.id;

        const time = Utils.getTimestamp();
        const userId = currentUserId;
        post.pending_post_id = `${userId}:${time}`;
        post.user_id = userId;
        post.create_at = time;
        post.parent_id = this.state.parentId;
        post.metadata = {};
        post.props = {};
        if (!useChannelMentions && containsAtChannel(post.message, {checkAllMentions: true})) {
            post.props.mentionHighlightDisabled = true;
        }
        if (!useGroupMentions && groupsMentionedInText(post.message, groupsWithAllowReference)) {
            post.props.disable_group_highlight = true;
        }

        const hookResult = await actions.runMessageWillBePostedHooks(post);

        if (hookResult.error) {
            this.setState({
                serverError: hookResult.error,
                submitting: false,
            });

            return hookResult;
        }

        post = hookResult.data;

        actions.onSubmitPost(post, draft.fileInfos);
        actions.scrollPostListToBottom();

        this.setState({
            submitting: false,
        });

        return {data: true};
    }

    sendReaction(isReaction) {
        const channelId = this.props.currentChannel.id;
        const action = isReaction[1];
        const emojiName = isReaction[2];
        const postId = this.props.latestReplyablePostId;

        if (postId && action === '+') {
            this.props.actions.addReaction(postId, emojiName);
        } else if (postId && action === '-') {
            this.props.actions.removeReaction(postId, emojiName);
        }

        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, null);
        this.draftsForChannel[channelId] = null;
    }

    focusTextbox = (keepFocus = false) => {
        const postTextboxDisabled = this.props.readOnlyChannel || !this.props.canPost;
        if (this.textboxRef.current && postTextboxDisabled) {
            this.textboxRef.current.blur(); // Fixes Firefox bug which causes keyboard shortcuts to be ignored (MM-22482)
            return;
        }
        if (this.textboxRef.current && (keepFocus || !UserAgent.isMobile())) {
            this.textboxRef.current.focus();
        }
    }

    postMsgKeyPress = (e) => {
        const {ctrlSend, codeBlockOnCtrlEnter} = this.props;

        const {allowSending, withClosedCodeBlock, ignoreKeyPress, message} = postMessageOnKeyPress(e, this.state.message, ctrlSend, codeBlockOnCtrlEnter, Date.now(), this.lastChannelSwitchAt, this.state.caretPosition);

        if (ignoreKeyPress) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (allowSending) {
            if (e.persist) {
                e.persist();
            }
            if (this.textboxRef.current) {
                this.textboxRef.current.blur();
            }

            if (withClosedCodeBlock && message) {
                this.setState({message}, () => this.handleSubmit(e));
            } else {
                this.handleSubmit(e);
            }

            this.setShowPreview(false);
        }

        this.emitTypingEvent();
    }

    emitTypingEvent = () => {
        const channelId = this.props.currentChannel.id;
        GlobalActions.emitLocalUserTypingEvent(channelId, '');
    }

    handleChange = (e) => {
        const message = e.target.value;
        const channelId = this.props.currentChannel.id;

        let serverError = this.state.serverError;
        if (isErrorInvalidSlashCommand(serverError)) {
            serverError = null;
        }

        this.setState({
            message,
            serverError,
        });

        const draft = {
            ...this.props.draft,
            message,
        };
        cancelAnimationFrame(this.saveDraftFrame);
        this.saveDraftFrame = requestAnimationFrame(() => {
            this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, draft);
        });
        this.draftsForChannel[channelId] = draft;
    }

    pasteHandler = (e) => {
        if (!e.clipboardData || !e.clipboardData.items || e.target.id !== 'post_textbox') {
            return;
        }

        const {clipboardData} = e;
        const table = getTable(clipboardData);
        if (!table) {
            return;
        }

        e.preventDefault();

        let message = this.state.message;
        if (isGitHubCodeBlock(table.className)) {
            const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste(this.state.caretPosition, message, clipboardData);
            const newCaretPosition = this.state.caretPosition + formattedCodeBlock.length;
            this.setMessageAndCaretPostion(formattedMessage, newCaretPosition);
            return;
        }

        const originalSize = message.length;
        message = formatMarkdownTableMessage(table, message.trim(), this.state.caretPosition);
        const newCaretPosition = message.length - (originalSize - this.state.caretPosition);
        this.setMessageAndCaretPostion(message, newCaretPosition);
    }

    handleFileUploadChange = () => {
        this.focusTextbox();
    }

    handleUploadStart = (clientIds, channelId) => {
        const uploadsInProgress = [
            ...this.props.draft.uploadsInProgress,
            ...clientIds,
        ];

        const draft = {
            ...this.props.draft,
            uploadsInProgress,
        };

        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, draft);
        this.draftsForChannel[channelId] = draft;

        // this is a bit redundant with the code that sets focus when the file input is clicked,
        // but this also resets the focus after a drag and drop
        this.focusTextbox();
    }

    handleUploadProgress = ({clientId, name, percent, type}) => {
        const uploadsProgressPercent = {...this.state.uploadsProgressPercent, [clientId]: {percent, name, type}};
        this.setState({uploadsProgressPercent});
    }

    handleFileUploadComplete = (fileInfos, clientIds, channelId) => {
        const draft = {...this.draftsForChannel[channelId]};

        // remove each finished file from uploads
        for (let i = 0; i < clientIds.length; i++) {
            if (draft.uploadsInProgress) {
                const index = draft.uploadsInProgress.indexOf(clientIds[i]);

                if (index !== -1) {
                    draft.uploadsInProgress = draft.uploadsInProgress.filter((item, itemIndex) => index !== itemIndex);
                }
            }
        }

        if (draft.fileInfos) {
            draft.fileInfos = sortFileInfos(draft.fileInfos.concat(fileInfos), this.props.locale);
        }

        this.draftsForChannel[channelId] = draft;
        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, draft);
    }

    handleUploadError = (err, clientId, channelId) => {
        const draft = {...this.draftsForChannel[channelId]};

        let serverError = err;
        if (typeof err === 'string') {
            serverError = new Error(err);
        }

        if (clientId !== -1 && draft.uploadsInProgress) {
            const index = draft.uploadsInProgress.indexOf(clientId);

            if (index !== -1) {
                const uploadsInProgress = draft.uploadsInProgress.filter((item, itemIndex) => index !== itemIndex);
                const modifiedDraft = {
                    ...draft,
                    uploadsInProgress,
                };
                this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, modifiedDraft);
                this.draftsForChannel[channelId] = modifiedDraft;
            }
        }

        this.setState({serverError});
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
                    uploadsInProgress,
                };

                if (this.fileUploadRef.current && this.fileUploadRef.current) {
                    this.fileUploadRef.current.cancelUpload(id);
                }
            }
        } else {
            const fileInfos = draft.fileInfos.filter((item, itemIndex) => index !== itemIndex);

            modifiedDraft = {
                ...draft,
                fileInfos,
            };
        }

        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, modifiedDraft);
        this.draftsForChannel[channelId] = modifiedDraft;

        this.handleFileUploadChange();
    }

    focusTextboxIfNecessary = (e) => {
        // Focus should go to the RHS when it is expanded
        if (this.props.rhsExpanded) {
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

    documentKeyHandler = (e) => {
        const ctrlOrMetaKeyPressed = e.ctrlKey || e.metaKey;
        const shortcutModalKeyCombo = ctrlOrMetaKeyPressed && Utils.isKeyPressed(e, KeyCodes.FORWARD_SLASH);
        const lastMessageReactionKeyCombo = ctrlOrMetaKeyPressed && e.shiftKey && Utils.isKeyPressed(e, KeyCodes.BACK_SLASH);

        if (shortcutModalKeyCombo) {
            e.preventDefault();

            GlobalActions.toggleShortcutsModal();
            return;
        } else if (lastMessageReactionKeyCombo) {
            this.reactToLastMessage(e);
            return;
        }

        this.focusTextboxIfNecessary(e);
    }

    getFileCount = () => {
        const draft = this.props.draft;
        return draft.fileInfos.length + draft.uploadsInProgress.length;
    }

    getFileUploadTarget = () => {
        if (this.textboxRef.current) {
            return this.textboxRef.current;
        }

        return null;
    }

    getCreatePostControls = () => {
        return this.createPostControlsRef.current;
    }

    fillMessageFromHistory() {
        const lastMessage = this.props.messageInHistoryItem;
        if (lastMessage) {
            this.setState({
                message: lastMessage,
            });
        }
    }

    handleMouseUpKeyUp = (e) => {
        const caretPosition = Utils.getCaretPosition(e.target);
        this.setState({
            caretPosition,
        });
    }

    handleSelect = (e) => {
        Utils.adjustSelection(this.textboxRef.current.getInputBox(), e);
    }

    handleKeyDown = (e) => {
        const ctrlOrMetaKeyPressed = e.ctrlKey || e.metaKey;
        const messageIsEmpty = this.state.message.length === 0;
        const draftMessageIsEmpty = this.props.draft.message.length === 0;
        const ctrlEnterKeyCombo = (this.props.ctrlSend || this.props.codeBlockOnCtrlEnter) && Utils.isKeyPressed(e, KeyCodes.ENTER) && ctrlOrMetaKeyPressed;
        const upKeyOnly = !ctrlOrMetaKeyPressed && !e.altKey && !e.shiftKey && Utils.isKeyPressed(e, KeyCodes.UP);
        const shiftUpKeyCombo = !ctrlOrMetaKeyPressed && !e.altKey && e.shiftKey && Utils.isKeyPressed(e, KeyCodes.UP);
        const ctrlKeyCombo = ctrlOrMetaKeyPressed && !e.altKey && !e.shiftKey;
        const markdownHotkey = Utils.isKeyPressed(e, KeyCodes.B) || Utils.isKeyPressed(e, KeyCodes.I);

        // listen for line break key combo and insert new line character
        if (Utils.isUnhandledLineBreakKeyCombo(e)) {
            this.setState({message: Utils.insertLineBreakFromKeyEvent(e)});
        } else if (ctrlEnterKeyCombo) {
            this.postMsgKeyPress(e);
        } else if (upKeyOnly && messageIsEmpty) {
            this.editLastPost(e);
        } else if (shiftUpKeyCombo && messageIsEmpty) {
            this.replyToLastPost(e);
        } else if (ctrlKeyCombo && draftMessageIsEmpty && Utils.isKeyPressed(e, KeyCodes.UP)) {
            this.loadPrevMessage(e);
        } else if (ctrlKeyCombo && draftMessageIsEmpty && Utils.isKeyPressed(e, KeyCodes.DOWN)) {
            this.loadNextMessage(e);
        } else if (ctrlKeyCombo && markdownHotkey) {
            this.applyHotkeyMarkdown(e);
        }
    }

    editLastPost = (e) => {
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
        if (this.textboxRef.current) {
            this.textboxRef.current.blur();
        }
        this.props.actions.setEditingPost(lastPost.id, this.props.commentCountForPost, 'post_textbox', type);
    }

    replyToLastPost = (e) => {
        e.preventDefault();
        const latestReplyablePostId = this.props.latestReplyablePostId;
        const replyBox = document.getElementById('reply_textbox');
        if (replyBox) {
            replyBox.focus();
        }
        if (latestReplyablePostId) {
            this.props.actions.selectPostFromRightHandSideSearchByPostId(latestReplyablePostId);
        }
    }

    loadPrevMessage = (e) => {
        e.preventDefault();
        this.props.actions.moveHistoryIndexBack(Posts.MESSAGE_TYPES.POST).then(() => this.fillMessageFromHistory());
    }

    loadNextMessage = (e) => {
        e.preventDefault();
        this.props.actions.moveHistoryIndexForward(Posts.MESSAGE_TYPES.POST).then(() => this.fillMessageFromHistory());
    }

    applyHotkeyMarkdown = (e) => {
        const res = Utils.applyHotkeyMarkdown(e);

        this.setState({
            message: res.message,
        }, () => {
            const textbox = this.textboxRef.current.getInputBox();
            Utils.setSelectionRange(textbox, res.selectionStart, res.selectionEnd);
        });
    }

    reactToLastMessage = (e) => {
        e.preventDefault();

        const {rhsExpanded, actions: {emitShortcutReactToLastPostFrom}} = this.props;
        const noModalsAreOpen = document.getElementsByClassName(A11yClassNames.MODAL).length === 0;
        const noPopupsDropdownsAreOpen = document.getElementsByClassName(A11yClassNames.POPUP).length === 0;

        // Block keyboard shortcut react to last message when :
        // - RHS is completely expanded
        // - Any dropdown/popups are open
        // - Any modals are open
        if (!rhsExpanded && noModalsAreOpen && noPopupsDropdownsAreOpen) {
            emitShortcutReactToLastPostFrom(Locations.CENTER);
        }
    }

    handleBlur = () => {
        this.lastBlurAt = Date.now();
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
    }

    handleEmojiClose = () => {
        this.setState({showEmojiPicker: false});
    }

    setMessageAndCaretPostion = (newMessage, newCaretPosition) => {
        const textbox = this.textboxRef.current.getInputBox();

        this.setState({
            message: newMessage,
            caretPosition: newCaretPosition,
        }, () => {
            Utils.setCaretPosition(textbox, newCaretPosition);
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
            const {message} = this.state;
            const {firstPiece, lastPiece} = splitMessageBasedOnCaretPosition(this.state.caretPosition, message);

            // check whether the first piece of the message is empty when cursor is placed at beginning of message and avoid adding an empty string at the beginning of the message
            const newMessage = firstPiece === '' ? `:${emojiAlias}: ${lastPiece}` : `${firstPiece} :${emojiAlias}: ${lastPiece}`;

            const newCaretPosition = firstPiece === '' ? `:${emojiAlias}: `.length : `${firstPiece} :${emojiAlias}: `.length;
            this.setMessageAndCaretPostion(newMessage, newCaretPosition);
        }

        this.handleEmojiClose();
    }

    handleGifClick = (gif) => {
        if (this.state.message === '') {
            this.setState({message: gif});
        } else {
            const newMessage = ((/\s+$/).test(this.state.message)) ? this.state.message + gif : this.state.message + ' ' + gif;
            this.setState({message: newMessage});
        }
        this.handleEmojiClose();
    }

    createTutorialTip() {
        const screens = [];

        screens.push(
            <div>
                <h4>
                    <FormattedMessage
                        id='create_post.tutorialTip.title'
                        defaultMessage='Sending Messages'
                    />
                </h4>
                <p>
                    <FormattedMarkdownMessage
                        id='create_post.tutorialTip1'
                        defaultMessage='Type here to write a message and press **Enter** to post it.'
                    />
                </p>
                <p>
                    <FormattedMarkdownMessage
                        id='create_post.tutorialTip2'
                        defaultMessage='Click the **Attachment** button to upload an image or a file.'
                    />
                </p>
            </div>,
        );

        return (
            <TutorialTip
                id='postTextboxTipMessage'
                placement='top'
                screens={screens}
                overlayClass='tip-overlay--chat'
                telemetryTag='tutorial_tip_1_sending_messages'
            />
        );
    }

    shouldEnableSendButton() {
        return this.state.message.trim().length !== 0 || this.props.draft.fileInfos.length !== 0;
    }

    handleHeightChange = (height, maxHeight) => {
        this.setState({
            renderScrollbar: height > maxHeight,
        });

        window.requestAnimationFrame(() => {
            if (this.textboxRef.current) {
                this.setState({scrollbarWidth: Utils.scrollbarWidth(this.textboxRef.current.getInputBox())});
            }
        });
    }

    render() {
        const {
            currentChannel,
            draft,
            fullWidthTextBox,
            showTutorialTip,
            canPost,
        } = this.props;
        const readOnlyChannel = this.props.readOnlyChannel || !canPost;
        const {formatMessage} = this.props.intl;
        const {renderScrollbar, channelTimezoneCount, mentions, memberNotifyCount} = this.state;
        const ariaLabelMessageInput = Utils.localizeMessage('accessibility.sections.centerFooter', 'message input complimentary region');
        let notifyAllMessage = '';
        let notifyAllTitle = '';
        if (mentions.includes('@all') || mentions.includes('@channel')) {
            notifyAllTitle = (
                <FormattedMessage
                    id='notify_all.title.confirm'
                    defaultMessage='Confirm sending notifications to entire channel'
                />
            );
            if (channelTimezoneCount > 0) {
                notifyAllMessage = (
                    <FormattedMarkdownMessage
                        id='notify_all.question_timezone'
                        defaultMessage='By using **@all** or **@channel** you are about to send notifications to **{totalMembers} people** in **{timezones, number} {timezones, plural, one {timezone} other {timezones}}**. Are you sure you want to do this?'
                        values={{
                            totalMembers: memberNotifyCount,
                            timezones: channelTimezoneCount,
                        }}
                    />
                );
            } else {
                notifyAllMessage = (
                    <FormattedMarkdownMessage
                        id='notify_all.question'
                        defaultMessage='By using **@all** or **@channel** you are about to send notifications to **{totalMembers} people**. Are you sure you want to do this?'
                        values={{
                            totalMembers: memberNotifyCount,
                        }}
                    />
                );
            }
        } else if (mentions.length > 0) {
            notifyAllTitle = (
                <FormattedMessage
                    id='notify_all.title.confirm_groups'
                    defaultMessage='Confirm sending notifications to groups'
                />
            );

            if (mentions.length === 1) {
                if (channelTimezoneCount > 0) {
                    notifyAllMessage = (
                        <FormattedMarkdownMessage
                            id='notify_all.question_timezone_one_group'
                            defaultMessage='By using **{mention}** you are about to send notifications to **{totalMembers} people** in **{timezones, number} {timezones, plural, one {timezone} other {timezones}}**. Are you sure you want to do this?'
                            values={{
                                mention: mentions[0],
                                totalMembers: memberNotifyCount,
                                timezones: channelTimezoneCount,
                            }}
                        />
                    );
                } else {
                    notifyAllMessage = (
                        <FormattedMarkdownMessage
                            id='notify_all.question_one_group'
                            defaultMessage='By using **{mention}** you are about to send notifications to **{totalMembers} people**. Are you sure you want to do this?'
                            values={{
                                mention: mentions[0],
                                totalMembers: memberNotifyCount,
                            }}
                        />
                    );
                }
            } else if (channelTimezoneCount > 0) {
                notifyAllMessage = (
                    <FormattedMarkdownMessage
                        id='notify_all.question_timezone_groups'
                        defaultMessage='By using **{mentions}** and **{finalMention}** you are about to send notifications to at least **{totalMembers} people** in **{timezones, number} {timezones, plural, one {timezone} other {timezones}}**. Are you sure you want to do this?'
                        values={{
                            mentions: mentions.slice(0, -1).join(', '),
                            finalMention: mentions[mentions.length - 1],
                            totalMembers: memberNotifyCount,
                            timezones: channelTimezoneCount,
                        }}
                    />
                );
            } else {
                notifyAllMessage = (
                    <FormattedMarkdownMessage
                        id='notify_all.question_groups'
                        defaultMessage='By using **{mentions}** and **{finalMention}** you are about to send notifications to at least **{totalMembers} people**. Are you sure you want to do this?'
                        values={{
                            mentions: mentions.slice(0, -1).join(', '),
                            finalMention: mentions[mentions.length - 1],
                            totalMembers: memberNotifyCount,
                        }}
                    />
                );
            }
        }

        const notifyAllConfirm = (
            <FormattedMessage
                id='notify_all.confirm'
                defaultMessage='Confirm'
            />
        );

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
                />
            );
        }

        let postFooterClassName = 'post-create-footer';
        if (postError) {
            postFooterClassName += ' has-error';
        }

        let tutorialTip = null;
        if (showTutorialTip) {
            tutorialTip = this.createTutorialTip();
        }

        let centerClass = '';
        if (!fullWidthTextBox) {
            centerClass = 'center';
        }

        let sendButtonClass = 'send-button theme';
        if (!this.shouldEnableSendButton()) {
            sendButtonClass += ' disabled';
        }

        let attachmentsDisabled = '';
        if (!this.props.canUploadFiles) {
            attachmentsDisabled = ' post-create--attachment-disabled';
        }

        let callButton;
        if (!readOnlyChannel && !this.props.shouldShowPreview) {
            callButton = (
                <CallButton/>
            );
        }

        let fileUpload;
        if (!readOnlyChannel && !this.props.shouldShowPreview) {
            fileUpload = (
                <FileUpload
                    ref={this.fileUploadRef}
                    fileCount={this.getFileCount()}
                    getTarget={this.getFileUploadTarget}
                    onFileUploadChange={this.handleFileUploadChange}
                    onUploadStart={this.handleUploadStart}
                    onFileUpload={this.handleFileUploadComplete}
                    onUploadError={this.handleUploadError}
                    onUploadProgress={this.handleUploadProgress}
                    postType='post'
                />
            );
        }

        let emojiPicker = null;
        const emojiButtonAriaLabel = formatMessage({id: 'emoji_picker.emojiPicker', defaultMessage: 'Emoji Picker'}).toLowerCase();

        if (this.props.enableEmojiPicker && !readOnlyChannel && !this.props.shouldShowPreview) {
            emojiPicker = (
                <div>
                    <EmojiPickerOverlay
                        show={this.state.showEmojiPicker}
                        target={this.getCreatePostControls}
                        onHide={this.hideEmojiPicker}
                        onEmojiClose={this.handleEmojiClose}
                        onEmojiClick={this.handleEmojiClick}
                        onGifClick={this.handleGifClick}
                        enableGifPicker={this.props.enableGifPicker}
                        topOffset={-7}
                    />
                    <button
                        type='button'
                        aria-label={emojiButtonAriaLabel}
                        onClick={this.toggleEmojiPicker}
                        className={classNames('emoji-picker__container', 'post-action', {
                            'post-action--active': this.state.showEmojiPicker,
                        })}
                    >
                        <EmojiIcon
                            id='emojiPickerButton'
                            className={'icon icon--emoji '}
                        />
                    </button>
                </div>
            );
        }

        let createMessage;
        if (readOnlyChannel) {
            createMessage = Utils.localizeMessage('create_post.read_only', 'This channel is read-only. Only members with permission can post here.');
        } else {
            createMessage = formatMessage(
                {id: 'create_post.write', defaultMessage: 'Write to {channelDisplayName}'},
                {channelDisplayName: currentChannel.display_name},
            );
        }

        let scrollbarClass = '';
        if (renderScrollbar) {
            scrollbarClass = ' scroll';
        }

        return (
            <form
                id='create_post'
                ref={this.topDiv}
                className={centerClass}
                onSubmit={this.handleSubmit}
            >
                <div
                    className={'post-create' + attachmentsDisabled + scrollbarClass}
                    style={this.state.renderScrollbar && this.state.scrollbarWidth ? {'--detected-scrollbar-width': `${this.state.scrollbarWidth}px`} : undefined}
                >
                    <div className='post-create-body'>
                        <div
                            role='application'
                            id='centerChannelFooter'
                            aria-label={ariaLabelMessageInput}
                            tabIndex='-1'
                            className='post-body__cell a11y__region'
                            data-a11y-sort-order='2'
                        >
                            <Textbox
                                onChange={this.handleChange}
                                onKeyPress={this.postMsgKeyPress}
                                onKeyDown={this.handleKeyDown}
                                onSelect={this.handleSelect}
                                onMouseUp={this.handleMouseUpKeyUp}
                                onKeyUp={this.handleMouseUpKeyUp}
                                onComposition={this.emitTypingEvent}
                                onHeightChange={this.handleHeightChange}
                                handlePostError={this.handlePostError}
                                value={readOnlyChannel ? '' : this.state.message}
                                onBlur={this.handleBlur}
                                emojiEnabled={this.props.enableEmojiPicker}
                                createMessage={createMessage}
                                channelId={currentChannel.id}
                                id='post_textbox'
                                ref={this.textboxRef}
                                disabled={readOnlyChannel}
                                characterLimit={this.props.maxPostSize}
                                preview={this.props.shouldShowPreview}
                                badConnection={this.props.badConnection}
                                listenForMentionKeyClick={true}
                                useChannelMentions={this.props.useChannelMentions}
                            />
                            <span
                                ref={this.createPostControlsRef}
                                className='post-body__actions'
                            >
                                {callButton}
                                {fileUpload}
                                {emojiPicker}
                                <a
                                    role='button'
                                    tabIndex='0'
                                    aria-label={formatMessage({
                                        id: 'create_post.send_message',
                                        defaultMessage: 'Send a message',
                                    })}
                                    className={sendButtonClass}
                                    onClick={this.handleSubmit}
                                >
                                    <LocalizedIcon
                                        className='fa fa-paper-plane'
                                        title={{
                                            id: t('create_post.icon'),
                                            defaultMessage: 'Create a post',
                                        }}
                                    />
                                </a>
                            </span>
                        </div>
                        {tutorialTip}
                    </div>
                    <div
                        id='postCreateFooter'
                        role='form'
                        className={postFooterClassName}
                    >
                        <div className='d-flex justify-content-between'>
                            <MsgTyping
                                channelId={currentChannel.id}
                                postId=''
                            />
                            <TextboxLinks
                                characterLimit={this.props.maxPostSize}
                                showPreview={this.props.shouldShowPreview}
                                updatePreview={this.setShowPreview}
                                message={readOnlyChannel ? '' : this.state.message}
                            />
                        </div>
                        <div>
                            {postError}
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

export default injectIntl(CreatePost);
/* eslint-enable react/no-string-refs */
