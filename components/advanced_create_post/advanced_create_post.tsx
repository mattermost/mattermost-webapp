// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {AlertCircleOutlineIcon, CheckCircleOutlineIcon} from '@mattermost/compass-icons/components';

import {Posts} from 'mattermost-redux/constants';
import {sortFileInfos} from 'mattermost-redux/utils/file_utils';
import {ActionResult} from 'mattermost-redux/types/actions';

import * as GlobalActions from 'actions/global_actions';
import Constants, {
    StoragePrefixes,
    ModalIdentifiers,
    Locations,
    A11yClassNames,
    Preferences,
    AdvancedTextEditor as AdvancedTextEditorConst,
} from 'utils/constants';
import {
    containsAtChannel,
    specialMentionsInText,
    postMessageOnKeyPress,
    shouldFocusMainTextbox,
    isErrorInvalidSlashCommand,
    splitMessageBasedOnCaretPosition,
    groupsMentionedInText,
    mentionsMinusSpecialMentionsInText,
} from 'utils/post_utils';
import {getTable, hasHtmlLink, formatMarkdownMessage, formatGithubCodePaste, isGitHubCodeBlock} from 'utils/paste';
import * as UserAgent from 'utils/user_agent';
import {isMac} from 'utils/utils';
import * as Utils from 'utils/utils';
import EmojiMap from 'utils/emoji_map';
import {applyMarkdown, ApplyMarkdownOptions} from 'utils/markdown/apply_markdown';

import Tooltip from 'components/tooltip';
import OverlayTrigger from 'components/overlay_trigger';
import KeyboardShortcutSequence, {KEYBOARD_SHORTCUTS} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';
import NotifyConfirmModal from 'components/notify_confirm_modal';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import EditChannelPurposeModal from 'components/edit_channel_purpose_modal';
import {FileUpload as FileUploadClass} from 'components/file_upload/file_upload';
import ResetStatusModal from 'components/reset_status_modal';
import TextboxClass from 'components/textbox/textbox';
import PostPriorityPickerOverlay from 'components/post_priority/post_priority_picker_overlay';
import PriorityLabel from 'components/post_priority/post_priority_label';

import {PostDraft} from 'types/store/draft';

import {ModalData} from 'types/actions';

import {Channel, ChannelMemberCountsByGroup} from '@mattermost/types/channels';
import {Post, PostMetadata, PostPriorityMetadata} from '@mattermost/types/posts';
import {PreferenceType} from '@mattermost/types/preferences';
import {ServerError} from '@mattermost/types/errors';
import {CommandArgs} from '@mattermost/types/integrations';
import {Group, GroupSource} from '@mattermost/types/groups';
import {FileInfo} from '@mattermost/types/files';
import {Emoji} from '@mattermost/types/emojis';

import AdvancedTextEditor from '../advanced_text_editor/advanced_text_editor';
import {IconContainer} from '../advanced_text_editor/formatting_bar/formatting_icon';

import FileLimitStickyBanner from '../file_limit_sticky_banner';
import {FilePreviewInfo} from '../file_preview/file_preview';
const KeyCodes = Constants.KeyCodes;

function isDraftEmpty(draft: PostDraft): boolean {
    return !draft || (!draft.message && draft.fileInfos.length === 0);
}

// Temporary fix for IE-11, see MM-13423
function trimRight(str: string) {
    if (String.prototype.trimRight as any) {
        return str.trimRight();
    }

    return str.replace(/\s*$/, '');
}

type TextboxElement = HTMLInputElement | HTMLTextAreaElement;

