// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React from 'react';

import {sortFileInfos} from 'mattermost-redux/utils/file_utils';

import Constants, {StoragePrefixes, ModalIdentifiers} from 'utils/constants';
import {
    containsAtChannel,
    specialMentionsInText,
    isErrorInvalidSlashCommand,
    groupsMentionedInText,
} from 'utils/post_utils';
import {getTable, formatMarkdownTableMessage, formatGithubCodePaste, isGitHubCodeBlock} from 'utils/paste';
import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils.jsx';

import NotifyConfirmModal from 'components/notify_confirm_modal';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import EditChannelPurposeModal from 'components/edit_channel_purpose_modal';
import FilePreview from 'components/file_preview';
import {FileUpload as FileUploadClass} from 'components/file_upload/file_upload';
import MsgTyping from 'components/msg_typing';
import ResetStatusModal from 'components/reset_status_modal';
import TextboxLinks from 'components/textbox/textbox_links';

import MessageSubmitError from 'components/message_submit_error';
import {Channel, ChannelMemberCountsByGroup} from 'mattermost-redux/types/channels';
import {PostDraft} from 'types/store/rhs';
import {Post, PostMetadata} from 'mattermost-redux/types/posts';
import EmojiMap from 'utils/emoji_map';
import {ActionResult} from 'mattermost-redux/types/actions';
import {ServerError} from 'mattermost-redux/types/errors';
import {CommandArgs} from 'mattermost-redux/types/integrations';
import {Group} from 'mattermost-redux/types/groups';
import {ModalData} from 'types/actions';
import {FileInfo} from 'mattermost-redux/types/files';
import {FilePreviewInfo} from 'components/file_preview/file_preview';
import {SendMessageTour} from 'components/onboarding_tour';

import Controls from './controls';
import InputTextbox, {InputTextboxRef} from './input_textbox';

const CreatePostDraftTimeoutMilliseconds = 500;

// Temporary fix for IE-11, see MM-13423
function trimRight(str: string) {
    if (String.prototype.trimRight as any) {
        return str.trimRight();
    }

    return str.replace(/\s*$/, '');
}

const emptyFunction = () => {/* Do nothing */};
type Props = {

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
  *  Flag used for adding a class center to Postbox based on user pref
  */
    fullWidthTextBox?: boolean;

    /**
  *  Data used for deciding if tutorial tip is to be shown
  */
    showSendTutorialTip: boolean;

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
  * Whether or not file upload is allowed.
  */
    canUploadFiles: boolean;

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
  * Whether to display a confirmation modal to reset status.
  */
    userIsOutOfOffice: boolean;

    /**
  * To check if the timezones are enable on the server.
  */
    isTimezoneEnabled: boolean;

    canPost: boolean;

    /**
  * To determine if the current user can send special channel mentions
  */
    useChannelMentions: boolean;

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
      * Function to open a modal
      */
        openModal: <P>(modalData: ModalData<P>) => void;

        executeCommand: (message: string, args: CommandArgs) => ActionResult;

        /**
      * Function to get the users timezones in the channel
      */
        getChannelTimezones: (channelId: string) => ActionResult;
        scrollPostListToBottom: () => void;

        getChannelMemberCountsByGroup: (channelId: string, includeTimezones: boolean) => void;
    };

    groupsWithAllowReference: Map<string, Group> | null;
    channelMemberCountsByGroup: ChannelMemberCountsByGroup;
    useLDAPGroupMentions: boolean;
    useCustomGroupMentions: boolean;
    markdownPreviewFeatureIsEnabled: boolean;
}

