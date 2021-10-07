// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React from 'react';
import classNames from 'classnames';
import {injectIntl, IntlShape} from 'react-intl';

import {Posts} from 'mattermost-redux/constants';
import {PrewrittenMessagesTreatments} from 'mattermost-redux/constants/config';
import {sortFileInfos} from 'mattermost-redux/utils/file_utils';

import * as GlobalActions from 'actions/global_actions';
import {trackEvent} from 'actions/telemetry_actions.jsx';
import Constants, {StoragePrefixes, ModalIdentifiers, Locations, A11yClassNames} from 'utils/constants';
import {t} from 'utils/i18n';
import {
    containsAtChannel,
    specialMentionsInText,
    postMessageOnKeyPress,
    shouldFocusMainTextbox,
    isErrorInvalidSlashCommand,
    splitMessageBasedOnCaretPosition,
    groupsMentionedInText,
} from 'utils/post_utils';
import {getTable, formatMarkdownTableMessage, formatGithubCodePaste, isGitHubCodeBlock} from 'utils/paste';
import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils.jsx';

import NotifyConfirmModal from 'components/notify_confirm_modal';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import EditChannelPurposeModal from 'components/edit_channel_purpose_modal';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import FilePreview from 'components/file_preview';
import FileUpload from 'components/file_upload';
import {FileUpload as FileUploadClass} from 'components/file_upload/file_upload';
import CallButton from 'components/call_button';
import LocalizedIcon from 'components/localized_icon';
import MsgTyping from 'components/msg_typing';
import PostDeletedModal from 'components/post_deleted_modal';
import ResetStatusModal from 'components/reset_status_modal';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import Textbox from 'components/textbox';
import TextboxClass from 'components/textbox/textbox';
import TextboxLinks from 'components/textbox/textbox_links';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import MessageSubmitError from 'components/message_submit_error';
import {Channel, ChannelMemberCountsByGroup} from 'mattermost-redux/types/channels';
import {PostDraft} from 'types/store/rhs';
import {Post, PostMetadata} from 'mattermost-redux/types/posts';
import {PreferenceType} from 'mattermost-redux/types/preferences';
import EmojiMap from 'utils/emoji_map';
import {ActionResult} from 'mattermost-redux/types/actions';
import {ServerError} from 'mattermost-redux/types/errors';
import {CommandArgs} from 'mattermost-redux/types/integrations';
import {Group} from 'mattermost-redux/types/groups';
import {ModalData} from 'types/actions';
import {FileInfo} from 'mattermost-redux/types/files';
import {Emoji} from 'mattermost-redux/types/emojis';
import {FilePreviewInfo} from 'components/file_preview/file_preview';

import CreatePostTip from './create_post_tip';
import PrewrittenChips from './prewritten_chips';

const KeyCodes = Constants.KeyCodes;

const CreatePostDraftTimeoutMilliseconds = 500;

// Temporary fix for IE-11, see MM-13423
function trimRight(str: string) {
    if (String.prototype.trimRight as any) {
        return str.trimRight();
    }

    return str.replace(/\s*$/, '');
}