type Props = {

    // ref passed from channelView for EmojiPickerOverlay
    getChannelView?: () => void;

    // Data used in notifying user for @all and @channel
    currentChannelMembersCount: number;

    // Data used in multiple places of the component
    currentChannel: Channel;

    //Data used for DM prewritten messages
    currentChannelTeammateUsername?: string;

    //Data used in executing commands for channel actions passed down to client4 function
    currentTeamId: string;

    //Data used for posting message
    currentUserId: string;

    //Force message submission on CTRL/CMD + ENTER
    codeBlockOnCtrlEnter?: boolean;

    //Flag used for handling submit
    ctrlSend?: boolean;

    //Flag used for adding a class center to Postbox based on user pref
    fullWidthTextBox?: boolean;

    // Data used for deciding if tutorial tip is to be shown
    showSendTutorialTip: boolean;

    // Data used populating message state when triggered by shortcuts
    messageInHistoryItem?: string;

    // Data used for populating message state from previous draft
    draft: PostDraft;

    // Data used dispatching handleViewAction ex: edit post
    latestReplyablePostId?: string;
    locale: string;

    // Data used for calling edit of post
    currentUsersLatestPost?: Post | null;

    //Whether or not file upload is allowed.
    canUploadFiles: boolean;

    //Whether to show the emoji picker.
    enableEmojiPicker: boolean;

    //Whether to show the gif picker.
    enableGifPicker: boolean;

    //Whether to check with the user before notifying the whole channel.
    enableConfirmNotificationsToChannel: boolean;

    //The maximum length of a post
    maxPostSize: number;
    emojiMap: EmojiMap;

    //If our connection is bad
    badConnection: boolean;

    //Whether to display a confirmation modal to reset status.
    userIsOutOfOffice: boolean;
    rhsExpanded: boolean;

    //If RHS open
    rhsOpen: boolean;

    //To check if the timezones are enable on the server.
    isTimezoneEnabled: boolean;

    canPost: boolean;

    //To determine if the current user can send special channel mentions
    useChannelMentions: boolean;

    //Should preview be showed
    shouldShowPreview: boolean;

    isFormattingBarHidden: boolean;

    isPostPriorityEnabled: boolean;

    actions: {

        //Set show preview for textbox
        setShowPreview: (showPreview: boolean) => void;

        // func called after message submit.
        addMessageIntoHistory: (message: string) => void;

        // func called for navigation through messages by Up arrow
        moveHistoryIndexBack: (index: string) => Promise<void>;

        // func called for navigation through messages by Down arrow
        moveHistoryIndexForward: (index: string) => Promise<void>;

        // func called for adding a reaction
        addReaction: (postId: string, emojiName: string) => void;

        // func called for posting message
        onSubmitPost: (post: Post, fileInfos: FileInfo[]) => void;

        // func called for removing a reaction
        removeReaction: (postId: string, emojiName: string) => void;

        // func called on load of component to clear drafts
        clearDraftUploads: () => void;

        //hooks called before a message is sent to the server
        runMessageWillBePostedHooks: (originalPost: Post) => ActionResult;

        //hooks called before a slash command is sent to the server
        runSlashCommandWillBePostedHooks: (originalMessage: string, originalArgs: CommandArgs) => ActionResult;

        // func called for setting drafts
        setDraft: (name: string, value: PostDraft | null, draftChannelId: string, save?: boolean) => void;

        // func called for editing posts
        setEditingPost: (postId?: string, refocusId?: string, title?: string, isRHS?: boolean) => void;

        // func called for opening the last replayable post in the RHS
        selectPostFromRightHandSideSearchByPostId: (postId: string) => void;

        //Function to open a modal
        openModal: <P>(modalData: ModalData<P>) => void;

        executeCommand: (message: string, args: CommandArgs) => ActionResult;

        //Function to get the users timezones in the channel
        getChannelTimezones: (channelId: string) => ActionResult;
        scrollPostListToBottom: () => void;

        //Function to set or unset emoji picker for last message
        emitShortcutReactToLastPostFrom: (emittedFrom: string) => void;

        getChannelMemberCountsByGroup: (channelId: string, includeTimezones: boolean) => void;

        //Function used to advance the tutorial forward
        savePreferences: (userId: string, preferences: PreferenceType[]) => ActionResult;

        searchAssociatedGroupsForReference: (prefix: string, teamId: string, channelId: string | undefined) => Promise<{ data: any }>;
    };

    groupsWithAllowReference: Map<string, Group> | null;
    channelMemberCountsByGroup: ChannelMemberCountsByGroup;
    useLDAPGroupMentions: boolean;
    useCustomGroupMentions: boolean;
}

type State = {
    message: string;
    caretPosition: number;
    submitting: boolean;
    showEmojiPicker: boolean;
    uploadsProgressPercent: {[clientID: string]: FilePreviewInfo};
    renderScrollbar: boolean;
    scrollbarWidth: number;
    currentChannel: Channel;
    errorClass: string | null;
    serverError: (ServerError & {submittedMessage?: string}) | null;
    postError?: React.ReactNode;
    showFormat: boolean;
    isFormattingBarHidden: boolean;
    showPostPriorityPicker: boolean;
};

class AdvancedCreatePost extends React.PureComponent<Props, State> {
    static defaultProps = {
        latestReplyablePostId: '',
    };

    private lastBlurAt = 0;
    private lastChannelSwitchAt = 0;
    private draftsForChannel: {[channelID: string]: PostDraft | null} = {};
    private lastOrientation?: string;
    private saveDraftFrame?: number | null;
    private isDraftSubmitting = false;

    private topDiv: React.RefObject<HTMLFormElement>;
    private textboxRef: React.RefObject<TextboxClass>;
    private fileUploadRef: React.RefObject<FileUploadClass>;
    private postPriorityPickerRef: React.RefObject<HTMLButtonElement>;

    static getDerivedStateFromProps(props: Props, state: State): Partial<State> {
        let updatedState: Partial<State> = {
            currentChannel: props.currentChannel,
        };
        if (
            props.currentChannel.id !== state.currentChannel.id ||
            (props.draft.remote && props.draft.message !== state.message)
        ) {
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
            showEmojiPicker: false,
            uploadsProgressPercent: {},
            renderScrollbar: false,
            scrollbarWidth: 0,
            currentChannel: props.currentChannel,
            errorClass: null,
            serverError: null,
            showFormat: false,
            isFormattingBarHidden: props.isFormattingBarHidden,
            showPostPriorityPicker: false,
        };

        this.topDiv = React.createRef<HTMLFormElement>();
        this.textboxRef = React.createRef<TextboxClass>();
        this.fileUploadRef = React.createRef<FileUploadClass>();
        this.postPriorityPickerRef = React.createRef<HTMLButtonElement>();
    }