type State = {
    message: string;
    caretPosition: number;
    submitting: boolean;
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
    private draftsForChannel: {[channelID: string]: PostDraft | null} = {}
    private lastOrientation?: string;
    private saveDraftFrame?: number | null;

    private topDiv: React.RefObject<HTMLFormElement>;
    private textboxRef: React.RefObject<InputTextboxRef>;
    private fileUploadRef: React.RefObject<FileUploadClass>;

    static getDerivedStateFromProps(props: Props, state: State): Partial<State> {
        let updatedState: Partial<State> = {currentChannel: props.currentChannel};
        if (props.currentChannel.id !== state.currentChannel.id) {
            updatedState = {
                ...updatedState,
                submitting: false,
                serverError: null,
            };
        }
        return updatedState;
    }

    constructor(props: Props) {
        super(props);
        this.state = {
            message: props.draft.message,
            caretPosition: props.draft.message.length,
            submitting: false,
            uploadsProgressPercent: {},
            renderScrollbar: false,
            scrollbarWidth: 0,
            currentChannel: props.currentChannel,
            errorClass: null,
            serverError: null,
        };

        this.topDiv = React.createRef<HTMLFormElement>();
        this.textboxRef = React.createRef<InputTextboxRef>();
        this.fileUploadRef = React.createRef<FileUploadClass>();
    }

    componentDidMount() {
        const {useLDAPGroupMentions, currentChannel, isTimezoneEnabled, actions} = this.props;
        this.onOrientationChange();
        actions.setShowPreview(false);
        actions.clearDraftUploads();
        this.focusTextbox();
        document.addEventListener('paste', this.pasteHandler);
        window.addEventListener('beforeunload', this.unloadHandler);
        this.setOrientationListeners();

        if (useLDAPGroupMentions) {
            actions.getChannelMemberCountsByGroup(currentChannel.id, isTimezoneEnabled);
        }
    }

    componentDidUpdate(prevProps: Props) {
        const {useLDAPGroupMentions, currentChannel, isTimezoneEnabled, actions} = this.props;
        if (prevProps.currentChannel.id !== currentChannel.id) {
            this.focusTextbox();
            this.saveDraft(prevProps);
            if (useLDAPGroupMentions) {
                actions.getChannelMemberCountsByGroup(currentChannel.id, isTimezoneEnabled);
            }
        }

        if (currentChannel.id !== prevProps.currentChannel.id) {
            actions.setShowPreview(false);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('paste', this.pasteHandler);
        window.removeEventListener('beforeunload', this.unloadHandler);
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

    doSubmit = async (message: string) => {
        let newMessage = message;
        const channelId = this.props.currentChannel.id;

        if (this.props.draft.uploadsInProgress.length > 0 || this.state.submitting) {
            return;
        }

        let ignoreSlash = false;
        const serverError = this.state.serverError;

        if (serverError && isErrorInvalidSlashCommand(serverError) && serverError.submittedMessage === newMessage) {
            newMessage = serverError.submittedMessage;
            ignoreSlash = true;
        }

        const post = {} as Post;
        post.file_ids = [];
        post.message = newMessage;

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

        this.props.actions.addMessageIntoHistory(newMessage);

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
                    message: post.message,
                    serverError: {
                        ...hookResult.error,
                        submittedMessage: post.message,
                    },
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
                            message: post.message,
                            serverError: {
                                ...error,
                                submittedMessage: post.message,
                            },
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
    }

    handleNotifyAllConfirmation = (message: string) => {
        this.doSubmit(message);
    }

    showNotifyAllModal = (mentions: string[], channelTimezoneCount: number, memberNotifyCount: number, message: string) => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.NOTIFY_CONFIRM_MODAL,
            dialogType: NotifyConfirmModal,
            dialogProps: {
                mentions,
                channelTimezoneCount,
                memberNotifyCount,
                onConfirm: () => this.handleNotifyAllConfirmation(message),
            },
        });
    }

    getStatusFromSlashCommand = (message: string) => {
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

    handleSubmitEvent = (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        this.handleSubmit(this.state.message || '');
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

    handleSubmit = async (message: string) => {
        const {
            currentChannel: updateChannel,
            userIsOutOfOffice,
            groupsWithAllowReference,
            channelMemberCountsByGroup,
            currentChannelMembersCount,
            useLDAPGroupMentions,
            useCustomGroupMentions,
        } = this.props;

        const notificationsToChannel = this.props.enableConfirmNotificationsToChannel && this.props.useChannelMentions;
        let memberNotifyCount = 0;
        let channelTimezoneCount = 0;
        let mentions: string[] = [];

        const specialMentions = specialMentionsInText(message);
        const hasSpecialMentions = Object.values(specialMentions).includes(true);

        if (this.props.enableConfirmNotificationsToChannel && !hasSpecialMentions && (useLDAPGroupMentions || useCustomGroupMentions)) {
            // Groups mentioned in users text
            const mentionGroups = groupsMentionedInText(message, groupsWithAllowReference);
            if (mentionGroups.length > 0) {
                mentionGroups.
                    forEach((group) => {
                        if (group.source === 'ldap' && !useLDAPGroupMentions) {
                            return;
                        }
                        if (group.source === 'custom' && !useCustomGroupMentions) {
                            return;
                        }
                        const mappedValue = channelMemberCountsByGroup[group.id];
                        if (mappedValue && mappedValue.channel_member_count > Constants.NOTIFY_ALL_MEMBERS && mappedValue.channel_member_count > memberNotifyCount) {
                            memberNotifyCount = mappedValue.channel_member_count;
                            channelTimezoneCount = mappedValue.channel_member_timezones_count;
                        }
                        mentions.push(`@${group.name}`);
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
            this.showNotifyAllModal(mentions, channelTimezoneCount, memberNotifyCount, message);
            return;
        }

        const status = this.getStatusFromSlashCommand(message);
        if (userIsOutOfOffice && this.isStatusSlashCommand(status)) {
            const resetStatusModalData = {
                modalId: ModalIdentifiers.RESET_STATUS,
                dialogType: ResetStatusModal,
                dialogProps: {newStatus: status},
            };

            this.props.actions.openModal(resetStatusModalData);
            this.setState({message: ''});
            return;
        }

        if (trimRight(message) === '/header') {
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
        if (!isDirectOrGroup && trimRight(message) === '/purpose') {
            const editChannelPurposeModalData = {
                modalId: ModalIdentifiers.EDIT_CHANNEL_PURPOSE,
                dialogType: EditChannelPurposeModal,
                dialogProps: {channel: updateChannel},
            };

            this.props.actions.openModal(editChannelPurposeModalData);

            this.setState({message: ''});
            return;
        }

        await this.doSubmit(message);
    }

    sendMessage = async (originalPost: Post) => {
        const {
            actions,
            currentChannel,
            currentUserId,
            draft,
            useLDAPGroupMentions,
            useChannelMentions,
            groupsWithAllowReference,
            useCustomGroupMentions,
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
        if (!useLDAPGroupMentions && !useCustomGroupMentions && groupsMentionedInText(post.message, groupsWithAllowReference)) {
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

        let message = this.state.message || '';
        const caretPosition = this.state.caretPosition || 0;
        if (isGitHubCodeBlock(table.className)) {
            const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste(caretPosition, message, clipboardData);
            const newCaretPosition = caretPosition + formattedCodeBlock.length;
            this.setMessageAndCaretPosition(formattedMessage, newCaretPosition);
            return;
        }

        const originalSize = message.length;
        message = formatMarkdownTableMessage(table, message.trim(), caretPosition);
        const newCaretPosition = message.length - (originalSize - caretPosition);
        this.setMessageAndCaretPosition(message, newCaretPosition);
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

    handleUploadError = (err: string | ServerError | null, clientId: string, channelId: string) => {
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

    handleBlur = () => {
        this.lastBlurAt = Date.now();
    }

    setMessageAndCaretPosition = (newMessage: string, newCaretPosition: number) => {
        const textbox = this.textboxRef.current;
        if (!textbox) {
            return;
        }
        this.setState({message: newMessage, caretPosition: newCaretPosition});
    }

    prefillMessage = (message: string, shouldFocus?: boolean) => {
        this.setMessageAndCaretPosition(message, message.length);

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

    onUpdatedCaretPosition = (p: number) => {
        this.setState({
            caretPosition: p,
        });
    }

    render() {
        const {
            currentChannel,
            draft,
            fullWidthTextBox,
            showSendTutorialTip,
            canPost,
        } = this.props;
        const readOnlyChannel = !canPost;
        const {renderScrollbar} = this.state;
        const ariaLabelMessageInput = Utils.localizeMessage('accessibility.sections.centerFooter', 'message input complimentary region');

        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <MessageSubmitError
                    error={this.state.serverError}
                    submittedMessage={this.state.serverError.submittedMessage}
                    handleSubmit={this.handleSubmitEvent}
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

        let SendTutorialTip = null;
        if (showSendTutorialTip) {
            SendTutorialTip = (
                <SendMessageTour
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

        let attachmentsDisabled = '';
        if (!this.props.canUploadFiles) {
            attachmentsDisabled = ' post-create--attachment-disabled';
        }

        let scrollbarClass = '';
        if (renderScrollbar) {
            scrollbarClass = ' scroll';
        }

        const message = this.state.message;

        return (
            <form
                id='create_post'
                ref={this.topDiv}
                className={centerClass}
                onSubmit={this.handleSubmitEvent}
            >
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
                            <InputTextbox
                                channelId={this.props.currentChannel.id}
                                onBlur={this.handleBlur}
                                onHeightChanged={this.handleHeightChange}
                                onPostError={this.handlePostError}
                                rootId={''}
                                submit={this.handleSubmit}
                                ref={this.textboxRef}
                                caretPosition={this.state.caretPosition}
                                handleChange={this.handleChange}
                                updateCaretPosition={this.onUpdatedCaretPosition}
                                value={this.state.message}
                            />
                            <Controls
                                caretPosition={this.state.caretPosition || 0}
                                channelId={this.props.currentChannel.id}
                                fileInfos={this.props.draft.fileInfos}
                                fileUploadProps={{
                                    fileCount: this.getFileCount(),
                                    fileUploadRef: this.fileUploadRef,
                                    getFileUploadTarget: this.getFileUploadTarget,
                                    handleFileUploadChange: this.handleFileUploadChange,
                                    handleFileUploadComplete: this.handleFileUploadComplete,
                                    handleUploadError: this.handleUploadError,
                                    handleUploadProgress: this.handleUploadProgress,
                                    handleUploadStart: this.handleUploadStart,
                                }}
                                focusTextbox={this.textboxRef.current?.focus || emptyFunction}
                                handleSubmit={this.handleSubmit}
                                message={message}
                                setMessageAndCaretPosition={this.setMessageAndCaretPosition}
                                isThreadView={false}
                                rootId={''}
                            />
                        </div>
                        {SendTutorialTip}
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
                                isMarkdownPreviewEnabled={this.props.canPost && this.props.markdownPreviewFeatureIsEnabled}
                                hasExceededCharacterLimit={readOnlyChannel ? false : message.length > this.props.maxPostSize}
                                showPreview={this.props.shouldShowPreview}
                                updatePreview={this.setShowPreview}
                                hasText={readOnlyChannel ? false : message.length > 0}
                            />
                        </div>
                        <div>
                            {postError}
                            {preview}
                            {serverError}
                        </div>
                    </div>
                </div>
            </form>
        );
    }
}

export default CreatePost;
/* eslint-enable react/no-string-refs */