type Props = {

    /**
         *  ref passed from channelView for EmojiPickerOverlay
         */
    getChannelView?: () => void;

    /**
  *  Data used in notifying user for @all and @channel
  */
    currentChannelMembersCount: number;

    /**
  *  Data used in multiple places of the component
  */
    currentChannel: Channel;

    /**
  *  Data used for DM prewritten messages
  */
    currentChannelTeammateUsername?: string;

    /**
  *  Data used in executing commands for channel actions passed down to client4 function
  */
    currentTeamId: string;

    /**
  *  Data used for posting message
  */
    currentUserId: string;

    /**
  * Force message submission on CTRL/CMD + ENTER
  */
    codeBlockOnCtrlEnter?: boolean;

    /**
  *  Flag used for handling submit
  */
    ctrlSend?: boolean;

    /**
  *  Flag used for adding a class center to Postbox based on user pref
  */
    fullWidthTextBox?: boolean;

    /**
  *  Data used for deciding if tutorial tip is to be shown
  */
    showTutorialTip: boolean;

    /**
  *  Data used for advancing from create post tip
  */
    tutorialStep: number;

    /**
  *  A/B test treatments for presenting prewritten messages to first time users
  */
    prewrittenMessages?: PrewrittenMessagesTreatments;

    /**
  *  Data used populating message state when triggered by shortcuts
  */
    messageInHistoryItem?: string;

    /**
  *  Data used for populating message state from previous draft
  */
    draft: PostDraft;

    /**
  *  Data used dispatching handleViewAction ex: edit post
  */
    latestReplyablePostId?: string;
    locale: string;

    /**
  *  Data used for calling edit of post
  */
    currentUsersLatestPost?: Post | null;

    /**
  * Whether or not file upload is allowed.
  */
    canUploadFiles: boolean;

    /**
  * Whether to show the emoji picker.
  */
    enableEmojiPicker: boolean;

    /**
  * Whether to show the gif picker.
  */
    enableGifPicker: boolean;

    /**
  * Whether to check with the user before notifying the whole channel.
  */
    enableConfirmNotificationsToChannel: boolean;

    /**
  * The maximum length of a post
  */
    maxPostSize: number;
    emojiMap: EmojiMap;

    /**
  * If our connection is bad
  */
    badConnection: boolean;

    /**
  * Whether to display a confirmation modal to reset status.
  */
    userIsOutOfOffice: boolean;
    rhsExpanded: boolean;

    /**
  * To check if the timezones are enable on the server.
  */
    isTimezoneEnabled: boolean;

    canPost: boolean;

    /**
  * To determine if the current user can send special channel mentions
  */
    useChannelMentions: boolean;

    intl: IntlShape;

    /**
  * Should preview be showed
  */
    shouldShowPreview: boolean;

    actions: {

        /**
      * Set show preview for textbox
      */
        setShowPreview: (showPreview: boolean) => void;

        /**
      *  func called after message submit.
      */
        addMessageIntoHistory: (message: string) => void;

        /**
      *  func called for navigation through messages by Up arrow
      */
        moveHistoryIndexBack: (index: string) => Promise<void>;

        /**
      *  func called for navigation through messages by Down arrow
      */
        moveHistoryIndexForward: (index: string) => Promise<void>;

        /**
      *  func called for adding a reaction
      */
        addReaction: (postId: string, emojiName: string) => void;

        /**
      *  func called for posting message
      */
        onSubmitPost: (post: Post, fileInfos: FileInfo[]) => void;

        /**
      *  func called for removing a reaction
      */
        removeReaction: (postId: string, emojiName: string) => void;

        /**
      *  func called on load of component to clear drafts
      */
        clearDraftUploads: () => void;

        /**
      * hooks called before a message is sent to the server
      */
        runMessageWillBePostedHooks: (originalPost: Post) => ActionResult;

        /**
      * hooks called before a slash command is sent to the server
      */
        runSlashCommandWillBePostedHooks: (originalMessage: string, originalArgs: CommandArgs) => ActionResult;

        /**
      *  func called for setting drafts
      */
        setDraft: (name: string, value: PostDraft | null) => void;

        /**
      *  func called for editing posts
      */
        setEditingPost: (postId?: string, refocusId?: string, title?: string, isRHS?: boolean) => void;

        /**
      *  func called for opening the last replayable post in the RHS
      */
        selectPostFromRightHandSideSearchByPostId: (postId: string) => void;

        /**
      * Function to open a modal
      */
        openModal: (modalData: ModalData) => void;

        /**
      * Function to close a modal
      */
        closeModal: (modalId: string) => void;

        executeCommand: (message: string, args: CommandArgs) => ActionResult;

        /**
      * Function to get the users timezones in the channel
      */
        getChannelTimezones: (channelId: string) => ActionResult;
        scrollPostListToBottom: () => void;

        /**
      * Function to set or unset emoji picker for last message
      */
        emitShortcutReactToLastPostFrom: (emittedFrom: string) => void;

        getChannelMemberCountsByGroup: (channelId: string, includeTimezones: boolean) => void;

        /**
      * Function used to advance the tutorial forward
      */
        savePreferences: (userId: string, preferences: PreferenceType[]) => ActionResult;
    };

    groupsWithAllowReference: Map<string, Group> | null;
    channelMemberCountsByGroup: ChannelMemberCountsByGroup;
    useGroupMentions: boolean;
}