    componentDidMount() {
        const {actions} = this.props;
        this.onOrientationChange();
        actions.setShowPreview(false);
        actions.clearDraftUploads();
        this.focusTextbox();
        document.addEventListener('paste', this.pasteHandler);
        document.addEventListener('keydown', this.documentKeyHandler);
        window.addEventListener('beforeunload', this.unloadHandler);
        this.setOrientationListeners();
        this.getChannelMemberCountsByGroup();
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const {currentChannel, actions} = this.props;
        if (prevProps.currentChannel.id !== currentChannel.id) {
            this.lastChannelSwitchAt = Date.now();
            this.focusTextbox();
            this.saveDraftWithShow(prevProps);
            this.getChannelMemberCountsByGroup();
        }

        if (currentChannel.id !== prevProps.currentChannel.id) {
            actions.setShowPreview(false);
        }

        // Focus on textbox when emoji picker is closed
        if (prevState.showEmojiPicker && !this.state.showEmojiPicker) {
            this.focusTextbox();
        }

        // Focus on textbox when returned from preview mode
        if (prevProps.shouldShowPreview && !this.props.shouldShowPreview) {
            this.focusTextbox();
        }
    }

    componentWillUnmount() {
        document.removeEventListener('paste', this.pasteHandler);
        document.removeEventListener('keydown', this.documentKeyHandler);
        window.removeEventListener('beforeunload', this.unloadHandler);
        this.removeOrientationListeners();
        this.saveDraftWithShow();
    }

    getChannelMemberCountsByGroup = () => {
        const {useLDAPGroupMentions, useCustomGroupMentions, currentChannel, isTimezoneEnabled, actions, draft} = this.props;

        if ((useLDAPGroupMentions || useCustomGroupMentions) && currentChannel.id) {
            const mentions = mentionsMinusSpecialMentionsInText(draft.message);

            if (mentions.length === 1) {
                actions.searchAssociatedGroupsForReference(mentions[0], this.props.currentTeamId, currentChannel.id);
            } else if (mentions.length > 1) {
                actions.getChannelMemberCountsByGroup(currentChannel.id, isTimezoneEnabled);
            }
        }
    }

    unloadHandler = () => {
        this.saveDraftWithShow();
    }

    saveDraftWithShow = (props = this.props) => {
        if (this.saveDraftFrame && props.currentChannel) {
            const channelId = props.currentChannel.id;
            const draft = this.draftsForChannel[channelId];

            if (draft) {
                this.draftsForChannel[channelId] = {
                    ...draft,
                    show: !isDraftEmpty(draft),
                    remote: false,
                } as PostDraft;
            }
        }

        this.saveDraft(props, true);
    }

    saveDraft = (props = this.props, save = false) => {
        if (this.saveDraftFrame && props.currentChannel) {
            const channelId = props.currentChannel.id;
            props.actions.setDraft(StoragePrefixes.DRAFT + channelId, this.draftsForChannel[channelId], channelId, save);
            clearTimeout(this.saveDraftFrame);
            this.saveDraftFrame = null;
        }
    }

    setShowPreview = (newPreviewValue: boolean) => {
        this.props.actions.setShowPreview(newPreviewValue);
    }

    setOrientationListeners = () => {
        if (window.screen.orientation && 'onchange' in window.screen.orientation) {
            window.screen.orientation.addEventListener('change', this.onOrientationChange);
        } else if ('onorientationchange' in window) {
            window.addEventListener('orientationchange', this.onOrientationChange);
        }
    };