type State = {
    message: string;
    caretPosition: number;
    submitting: boolean;
    showPostDeletedModal: boolean;
    showEmojiPicker: boolean;
    uploadsProgressPercent: {[clientID: string]: FilePreviewInfo};
    renderScrollbar: boolean;
    scrollbarWidth: number;
    currentChannel: Channel;
    errorClass: string | null;
    serverError: (ServerError & {submittedMessage?: string}) | null;
    postError?: React.ReactNode;
}

class CreatePost extends React.PureComponent<Props, State> {
    static defaultProps = {
        latestReplyablePostId: '',
    }

    private lastBlurAt = 0;
    private lastChannelSwitchAt = 0;
    private draftsForChannel: {[channelID: string]: PostDraft | null} = {}
    private lastOrientation?: string;
    private saveDraftFrame?: number | null;

    private topDiv: React.RefObject<HTMLFormElement>;
    private textboxRef: React.RefObject<TextboxClass>;
    private fileUploadRef: React.RefObject<FileUploadClass>;
    private createPostControlsRef: React.RefObject<HTMLSpanElement>;

    static getDerivedStateFromProps(props: Props, state: State): Partial<State> {
        let updatedState: Partial<State> = {currentChannel: props.currentChannel};
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

    constructor(props: Props) {
        super(props);
        this.state = {
            message: this.props.draft.message,
            caretPosition: this.props.draft.message.length,
            submitting: false,
            showPostDeletedModal: false,
            showEmojiPicker: false,
            uploadsProgressPercent: {},
            renderScrollbar: false,
            scrollbarWidth: 0,
            currentChannel: props.currentChannel,
            errorClass: null,
            serverError: null,
        };

        this.topDiv = React.createRef<HTMLFormElement>();
        this.textboxRef = React.createRef<TextboxClass>();
        this.fileUploadRef = React.createRef<FileUploadClass>();
        this.createPostControlsRef = React.createRef<HTMLSpanElement>();
    }

    componentDidMount() {
        const {useGroupMentions, currentChannel, isTimezoneEnabled, actions} = this.props;
        this.onOrientationChange();
        actions.setShowPreview(false);
        actions.clearDraftUploads();
        this.focusTextbox();
        document.addEventListener('paste', this.pasteHandler);
        document.addEventListener('keydown', this.documentKeyHandler);
        window.addEventListener('beforeunload', this.unloadHandler);
        this.setOrientationListeners();

        if (useGroupMentions) {
            actions.getChannelMemberCountsByGroup(currentChannel.id, isTimezoneEnabled);
        }
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const {useGroupMentions, currentChannel, isTimezoneEnabled, actions} = this.props;
        if (prevProps.currentChannel.id !== currentChannel.id) {
            this.lastChannelSwitchAt = Date.now();
            this.focusTextbox();
            this.saveDraft(prevProps);
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
        window.addEventListener('beforeunload', this.unloadHandler);
        this.removeOrientationListeners();
        this.saveDraft();
    }

    unloadHandler = () => {
        this.saveDraft();
    }

    saveDraft = (props = this.props) => {
        if (this.saveDraftFrame && props.currentChannel) {
            const channelId = props.currentChannel.id;
            props.actions.setDraft(StoragePrefixes.DRAFT + channelId, this.draftsForChannel[channelId]);
            clearTimeout(this.saveDraftFrame);
            this.saveDraftFrame = null;
        }
    }

    setShowPreview = (newPreviewValue: boolean) => {
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
            orientation = Math.abs(window.orientation as number) === LANDSCAPE_ANGLE ? 'landscape' : 'portrait';
        }

        if (window.screen.orientation) {
            orientation = window.screen.orientation.type.split('-')[0];
        }

        if (this.lastOrientation && orientation !== this.lastOrientation && (document.activeElement || {}).id === 'post_textbox') {
            this.textboxRef.current?.blur();
        }

        this.lastOrientation = orientation;
    }

    handlePostError = (postError: React.ReactNode) => {
        this.setState({postError});
    }

    toggleEmojiPicker = () => {
        this.setState({showEmojiPicker: !this.state.showEmojiPicker});
    }

    hideEmojiPicker = () => {
        this.handleEmojiClose();
    }

    doSubmit = async (e?: React.FormEvent) => {
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

        const post = {} as Post;
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

        const fasterThanHumanWillClick = 150;
        const forceFocus = (Date.now() - this.lastBlurAt < fasterThanHumanWillClick);
        this.focusTextbox(forceFocus);

        const isReaction = Utils.REACTION_PATTERN.exec(post.message);
        if (post.message.indexOf('/') === 0 && !ignoreSlash) {
            this.setState({message: '', postError: null});
            let args: CommandArgs = {
                channel_id: channelId,
                team_id: this.props.currentTeamId,
            };

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

        if (this.saveDraftFrame) {
            clearTimeout(this.saveDraftFrame);
        }

        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, null);
        this.draftsForChannel[channelId] = null;

        // Posting a message completes the tip when there are prewritten messages.
        // We do not complete messages in the control group,
        // so as to not alter behavior in the control group as a result of the A/B test code changes.
        const shouldCompleteTip = this.props.tutorialStep === Constants.TutorialSteps.POST_POPOVER && this.props.prewrittenMessages && this.props.prewrittenMessages !== PrewrittenMessagesTreatments.NONE;
        if (shouldCompleteTip) {
            this.completePostTip('send_message');
        }
    }

    handleNotifyAllConfirmation = () => {
        this.props.actions.closeModal(ModalIdentifiers.NOTIFY_CONFIRM_MODAL);
        this.doSubmit();
    }

    showNotifyAllModal = (mentions: string[], channelTimezoneCount: number, memberNotifyCount: number) => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.NOTIFY_CONFIRM_MODAL,
            dialogType: NotifyConfirmModal as any,
            dialogProps: {
                mentions,
                channelTimezoneCount,
                memberNotifyCount,
                onConfirm: () => this.handleNotifyAllConfirmation(),
                onCancel: () => this.props.actions.closeModal(ModalIdentifiers.NOTIFY_CONFIRM_MODAL),
            },
        });
    }

    getStatusFromSlashCommand = () => {
        const {message} = this.state;
        const tokens = message.split(' ');

        if (tokens.length > 0) {
            return tokens[0].substring(1);
        }
        return '';
    };

    isStatusSlashCommand = (command: string) => {
        return command === 'online' || command === 'away' ||
            command === 'dnd' || command === 'offline';
    };

    handleSubmit = async (e: React.FormEvent) => {
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
        let mentions: string[] = [];

        const specialMentions = specialMentionsInText(this.state.message);
        const hasSpecialMentions = Object.values(specialMentions).includes(true);

        if (this.props.enableConfirmNotificationsToChannel && !hasSpecialMentions && useGroupMentions) {
            // Groups mentioned in users text
            const mentionGroups = groupsMentionedInText(this.state.message, groupsWithAllowReference);
            if (mentionGroups.length > 0) {
                mentions = mentionGroups.
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
            hasSpecialMentions) {
            memberNotifyCount = currentChannelMembersCount - 1;

            for (const k in specialMentions) {
                if (specialMentions[k] === true) {
                    mentions.push('@' + k);
                }
            }

            if (this.props.isTimezoneEnabled) {
                const {data} = await this.props.actions.getChannelTimezones(this.props.currentChannel.id);
                channelTimezoneCount = data ? data.length : 0;
            }
        }

        if (memberNotifyCount > 0) {
            this.showNotifyAllModal(mentions, channelTimezoneCount, memberNotifyCount);
            return;
        }

        const status = this.getStatusFromSlashCommand();
        if (userIsOutOfOffice && this.isStatusSlashCommand(status)) {
            const resetStatusModalData = {
                modalId: ModalIdentifiers.RESET_STATUS,
                dialogType: ResetStatusModal as any,
                dialogProps: {newStatus: status},
            };

            this.props.actions.openModal(resetStatusModalData);

            this.setState({message: ''});
            return;
        }

        if (trimRight(this.state.message) === '/header') {
            const editChannelHeaderModalData = {
                modalId: ModalIdentifiers.EDIT_CHANNEL_HEADER,
                dialogType: EditChannelHeaderModal as any,
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
                dialogType: EditChannelPurposeModal as any,
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

    sendMessage = async (originalPost: Post) => {
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
        post.metadata = {} as PostMetadata;
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

    sendReaction(isReaction: RegExpExecArray) {
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
        const postTextboxDisabled = !this.props.canPost;
        if (this.textboxRef.current && postTextboxDisabled) {
            this.textboxRef.current.blur(); // Fixes Firefox bug which causes keyboard shortcuts to be ignored (MM-22482)
            return;
        }
        if (this.textboxRef.current && (keepFocus || !UserAgent.isMobile())) {
            this.textboxRef.current.focus();
        }
    }

    postMsgKeyPress = (e: React.KeyboardEvent<Element>) => {
        const {ctrlSend, codeBlockOnCtrlEnter} = this.props;

        const {
            allowSending,
            withClosedCodeBlock,
            ignoreKeyPress,
            message,
        } = postMessageOnKeyPress(
            e,
            this.state.message,
            Boolean(ctrlSend),
            Boolean(codeBlockOnCtrlEnter),
            Date.now(),
            this.lastChannelSwitchAt,
            this.state.caretPosition,
        ) as {
            allowSending: boolean;
            withClosedCodeBlock?: boolean;
            ignoreKeyPress?: boolean;
            message?: string;
        };

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

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        if (this.saveDraftFrame) {
            clearTimeout(this.saveDraftFrame);
        }

        this.saveDraftFrame = window.setTimeout(() => {
            this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, draft);
        }, CreatePostDraftTimeoutMilliseconds);
        this.draftsForChannel[channelId] = draft;
    }

    pasteHandler = (e: ClipboardEvent) => {
        if (!e.clipboardData || !e.clipboardData.items || (e.target && (e.target as any).id !== 'post_textbox')) {
            return;
        }

        const {clipboardData} = e;
        let table = getTable(clipboardData);
        if (!table) {
            return;
        }
        table = table as HTMLTableElement;

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

    handleUploadStart = (clientIds: string[], channelId: string) => {
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

    handleUploadProgress = (filePreviewInfo: FilePreviewInfo) => {
        const uploadsProgressPercent = {...this.state.uploadsProgressPercent, [filePreviewInfo.clientId]: filePreviewInfo};
        this.setState({uploadsProgressPercent});
    }

    handleFileUploadComplete = (fileInfos: FileInfo[], clientIds: string[], channelId: string) => {
        const draft = {...this.draftsForChannel[channelId]!};

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

    handleUploadError = (err: string | ServerError, clientId: string, channelId: string) => {
        const draft = {...this.draftsForChannel[channelId]!};

        let serverError = err;
        if (typeof serverError === 'string') {
            serverError = new Error(serverError);
        }

        if (draft.uploadsInProgress) {
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

    removePreview = (id: string) => {
        let modifiedDraft = {} as PostDraft;
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

    focusTextboxIfNecessary = (e: KeyboardEvent) => {
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

    documentKeyHandler = (e: KeyboardEvent) => {
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

    handleMouseUpKeyUp = (e: React.MouseEvent | React.KeyboardEvent) => {
        const caretPosition = Utils.getCaretPosition(e.target as HTMLElement);
        this.setState({
            caretPosition,
        });
    }

    handleSelect = (e: React.SyntheticEvent) => {
        Utils.adjustSelection(this.textboxRef.current?.getInputBox(), e);
    }

    handleKeyDown = (e: React.KeyboardEvent) => {
        const ctrlOrMetaKeyPressed = e.ctrlKey || e.metaKey;
        const messageIsEmpty = this.state.message.length === 0;
        const draftMessageIsEmpty = this.props.draft.message.length === 0;
        const ctrlEnterKeyCombo = (this.props.ctrlSend || this.props.codeBlockOnCtrlEnter) && Utils.isKeyPressed(e, KeyCodes.ENTER) && ctrlOrMetaKeyPressed;
        const upKeyOnly = !ctrlOrMetaKeyPressed && !e.altKey && !e.shiftKey && Utils.isKeyPressed(e, KeyCodes.UP);
        const shiftUpKeyCombo = !ctrlOrMetaKeyPressed && !e.altKey && e.shiftKey && Utils.isKeyPressed(e, KeyCodes.UP);
        const ctrlKeyCombo = Utils.cmdOrCtrlPressed(e) && !e.altKey && !e.shiftKey;
        const markdownHotkey = Utils.isKeyPressed(e, KeyCodes.B) || Utils.isKeyPressed(e, KeyCodes.I);
        const ctrlAltCombo = Utils.cmdOrCtrlPressed(e, true) && e.altKey;
        const markdownLinkKey = Utils.isKeyPressed(e, KeyCodes.K);

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
        } else if ((ctrlKeyCombo && markdownHotkey) || (ctrlAltCombo && markdownLinkKey)) {
            this.applyHotkeyMarkdown(e);
        }
    }

    editLastPost = (e: React.KeyboardEvent) => {
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
        this.props.actions.setEditingPost(lastPost.id, 'post_textbox', type);
    }

    replyToLastPost = (e: React.KeyboardEvent) => {
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

    loadPrevMessage = (e: React.KeyboardEvent) => {
        e.preventDefault();
        this.props.actions.moveHistoryIndexBack(Posts.MESSAGE_TYPES.POST).then(() => this.fillMessageFromHistory());
    }

    loadNextMessage = (e: React.KeyboardEvent) => {
        e.preventDefault();
        this.props.actions.moveHistoryIndexForward(Posts.MESSAGE_TYPES.POST).then(() => this.fillMessageFromHistory());
    }

    applyHotkeyMarkdown = (e: React.KeyboardEvent) => {
        const res = Utils.applyHotkeyMarkdown(e);

        this.setState({
            message: res.message,
        }, () => {
            const textbox = this.textboxRef.current?.getInputBox();
            Utils.setSelectionRange(textbox, res.selectionStart, res.selectionEnd);
        });
    }

    reactToLastMessage = (e: KeyboardEvent) => {
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

    setMessageAndCaretPostion = (newMessage: string, newCaretPosition: number) => {
        const textbox = this.textboxRef.current?.getInputBox();

        this.setState({
            message: newMessage,
            caretPosition: newCaretPosition,
        }, () => {
            Utils.setCaretPosition(textbox, newCaretPosition);
        });
    }

    prefillMessage = (message: string, shouldFocus?: boolean) => {
        this.setMessageAndCaretPostion(message, message.length);

        const draft = {
            ...this.props.draft,
            message,
        };
        const channelId = this.props.currentChannel.id;
        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, draft);
        this.draftsForChannel[channelId] = draft;

        if (shouldFocus) {
            const inputBox = this.textboxRef.current?.getInputBox();
            if (inputBox) {
                // programmatic click needed to close the create post tip
                inputBox.click();
            }
            this.focusTextbox(true);
        }
    }

    handleEmojiClick = (emoji: Emoji) => {
        const emojiAlias = ('short_names' in emoji && emoji.short_names && emoji.short_names[0]) || emoji.name;

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

    handleGifClick = (gif: string) => {
        if (this.state.message === '') {
            this.setState({message: gif});
        } else {
            const newMessage = ((/\s+$/).test(this.state.message)) ? this.state.message + gif : this.state.message + ' ' + gif;
            this.setState({message: newMessage});
        }
        this.handleEmojiClose();
    }

    shouldEnableSendButton() {
        return this.state.message.trim().length !== 0 || this.props.draft.fileInfos.length !== 0;
    }

    handleHeightChange = (height: number, maxHeight: number) => {
        this.setState({
            renderScrollbar: height > maxHeight,
        });

        window.requestAnimationFrame(() => {
            if (this.textboxRef.current) {
                this.setState({scrollbarWidth: Utils.scrollbarWidth(this.textboxRef.current.getInputBox())});
            }
        });
    }

    completePostTip = (source: string) => {
        this.props.actions.savePreferences(
            this.props.currentUserId,
            [{
                user_id: this.props.currentUserId,
                category: Constants.Preferences.TUTORIAL_STEP,
                name: this.props.currentUserId,
                value: (Constants.TutorialSteps.POST_POPOVER + 1).toString(),
            }],
        );
        trackEvent('ui', 'tutorial_tip_1_complete_' + source);
    }

    renderPrewrittenMessages() {
        if (this.props.prewrittenMessages !== PrewrittenMessagesTreatments.AROUND_INPUT || this.props.tutorialStep !== Constants.TutorialSteps.POST_POPOVER) {
            return null;
        }

        let id = t('create_post.prewritten.around_input.team');
        let defaultMessage = '**Send your first message** to your team';
        if (this.props.currentChannel.type === 'D') {
            if (this.props.currentChannel.teammate_id === this.props.currentUserId) {
                id = t('create_post.prewritten.around_input.self');
                defaultMessage = '**Send your first message** to yourself';
            } else {
                id = t('create_post.prewritten.around_input.dm');
                defaultMessage = '**Send your first message** to your teammate';
            }
        }
        return (
            <>
                <div className='post-create-prewritten-title'>
                    <FormattedMarkdownMessage
                        id={id}
                        defaultMessage={defaultMessage}
                    />
                    <button
                        type='button'
                        className='btn-icon'
                        aria-label='Got it'
                        onClick={() => this.completePostTip('close_prewritten_wrapper')}
                    >
                        <i className='icon icon-close'/>
                    </button>
                </div>
                <PrewrittenChips
                    prewrittenMessages={this.props.prewrittenMessages}
                    prefillMessage={this.prefillMessage}
                    currentChannel={this.props.currentChannel}
                    currentUserId={this.props.currentUserId}
                    currentChannelTeammateUsername={this.props.currentChannelTeammateUsername}
                />
            </>
        );
    }

    render() {
        const {
            currentChannel,
            draft,
            fullWidthTextBox,
            showTutorialTip,
            canPost,
        } = this.props;
        const readOnlyChannel = !canPost;
        const {formatMessage} = this.props.intl;
        const {renderScrollbar} = this.state;
        const ariaLabelMessageInput = Utils.localizeMessage('accessibility.sections.centerFooter', 'message input complimentary region');

        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <MessageSubmitError
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
            tutorialTip = (
                <CreatePostTip
                    prewrittenMessages={this.props.prewrittenMessages}
                    prefillMessage={this.prefillMessage}
                    currentChannel={this.props.currentChannel}
                    currentUserId={this.props.currentUserId}
                    currentChannelTeammateUsername={this.props.currentChannelTeammateUsername}
                />
            );
        }

        let centerClass = '';
        if (!fullWidthTextBox) {
            centerClass = 'center';
        }

        let prewrittenClass = '';
        if (this.props.prewrittenMessages === PrewrittenMessagesTreatments.AROUND_INPUT && this.props.tutorialStep === Constants.TutorialSteps.POST_POPOVER) {
            prewrittenClass = 'prewritten';
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
                    channelId={currentChannel.id}
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
                className={centerClass + prewrittenClass}
                onSubmit={this.handleSubmit}
            >
                {this.renderPrewrittenMessages()}
                <div
                    className={'post-create' + attachmentsDisabled + scrollbarClass}
                    style={this.state.renderScrollbar && this.state.scrollbarWidth ? {'--detected-scrollbar-width': `${this.state.scrollbarWidth}px`} as any : undefined}
                >
                    <div className='post-create-body'>
                        <div
                            role='application'
                            id='centerChannelFooter'
                            aria-label={ariaLabelMessageInput}
                            tabIndex={-1}
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
                                    tabIndex={0}
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
            </form>
        );
    }
}

export default injectIntl(CreatePost);
/* eslint-enable react/no-string-refs */