    removeOrientationListeners = () => {
        if (window.screen.orientation && 'onchange' in window.screen.orientation) {
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

        if (
            this.lastOrientation &&
            orientation !== this.lastOrientation &&
            (document.activeElement || {}).id === 'post_textbox'
        ) {
            this.textboxRef.current?.blur();
        }

        this.lastOrientation = orientation;
    }

    handlePostError = (postError: React.ReactNode) => {
        if (this.state.postError !== postError) {
            this.setState({postError});
        }
    }

    toggleEmojiPicker = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
        e?.stopPropagation();
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
        post.props = this.props.draft.props || {};
        post.metadata = (this.props.draft.metadata || {}) as PostMetadata;

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
        const forceFocus = Date.now() - this.lastBlurAt < fasterThanHumanWillClick;
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
            showFormat: false,
        });

        if (this.saveDraftFrame) {
            clearTimeout(this.saveDraftFrame);
        }

        this.isDraftSubmitting = false;
        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, null, channelId);
        this.draftsForChannel[channelId] = null;
    }

    handleNotifyAllConfirmation = () => {
        this.doSubmit();
    }

    showNotifyAllModal = (mentions: string[], channelTimezoneCount: number, memberNotifyCount: number) => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.NOTIFY_CONFIRM_MODAL,
            dialogType: NotifyConfirmModal,
            dialogProps: {
                mentions,
                channelTimezoneCount,
                memberNotifyCount,
                onConfirm: () => this.handleNotifyAllConfirmation(),
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
        return command === 'online' || command === 'away' || command === 'dnd' || command === 'offline';
    };

    handleSubmit = async (e: React.FormEvent) => {
        const {
            currentChannel: updateChannel,
            userIsOutOfOffice,
            groupsWithAllowReference,
            channelMemberCountsByGroup,
            currentChannelMembersCount,
            useLDAPGroupMentions,
            useCustomGroupMentions,
        } = this.props;

        this.setShowPreview(false);
        this.isDraftSubmitting = true;

        const notificationsToChannel = this.props.enableConfirmNotificationsToChannel && this.props.useChannelMentions;
        let memberNotifyCount = 0;
        let channelTimezoneCount = 0;
        let mentions: string[] = [];

        const specialMentions = specialMentionsInText(this.state.message);
        const hasSpecialMentions = Object.values(specialMentions).includes(true);

        if (this.props.enableConfirmNotificationsToChannel && !hasSpecialMentions && (useLDAPGroupMentions || useCustomGroupMentions)) {
            // Groups mentioned in users text
            const mentionGroups = groupsMentionedInText(this.state.message, groupsWithAllowReference);
            if (mentionGroups.length > 0) {
                mentionGroups.
                    forEach((group) => {
                        if (group.source === GroupSource.Ldap && !useLDAPGroupMentions) {
                            return;
                        }
                        if (group.source === GroupSource.Custom && !useCustomGroupMentions) {
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

        if (notificationsToChannel && currentChannelMembersCount > Constants.NOTIFY_ALL_MEMBERS && hasSpecialMentions) {
            memberNotifyCount = currentChannelMembersCount - 1;

            for (const k in specialMentions) {
                if (specialMentions[k]) {
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
            this.isDraftSubmitting = false;
            return;
        }

        const status = this.getStatusFromSlashCommand();
        if (userIsOutOfOffice && this.isStatusSlashCommand(status)) {
            const resetStatusModalData = {
                modalId: ModalIdentifiers.RESET_STATUS,
                dialogType: ResetStatusModal,
                dialogProps: {newStatus: status},
            };

            this.props.actions.openModal(resetStatusModalData);

            this.setState({message: ''});
            this.isDraftSubmitting = false;
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
            this.isDraftSubmitting = false;
            return;
        }

        const isDirectOrGroup =
            updateChannel.type === Constants.DM_CHANNEL || updateChannel.type === Constants.GM_CHANNEL;
        if (!isDirectOrGroup && trimRight(this.state.message) === '/purpose') {
            const editChannelPurposeModalData = {
                modalId: ModalIdentifiers.EDIT_CHANNEL_PURPOSE,
                dialogType: EditChannelPurposeModal,
                dialogProps: {channel: updateChannel},
            };

            this.props.actions.openModal(editChannelPurposeModalData);

            this.setState({message: ''});
            this.isDraftSubmitting = false;
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
        post.metadata = {
            ...originalPost.metadata,
        } as PostMetadata;

        post.props = {
            ...originalPost.props,
        };

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

            this.isDraftSubmitting = false;
            return hookResult;
        }

        post = hookResult.data;

        actions.onSubmitPost(post, draft.fileInfos);
        actions.scrollPostListToBottom();

        this.setState({submitting: false});
        this.isDraftSubmitting = false;

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

        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, null, channelId);
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

    postMsgKeyPress = (e: React.KeyboardEvent<TextboxElement>) => {
        const {ctrlSend, codeBlockOnCtrlEnter} = this.props;

        const {allowSending, withClosedCodeBlock, ignoreKeyPress, message} = postMessageOnKeyPress(
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
                this.isDraftSubmitting = true;
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

    handleChange = (e: React.ChangeEvent<TextboxElement>) => {
        const message = e.target.value;

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

        this.handleDraftChange(draft);
    }

    handleDraftChange = (draft: PostDraft, instant = false) => {
        const channelId = this.props.currentChannel.id;

        if (this.saveDraftFrame) {
            clearTimeout(this.saveDraftFrame);
        }

        if (instant) {
            this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, draft, channelId);
        } else {
            this.saveDraftFrame = window.setTimeout(() => {
                this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, draft, channelId);
            }, Constants.SAVE_DRAFT_TIMEOUT);
        }

        this.draftsForChannel[channelId] = draft;
    }

    pasteHandler = (e: ClipboardEvent) => {
        /**
         * casting HTMLInputElement on the EventTarget was necessary here
         * since the ClipboardEvent type is not generic
         */
        if (!e.clipboardData || !e.clipboardData.items || ((e.target as TextboxElement)?.id !== 'post_textbox')) {
            return;
        }

        const {clipboardData} = e;

        const hasLinks = hasHtmlLink(clipboardData);
        let table = getTable(clipboardData);
        if (!table && !hasLinks) {
            return;
        }
        table = table as HTMLTableElement;

        e.preventDefault();

        const message = this.state.message;
        if (table && isGitHubCodeBlock(table.className)) {
            const selectionStart = (e.target as any).selectionStart;
            const selectionEnd = (e.target as any).selectionEnd;
            const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste({selectionStart, selectionEnd, message, clipboardData});
            const newCaretPosition = this.state.caretPosition + formattedCodeBlock.length;
            this.setMessageAndCaretPostion(formattedMessage, newCaretPosition);
            return;
        }

        const originalSize = message.length;
        const formattedMessage = formatMarkdownMessage(clipboardData, message.trim(), this.state.caretPosition);
        const newCaretPosition = formattedMessage.length - (originalSize - this.state.caretPosition);
        this.setMessageAndCaretPostion(formattedMessage, newCaretPosition);
        this.handlePostPasteDraft(formattedMessage);
    }

    handlePostPasteDraft = (message: string) => {
        const draft = {
            ...this.props.draft,
            message,
        };

        const channelId = this.props.currentChannel.id;
        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, draft, channelId);
        this.draftsForChannel[channelId] = draft;
    }

    handleFileUploadChange = () => {
        this.focusTextbox();
    }

    handleUploadStart = (clientIds: string[], channelId: string) => {
        const uploadsInProgress = [...this.props.draft.uploadsInProgress, ...clientIds];

        const draft = {
            ...this.props.draft,
            uploadsInProgress,
        };

        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, draft, channelId);
        this.draftsForChannel[channelId] = draft;

        // this is a bit redundant with the code that sets focus when the file input is clicked,
        // but this also resets the focus after a drag and drop
        this.focusTextbox();
    }

    handleUploadProgress = (filePreviewInfo: FilePreviewInfo) => {
        const uploadsProgressPercent = {
            ...this.state.uploadsProgressPercent,
            [filePreviewInfo.clientId]: filePreviewInfo,
        };
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

        this.handleDraftChange(draft, true);
    }

    handleUploadError = (err: string | ServerError, clientId?: string, channelId?: string) => {
        let serverError = null;
        if (typeof err === 'string' && err.length > 0) {
            serverError = new Error(err);
        }

        if (!channelId || !clientId) {
            this.setState({serverError});
            return;
        }

        const draft = {...this.draftsForChannel[channelId]!};

        if (draft.uploadsInProgress) {
            const index = draft.uploadsInProgress.indexOf(clientId);

            if (index !== -1) {
                const uploadsInProgress = draft.uploadsInProgress.filter((item, itemIndex) => index !== itemIndex);
                const modifiedDraft = {
                    ...draft,
                    uploadsInProgress,
                };
                this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, modifiedDraft, channelId);
                this.draftsForChannel[channelId] = modifiedDraft;
            }
        }

        this.setState({serverError});
    };

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

        this.props.actions.setDraft(StoragePrefixes.DRAFT + channelId, modifiedDraft, channelId, false);
        this.draftsForChannel[channelId] = modifiedDraft;

        this.handleFileUploadChange();

        if (this.saveDraftFrame) {
            clearTimeout(this.saveDraftFrame);
        }

        this.saveDraftFrame = window.setTimeout(() => {}, Constants.SAVE_DRAFT_TIMEOUT);
    };

    focusTextboxIfNecessary = (e: KeyboardEvent) => {
        // Focus should go to the RHS when it is expanded
        if (this.props.rhsExpanded) {
            return;
        }

        // Hacky fix to avoid cursor jumping textbox sometimes
        if (this.props.rhsOpen && document.activeElement?.tagName === 'BODY') {
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
        const lastMessageReactionKeyCombo = ctrlOrMetaKeyPressed && e.shiftKey && Utils.isKeyPressed(e, KeyCodes.BACK_SLASH);
        if (lastMessageReactionKeyCombo) {
            this.reactToLastMessage(e);
            return;
        }

        this.focusTextboxIfNecessary(e);
    }

    getFileUploadTarget = () => {
        return this.textboxRef.current?.getInputBox();
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
        this.setState({
            caretPosition: (e.target as HTMLInputElement).selectionStart || 0,
        });
    }

    handleSelect = (e: React.SyntheticEvent<Element, Event>) => {
        Utils.adjustSelection(this.textboxRef.current?.getInputBox(), e as React.KeyboardEvent<HTMLInputElement>);
    }

    handleKeyDown = (e: React.KeyboardEvent<TextboxElement>) => {
        const messageIsEmpty = this.state.message.length === 0;
        const draftMessageIsEmpty = this.props.draft.message.length === 0;

        const ctrlOrMetaKeyPressed = e.ctrlKey || e.metaKey;
        const ctrlEnterKeyCombo = (this.props.ctrlSend || this.props.codeBlockOnCtrlEnter) &&
            Utils.isKeyPressed(e, KeyCodes.ENTER) &&
            ctrlOrMetaKeyPressed;

        const ctrlKeyCombo = Utils.cmdOrCtrlPressed(e) && !e.altKey && !e.shiftKey;
        const ctrlAltCombo = Utils.cmdOrCtrlPressed(e, true) && e.altKey;
        const shiftAltCombo = !Utils.cmdOrCtrlPressed(e) && e.shiftKey && e.altKey;

        // listen for line break key combo and insert new line character
        if (Utils.isUnhandledLineBreakKeyCombo(e)) {
            this.setState({message: Utils.insertLineBreakFromKeyEvent(e)});
            return;
        }

        if (ctrlEnterKeyCombo) {
            this.setShowPreview(false);
            this.postMsgKeyPress(e);
            return;
        }

        const {message} = this.state;

        if (Utils.isKeyPressed(e, KeyCodes.ESCAPE)) {
            this.textboxRef.current?.blur();
        }

        if (
            !e.ctrlKey &&
            !e.metaKey &&
            !e.altKey &&
            !e.shiftKey &&
            Utils.isKeyPressed(e, KeyCodes.UP) &&
            message === ''
        ) {
            e.preventDefault();
            if (this.textboxRef.current) {
                this.textboxRef.current.blur();
            }

            this.editLastPost(e);
        }

        const {
            selectionStart,
            selectionEnd,
            value,
        } = e.target as TextboxElement;

        if (ctrlKeyCombo) {
            if (draftMessageIsEmpty && Utils.isKeyPressed(e, KeyCodes.UP)) {
                e.stopPropagation();
                e.preventDefault();
                this.loadPrevMessage(e);
            } else if (draftMessageIsEmpty && Utils.isKeyPressed(e, KeyCodes.DOWN)) {
                e.stopPropagation();
                e.preventDefault();
                this.loadNextMessage(e);
            } else if (Utils.isKeyPressed(e, KeyCodes.B)) {
                e.stopPropagation();
                e.preventDefault();
                this.applyMarkdown({
                    markdownMode: 'bold',
                    selectionStart,
                    selectionEnd,
                    message: value,
                });
            } else if (Utils.isKeyPressed(e, KeyCodes.I)) {
                e.stopPropagation();
                e.preventDefault();
                this.applyMarkdown({
                    markdownMode: 'italic',
                    selectionStart,
                    selectionEnd,
                    message: value,
                });
            }
        } else if (ctrlAltCombo) {
            if (Utils.isKeyPressed(e, KeyCodes.K)) {
                e.stopPropagation();
                e.preventDefault();
                this.applyMarkdown({
                    markdownMode: 'link',
                    selectionStart,
                    selectionEnd,
                    message: value,
                });
            } else if (Utils.isKeyPressed(e, KeyCodes.C)) {
                e.stopPropagation();
                e.preventDefault();
                this.applyMarkdown({
                    markdownMode: 'code',
                    selectionStart,
                    selectionEnd,
                    message: value,
                });
            } else if (Utils.isKeyPressed(e, KeyCodes.E)) {
                e.stopPropagation();
                e.preventDefault();
                this.toggleEmojiPicker();
            } else if (Utils.isKeyPressed(e, KeyCodes.T)) {
                e.stopPropagation();
                e.preventDefault();
                this.toggleAdvanceTextEditor();
            } else if (Utils.isKeyPressed(e, KeyCodes.P) && message.length) {
                e.stopPropagation();
                e.preventDefault();
                this.setShowPreview(!this.props.shouldShowPreview);
            }
        } else if (shiftAltCombo) {
            if (Utils.isKeyPressed(e, KeyCodes.X)) {
                e.stopPropagation();
                e.preventDefault();
                this.applyMarkdown({
                    markdownMode: 'strike',
                    selectionStart,
                    selectionEnd,
                    message: value,
                });
            } else if (Utils.isKeyPressed(e, KeyCodes.SEVEN)) {
                e.preventDefault();
                this.applyMarkdown({
                    markdownMode: 'ol',
                    selectionStart,
                    selectionEnd,
                    message: value,
                });
            } else if (Utils.isKeyPressed(e, KeyCodes.EIGHT)) {
                e.preventDefault();
                this.applyMarkdown({
                    markdownMode: 'ul',
                    selectionStart,
                    selectionEnd,
                    message: value,
                });
            } else if (Utils.isKeyPressed(e, KeyCodes.NINE)) {
                e.preventDefault();
                this.applyMarkdown({
                    markdownMode: 'quote',
                    selectionStart,
                    selectionEnd,
                    message: value,
                });
            }
        }
        const upKeyOnly = !ctrlOrMetaKeyPressed && !e.altKey && !e.shiftKey && Utils.isKeyPressed(e, KeyCodes.UP);
        const shiftUpKeyCombo = !ctrlOrMetaKeyPressed && !e.altKey && e.shiftKey && Utils.isKeyPressed(e, KeyCodes.UP);
        const ctrlShiftCombo = Utils.cmdOrCtrlPressed(e, true) && e.shiftKey;

        if (upKeyOnly && messageIsEmpty) {
            this.editLastPost(e);
        } else if (shiftUpKeyCombo && messageIsEmpty) {
            this.replyToLastPost(e);
        } else if (ctrlShiftCombo && Utils.isKeyPressed(e, KeyCodes.E)) {
            e.stopPropagation();
            e.preventDefault();
            this.toggleEmojiPicker();
        } else if (((isMac() && ctrlShiftCombo) || (!isMac() && ctrlAltCombo)) && Utils.isKeyPressed(e, KeyCodes.P) && this.state.message.length) {
            this.setShowPreview(!this.props.shouldShowPreview);
        } else if (ctrlAltCombo && Utils.isKeyPressed(e, KeyCodes.T)) {
            this.toggleAdvanceTextEditor();
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

    applyMarkdown = (params: ApplyMarkdownOptions) => {
        if (this.props.shouldShowPreview) {
            return;
        }

        const res = applyMarkdown(params);

        this.setState({
            message: res.message,
        }, () => {
            const textbox = this.textboxRef.current?.getInputBox();
            Utils.setSelectionRange(textbox, res.selectionStart, res.selectionEnd);

            const draft = {
                ...this.props.draft,
                message: this.state.message,
            };

            this.handleDraftChange(draft);
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
        if (!this.isDraftSubmitting) {
            this.saveDraftWithShow();
        }

        this.lastBlurAt = Date.now();
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

            const draft = {
                ...this.props.draft,
                message: this.state.message,
            };

            this.handleDraftChange(draft);
        });
    }

    prefillMessage = (message: string, shouldFocus?: boolean) => {
        this.setMessageAndCaretPostion(message, message.length);

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
            const newMessage = ':' + emojiAlias + ': ';
            this.setMessageAndCaretPostion(newMessage, newMessage.length);
        } else {
            const {message} = this.state;
            const {firstPiece, lastPiece} = splitMessageBasedOnCaretPosition(this.state.caretPosition, message);

            // check whether the first piece of the message is empty when cursor is placed at beginning of message and avoid adding an empty string at the beginning of the message
            const newMessage =
                firstPiece === '' ? `:${emojiAlias}: ${lastPiece}` : `${firstPiece} :${emojiAlias}: ${lastPiece}`;

            const newCaretPosition =
                firstPiece === '' ? `:${emojiAlias}: `.length : `${firstPiece} :${emojiAlias}: `.length;
            this.setMessageAndCaretPostion(newMessage, newCaretPosition);
        }

        this.handleEmojiClose();
    }

    handleGifClick = (gif: string) => {
        if (this.state.message === '') {
            this.setState({message: gif});
        } else {
            const newMessage = (/\s+$/).test(this.state.message) ? this.state.message + gif : this.state.message + ' ' + gif;
            this.setState({message: newMessage});

            const draft = {
                ...this.props.draft,
                newMessage,
            };

            this.handleDraftChange(draft);
        }
        this.handleEmojiClose();
    }

    toggleAdvanceTextEditor = () => {
        this.setState({
            isFormattingBarHidden:
                !this.state.isFormattingBarHidden,
        });
        this.props.actions.savePreferences(this.props.currentUserId, [{
            category: Preferences.ADVANCED_TEXT_EDITOR,
            user_id: this.props.currentUserId,
            name: AdvancedTextEditorConst.POST,
            value: String(!this.state.isFormattingBarHidden),
        }]);
    }

    handleRemovePriority = () => {
        this.handlePostPriorityApply();
    }

    handlePostPriorityApply = (settings?: PostPriorityMetadata) => {
        const updatedDraft = {
            ...this.props.draft,
        };

        if (settings?.priority || settings?.requested_ack) {
            updatedDraft.metadata = {
                priority: {
                    ...settings,
                    priority: settings!.priority || '',
                    requested_ack: settings!.requested_ack,
                },
            };
        } else {
            updatedDraft.metadata = {};
        }

        this.handleDraftChange(updatedDraft, true);
        this.focusTextbox();
    };

    handlePostPriorityHide = () => {
        this.setState({
            showPostPriorityPicker: false,
        });
        this.focusTextbox();
    };

    togglePostPriorityPicker = () => {
        this.setState((prev) => ({
            showPostPriorityPicker: !prev.showPostPriorityPicker,
        }));
    };

    getPostPriorityPickerRef = () => this.postPriorityPickerRef.current;

    hasPrioritySet = () => {
        return (
            this.props.isPostPriorityEnabled &&
            this.props.draft.metadata?.priority && (
                this.props.draft.metadata.priority.priority ||
                this.props.draft.metadata.priority.requested_ack
            )
        );
    }

    render() {
        let centerClass = '';
        if (!this.props.fullWidthTextBox) {
            centerClass = 'center';
        }

        if (!this.props.currentChannel || !this.props.currentChannel.id) {
            return null;
        }

        const priorityLabels = (
            this.hasPrioritySet() ? (
                <div className='AdvancedTextEditor__priority'>
                    {this.props.draft.metadata!.priority!.priority && (
                        <PriorityLabel
                            size='xs'
                            priority={this.props.draft.metadata!.priority!.priority}
                        />
                    )}
                    {this.props.draft.metadata!.priority!.requested_ack && (
                        <div className='AdvancedTextEditor__priority-ack'>
                            <OverlayTrigger
                                placement='top'
                                delayShow={Constants.OVERLAY_TIME_DELAY}
                                trigger={Constants.OVERLAY_DEFAULT_TRIGGER}
                                overlay={(
                                    <Tooltip
                                        id='post-priority-picker-ack-tooltip'
                                        className='AdvancedTextEditor__priority-ack-tooltip'
                                    >
                                        <FormattedMessage
                                            id={'post_priority.request_acknowledgement.tooltip'}
                                            defaultMessage={'Acknowledgement will be requested'}
                                        />
                                    </Tooltip>
                                )}
                            >
                                <CheckCircleOutlineIcon size={14}/>
                            </OverlayTrigger>
                            {!(this.props.draft.metadata!.priority!.priority) && (
                                <FormattedMessage
                                    id={'post_priority.request_acknowledgement'}
                                    defaultMessage={'Request acknowledgement'}
                                />
                            )}
                        </div>
                    )}
                    {!this.props.shouldShowPreview && (
                        <OverlayTrigger
                            placement='top'
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            trigger={Constants.OVERLAY_DEFAULT_TRIGGER}
                            overlay={(
                                <Tooltip id='post-priority-picker-tooltip'>
                                    <FormattedMessage
                                        id={'post_priority.remove'}
                                        defaultMessage={'Remove {priority}'}
                                        values={{priority: this.props.draft.metadata!.priority!.priority}}
                                    />
                                </Tooltip>
                            )}
                        >
                            <button
                                type='button'
                                className='close'
                                onClick={this.handleRemovePriority}
                            >
                                <span aria-hidden='true'>{'×'}</span>
                                <span className='sr-only'>
                                    <FormattedMessage
                                        id={'post_priority.remove'}
                                        defaultMessage={'Remove {priority}'}
                                        values={{priority: this.props.draft.metadata!.priority!.priority}}
                                    />
                                </span>
                            </button>
                        </OverlayTrigger>
                    )}
                </div>
            ) : undefined
        );

        return (
            <form
                id='create_post'
                ref={this.topDiv}
                className={centerClass}
                onSubmit={this.handleSubmit}
            >
                {
                    this.props.canPost &&
                    (this.props.draft.fileInfos.length > 0 || this.props.draft.uploadsInProgress.length > 0) &&
                    <FileLimitStickyBanner/>
                }
                <AdvancedTextEditor
                    location={Locations.CENTER}
                    currentUserId={this.props.currentUserId}
                    postError={this.state.postError}
                    message={this.state.message}
                    showEmojiPicker={this.state.showEmojiPicker}
                    uploadsProgressPercent={this.state.uploadsProgressPercent}
                    currentChannel={this.state.currentChannel}
                    postId={''}
                    channelId={this.props.currentChannel.id}
                    errorClass={this.state.errorClass}
                    serverError={this.state.serverError}
                    isFormattingBarHidden={this.state.isFormattingBarHidden}
                    draft={this.props.draft}
                    showSendTutorialTip={this.props.showSendTutorialTip}
                    handleSubmit={this.handleSubmit}
                    removePreview={this.removePreview}
                    setShowPreview={this.setShowPreview}
                    shouldShowPreview={this.props.shouldShowPreview}
                    maxPostSize={this.props.maxPostSize}
                    canPost={this.props.canPost}
                    applyMarkdown={this.applyMarkdown}
                    useChannelMentions={this.props.useChannelMentions}
                    badConnection={this.props.badConnection}
                    canUploadFiles={this.props.canUploadFiles}
                    enableEmojiPicker={this.props.enableEmojiPicker}
                    enableGifPicker={this.props.enableGifPicker}
                    handleBlur={this.handleBlur}
                    handlePostError={this.handlePostError}
                    emitTypingEvent={this.emitTypingEvent}
                    handleMouseUpKeyUp={this.handleMouseUpKeyUp}
                    handleSelect={this.handleSelect}
                    handleKeyDown={this.handleKeyDown}
                    postMsgKeyPress={this.postMsgKeyPress}
                    handleChange={this.handleChange}
                    toggleEmojiPicker={this.toggleEmojiPicker}
                    handleGifClick={this.handleGifClick}
                    handleEmojiClick={this.handleEmojiClick}
                    hideEmojiPicker={this.hideEmojiPicker}
                    toggleAdvanceTextEditor={this.toggleAdvanceTextEditor}
                    handleUploadProgress={this.handleUploadProgress}
                    handleUploadError={this.handleUploadError}
                    handleFileUploadComplete={this.handleFileUploadComplete}
                    handleUploadStart={this.handleUploadStart}
                    handleFileUploadChange={this.handleFileUploadChange}
                    getFileUploadTarget={this.getFileUploadTarget}
                    fileUploadRef={this.fileUploadRef}
                    prefillMessage={this.prefillMessage}
                    textboxRef={this.textboxRef}
                    labels={priorityLabels}
                    additionalControls={[
                        this.props.isPostPriorityEnabled && (
                            <React.Fragment key='PostPriorityPicker'>
                                <PostPriorityPickerOverlay
                                    settings={this.props.draft?.metadata?.priority}
                                    show={this.state.showPostPriorityPicker}
                                    target={this.getPostPriorityPickerRef}
                                    onApply={this.handlePostPriorityApply}
                                    onHide={this.handlePostPriorityHide}
                                    defaultHorizontalPosition='left'
                                />
                                <OverlayTrigger
                                    placement='top'
                                    delayShow={Constants.OVERLAY_TIME_DELAY}
                                    trigger={Constants.OVERLAY_DEFAULT_TRIGGER}
                                    overlay={(
                                        <Tooltip id='post-priority-picker-tooltip'>
                                            <KeyboardShortcutSequence
                                                shortcut={KEYBOARD_SHORTCUTS.msgPostPriority}
                                                hoistDescription={true}
                                                isInsideTooltip={true}
                                            />
                                        </Tooltip>
                                    )}
                                >
                                    <IconContainer
                                        ref={this.postPriorityPickerRef}
                                        className={classNames({control: true, active: this.state.showPostPriorityPicker})}
                                        disabled={this.props.shouldShowPreview}
                                        type='button'
                                        onClick={this.togglePostPriorityPicker}
                                    >
                                        <AlertCircleOutlineIcon
                                            size={18}
                                            color='currentColor'
                                        />
                                    </IconContainer>
                                </OverlayTrigger>
                            </React.Fragment>
                        ),
                    ].filter(Boolean)}
                />
            </form>
        );
    }
}

export default AdvancedCreatePost;
