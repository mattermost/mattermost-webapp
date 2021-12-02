// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';

import {ModalData} from 'types/actions.js';

import {sortFileInfos} from 'mattermost-redux/utils/file_utils';

import * as GlobalActions from 'actions/global_actions';

import Constants, {Locations, ModalIdentifiers} from 'utils/constants';
import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils.jsx';
import {
    specialMentionsInText,
    postMessageOnKeyPress,
    shouldFocusMainTextbox,
    isErrorInvalidSlashCommand,
    splitMessageBasedOnCaretPosition,
    groupsMentionedInText,
} from 'utils/post_utils';
import {getTable, formatMarkdownTableMessage, isGitHubCodeBlock, formatGithubCodePaste} from 'utils/paste';

import NotifyConfirmModal from 'components/notify_confirm_modal';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import FilePreview from 'components/file_preview';
import FileUpload from 'components/file_upload';
import {FileUpload as FileUploadClass} from 'components/file_upload/file_upload';
import MsgTyping from 'components/msg_typing';
import PostDeletedModal from 'components/post_deleted_modal';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import Textbox from 'components/textbox';
import TextboxClass from 'components/textbox/textbox';
import TextboxLinks from 'components/textbox/textbox_links';
import MessageSubmitError from 'components/message_submit_error';
import {PostDraft} from 'types/store/rhs';
import {Group} from 'mattermost-redux/types/groups';
import {ChannelMemberCountsByGroup} from 'mattermost-redux/types/channels';
import {FilePreviewInfo} from 'components/file_preview/file_preview';
import {Emoji} from 'mattermost-redux/types/emojis';
import {ActionResult} from 'mattermost-redux/types/actions';
import {ServerError} from 'mattermost-redux/types/errors';
import {FileInfo} from 'mattermost-redux/types/files';

import RhsSuggestionList from 'components/suggestion/rhs_suggestion_list';

const KeyCodes = Constants.KeyCodes;

const CreateCommentDraftTimeoutMilliseconds = 500;

type Props = {

    /**
         * The channel for which this comment is a part of
         */
    channelId: string;

    /**
      * The number of channel members
      */
    channelMembersCount: number;

    /**
      * The id of the parent post
      */
    rootId: string;

    /**
      * True if the root message was deleted
      */
    rootDeleted: boolean;

    /**
      * The current history message selected
      */
    messageInHistory?: string;

    /**
      * The current draft of the comment
      */
    draft: PostDraft;

    /**
      * Whether the submit button is enabled
      */
    enableAddButton?: boolean;

    /**
      * Force message submission on CTRL/CMD + ENTER
      */
    codeBlockOnCtrlEnter?: boolean;

    /**
      * Set to force form submission on CTRL/CMD + ENTER instead of ENTER
      */
    ctrlSend?: boolean;

    /**
      * The id of the latest post in this channel
      */
    latestPostId?: string;
    locale: string;

    /**
      * Create post error id
      */
    createPostErrorId?: string;

    /**
      * Called to clear file uploads in progress
      */
    clearCommentDraftUploads: () => void;

    intl: IntlShape;

    /**
      * Called when comment draft needs to be updated
      */
    onUpdateCommentDraft: (draft?: PostDraft) => void;

    /**
      * Called when comment draft needs to be updated for an specific root ID
      */
    updateCommentDraftWithRootId: (rootID: string, draft: PostDraft) => void;

    /**
      * Called when submitting the comment
      */
    onSubmit: (draft: PostDraft, options: {ignoreSlash: boolean}) => void;

    /**
      * Called when resetting comment message history index
      */
    onResetHistoryIndex: () => void;

    /**
      * Called when navigating back through comment message history
      */
    onMoveHistoryIndexBack: () => void;

    /**
      * Called when navigating forward through comment message history
      */
    onMoveHistoryIndexForward: () => void;

    /**
      * Called to initiate editing the user's latest post
      */
    onEditLatestPost: () => ActionResult;

    /**
      * Function to get the users timezones in the channel
      */
    getChannelTimezones: (channelId: string) => Promise<ActionResult>;

    /**
      * Reset state of createPost request
      */
    resetCreatePostRequest: () => void;

    /**
      * Set if @channel should warn in this channel.
      */
    enableConfirmNotificationsToChannel: boolean;

    /**
      * Set if the emoji picker is enabled.
      */
    enableEmojiPicker: boolean;

    /**
      * Set if the gif picker is enabled.
      */
    enableGifPicker: boolean;

    /**
      * Set if the connection may be bad to warn user
      */
    badConnection: boolean;

    /**
      * The maximum length of a post
      */
    maxPostSize: number;
    rhsExpanded: boolean;

    /**
      * To check if the timezones are enable on the server.
      */
    isTimezoneEnabled: boolean;

    /**
      * The last time, if any, when the selected post changed. Will be 0 if no post selected.
      */
    selectedPostFocussedAt: number;

    /**
      * Function to set or unset emoji picker for last message
      */
    emitShortcutReactToLastPostFrom: (location: string) => void;

    canPost: boolean;

    /**
      * To determine if the current user can send special channel mentions
      */
    useChannelMentions: boolean;

    /**
      * To determine if the current user can send group mentions
      */
    useGroupMentions: boolean;

    /**
      * Set show preview for textbox
      */
    setShowPreview: (showPreview: boolean) => void;

    /**
      * Should preview be showed
      */
    shouldShowPreview: boolean;

    /***
      * Called when parent component should be scrolled to bottom
      */
    scrollToBottom?: () => void;

    /*
         Group member mention
     */
    getChannelMemberCountsByGroup: (channelID: string) => void;
    groupsWithAllowReference: Map<string, Group> | null;
    channelMemberCountsByGroup: ChannelMemberCountsByGroup;
    onHeightChange?: (height: number, maxHeight: number) => void;
    focusOnMount?: boolean;
    isThreadView?: boolean;

    /**
      * Function to open a modal
      */
    openModal: <P>(modalData: ModalData<P>) => void;
}

type State = {
    showEmojiPicker: boolean;
    uploadsProgressPercent: {[clientID: string]: FilePreviewInfo};
    renderScrollbar: boolean;
    scrollbarWidth: number;
    draft?: PostDraft;
    rootId?: string;
    messageInHistory?: string;
    createPostErrorId?: string;
    caretPosition?: number;
    postError?: React.ReactNode;
    errorClass: string | null;
    serverError: (ServerError & {submittedMessage?: string}) | null;
}

class CreateComment extends React.PureComponent<Props, State> {
    private lastBlurAt = 0;
    private draftsForPost: {[postID: string]: PostDraft | null} = {};
    private doInitialScrollToBottom = false;

    private saveDraftFrame?: number | null;

    private textboxRef: React.RefObject<TextboxClass>;
    private fileUploadRef: React.RefObject<FileUploadClass>;
    private createCommentControlsRef: React.RefObject<HTMLSpanElement>;

    static defaultProps = {
        focusOnMount: true,
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        let updatedState: Partial<State> = {
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

        return updatedState;
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            showEmojiPicker: false,
            uploadsProgressPercent: {},
            renderScrollbar: false,
            scrollbarWidth: 0,
            errorClass: null,
            serverError: null,
        };

        this.textboxRef = React.createRef();
        this.fileUploadRef = React.createRef();
        this.createCommentControlsRef = React.createRef();
    }

    componentDidMount() {
        const {useGroupMentions, getChannelMemberCountsByGroup, channelId, clearCommentDraftUploads, onResetHistoryIndex, setShowPreview, draft} = this.props;
        clearCommentDraftUploads();
        onResetHistoryIndex();
        setShowPreview(false);

        if (this.props.focusOnMount) {
            this.focusTextbox();
        }

        document.addEventListener('paste', this.pasteHandler);
        document.addEventListener('keydown', this.focusTextboxIfNecessary);
        window.addEventListener('beforeunload', this.saveDraft);
        if (useGroupMentions) {
            getChannelMemberCountsByGroup(channelId);
        }

        // When draft.message is not empty, set doInitialScrollToBottom to true so that
        // on next component update, the actual this.scrollToBottom() will be called.
        // This is made so that the this.scrollToBottom() will be called only once.
        if (draft.message !== '') {
            this.doInitialScrollToBottom = true;
        }
    }

    componentWillUnmount() {
        this.props.resetCreatePostRequest?.();
        document.removeEventListener('paste', this.pasteHandler);
        document.removeEventListener('keydown', this.focusTextboxIfNecessary);
        window.removeEventListener('beforeunload', this.saveDraft);
        this.saveDraft();
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (prevState.draft!.uploadsInProgress.length < this.state.draft!.uploadsInProgress.length && this.props.scrollToBottom) {
            this.props.scrollToBottom();
        }

        // Focus on textbox when emoji picker is closed
        if (prevState.showEmojiPicker && !this.state.showEmojiPicker) {
            this.focusTextbox();
        }

        // Focus on textbox when returned from preview mode
        if (prevProps.shouldShowPreview && !this.props.shouldShowPreview) {
            this.focusTextbox();
        }

        if (prevProps.rootId !== this.props.rootId || prevProps.selectedPostFocussedAt !== this.props.selectedPostFocussedAt) {
            if (this.props.useGroupMentions) {
                this.props.getChannelMemberCountsByGroup(this.props.channelId);
            }
            this.focusTextbox();
        }

        if (this.doInitialScrollToBottom) {
            if (this.props.scrollToBottom) {
                this.props.scrollToBottom();
            }
            this.doInitialScrollToBottom = false;
        }

        if (this.props.createPostErrorId === 'api.post.create_post.root_id.app_error' && this.props.createPostErrorId !== prevProps.createPostErrorId) {
            this.showPostDeletedModal();
        }
    }

    saveDraft = () => {
        if (this.saveDraftFrame) {
            clearTimeout(this.saveDraftFrame);
            this.props.onUpdateCommentDraft(this.state.draft);
            this.saveDraftFrame = null;
        }
    }

    setShowPreview = (newPreviewValue: boolean) => {
        this.props.setShowPreview(newPreviewValue);
    }

    focusTextboxIfNecessary = (e: KeyboardEvent) => {
        // Should only focus if RHS is expanded or if thread view
        if (!this.props.isThreadView && !this.props.rhsExpanded) {
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

    setCaretPosition = (newCaretPosition: number) => {
        const textbox = this.textboxRef.current && this.textboxRef.current.getInputBox();

        this.setState({
            caretPosition: newCaretPosition,
        }, () => {
            Utils.setCaretPosition(textbox, newCaretPosition);
        });
    }

    pasteHandler = (e: ClipboardEvent) => {
        if (!e.clipboardData || !e.clipboardData.items || (e.target as any).id !== 'reply_textbox') {
            return;
        }

        const {clipboardData} = e;
        let table = getTable(clipboardData);
        if (!table) {
            return;
        }
        table = table as HTMLTableElement;

        e.preventDefault();

        const draft = this.state.draft!;
        let message = draft.message;

        const caretPosition = this.state.caretPosition || 0;
        if (isGitHubCodeBlock(table.className)) {
            const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste(caretPosition, message, clipboardData);
            const newCaretPosition = caretPosition + formattedCodeBlock.length;
            message = formattedMessage;
            this.setCaretPosition(newCaretPosition);
        } else {
            const originalSize = draft.message.length;
            message = formatMarkdownTableMessage(table, draft.message.trim(), this.state.caretPosition);
            const newCaretPosition = message.length - (originalSize - caretPosition);
            this.setCaretPosition(newCaretPosition);
        }

        const updatedDraft = {...draft, message};

        this.props.onUpdateCommentDraft(updatedDraft);
        this.setState({draft: updatedDraft});
    }

    handleNotifyAllConfirmation = () => {
        this.doSubmit();
    }

    showNotifyAllModal = (mentions: string[], channelTimezoneCount: number, memberNotifyCount: number) => {
        this.props.openModal({
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

    toggleEmojiPicker = () => {
        this.setState({showEmojiPicker: !this.state.showEmojiPicker});
    }

    hideEmojiPicker = () => {
        this.setState({showEmojiPicker: false});
    }

    handleEmojiClick = (emoji: Emoji) => {
        const emojiAlias = ('short_name' in emoji && emoji.short_name) || emoji.name;

        if (!emojiAlias) {
            //Oops.. There went something wrong
            return;
        }

        const draft = this.state.draft!;

        let newMessage = '';
        if (draft.message === '') {
            newMessage = `:${emojiAlias}: `;
            this.setCaretPosition(newMessage.length);
        } else {
            const {message} = draft;
            const {firstPiece, lastPiece} = splitMessageBasedOnCaretPosition(this.state.caretPosition || 0, message);

            // check whether the first piece of the message is empty when cursor is placed at beginning of message and avoid adding an empty string at the beginning of the message
            newMessage = firstPiece === '' ? `:${emojiAlias}: ${lastPiece} ` : `${firstPiece} :${emojiAlias}: ${lastPiece} `;

            const newCaretPosition = firstPiece === '' ? `:${emojiAlias}: `.length : `${firstPiece} :${emojiAlias}: `.length;
            this.setCaretPosition(newCaretPosition);
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

    handleGifClick = (gif: string) => {
        const draft = this.state.draft!;

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

    handlePostError = (postError: React.ReactNode) => {
        this.setState({postError});
    }

    handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        this.setShowPreview(false);

        const {
            channelMembersCount,
            enableConfirmNotificationsToChannel,
            useChannelMentions,
            isTimezoneEnabled,
            groupsWithAllowReference,
            channelMemberCountsByGroup,
            useGroupMentions,
        } = this.props;
        const draft = this.state.draft!;
        const notificationsToChannel = enableConfirmNotificationsToChannel && useChannelMentions;
        let memberNotifyCount = 0;
        let channelTimezoneCount = 0;
        let mentions: string[] = [];

        const specialMentions = specialMentionsInText(draft.message);
        const hasSpecialMentions = Object.values(specialMentions).includes(true);

        if (enableConfirmNotificationsToChannel && !hasSpecialMentions && useGroupMentions) {
            // Groups mentioned in users text
            const mentionGroups = groupsMentionedInText(draft.message, groupsWithAllowReference);
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

        if (!useGroupMentions && mentions.length > 0) {
            const updatedDraft = {
                ...draft,
                props: {
                    ...draft.props,
                    disable_group_highlight: true,
                },
            };

            this.props.onUpdateCommentDraft(updatedDraft);
            this.setState({draft: updatedDraft});
        }

        if (notificationsToChannel &&
            channelMembersCount > Constants.NOTIFY_ALL_MEMBERS &&
            hasSpecialMentions) {
            memberNotifyCount = channelMembersCount - 1;
            for (const k in specialMentions) {
                if (specialMentions[k] === true) {
                    mentions.push('@' + k);
                }
            }

            if (isTimezoneEnabled) {
                const {data} = await this.props.getChannelTimezones(this.props.channelId);
                channelTimezoneCount = data ? data.length : 0;
            }
        }

        if (!useChannelMentions && hasSpecialMentions) {
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

        if (memberNotifyCount > 0) {
            this.showNotifyAllModal(mentions, channelTimezoneCount, memberNotifyCount);
            return;
        }

        await this.doSubmit(e);
    }

    doSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        const draft = this.state.draft!;
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
        if (isErrorInvalidSlashCommand(serverError) && draft.message === serverError?.submittedMessage) {
            ignoreSlash = true;
        }

        const options = {ignoreSlash};

        try {
            await this.props.onSubmit(draft, options);

            this.setState({
                postError: null,
                serverError: null,
            });
        } catch (err: any) {
            if (isErrorInvalidSlashCommand(err)) {
                this.props.onUpdateCommentDraft(draft);
            }
            err.submittedMessage = draft.message;
            this.setState({serverError: err});
            return;
        }

        if (this.saveDraftFrame) {
            clearTimeout(this.saveDraftFrame);
        }
        this.setState({draft: {...this.props.draft, uploadsInProgress: []}});
        this.draftsForPost[this.props.rootId] = null;
    }

    commentMsgKeyPress = (e: React.KeyboardEvent) => {
        const {
            ctrlSend,
            codeBlockOnCtrlEnter,
        } = this.props;

        const {
            allowSending,
            withClosedCodeBlock,
            message,
        } = postMessageOnKeyPress(
            e,
            this.state.draft!.message,
            Boolean(ctrlSend),
            Boolean(codeBlockOnCtrlEnter),
            0,
            0,
            this.state.caretPosition,
        ) as {
            allowSending: boolean;
            withClosedCodeBlock?: boolean;
            message?: string;
        };

        if (allowSending) {
            if (e.persist) {
                e.persist();
            }
            if (this.textboxRef.current) {
                this.textboxRef.current.blur();
            }

            if (withClosedCodeBlock && message) {
                const draft = this.state.draft!;
                const updatedDraft = {...draft, message};
                this.props.onUpdateCommentDraft(updatedDraft);
                this.setState({draft: updatedDraft}, () => this.handleSubmit(e));
                this.draftsForPost[this.props.rootId] = updatedDraft;
            } else {
                this.handleSubmit(e);
            }

            this.setShowPreview(false);
            setTimeout(() => {
                this.focusTextbox();
            });
        }

        this.emitTypingEvent();
    }

    reactToLastMessage = (e: React.KeyboardEvent) => {
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

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const message = e.target.value;

        let serverError = this.state.serverError;
        if (isErrorInvalidSlashCommand(serverError)) {
            serverError = null;
        }

        const draft = this.state.draft!;
        const updatedDraft = {...draft, message};

        if (this.saveDraftFrame) {
            clearTimeout(this.saveDraftFrame);
        }
        this.saveDraftFrame = window.setTimeout(() => {
            this.props.onUpdateCommentDraft(updatedDraft);
        }, CreateCommentDraftTimeoutMilliseconds);

        this.setState({draft: updatedDraft, serverError}, () => {
            if (this.props.scrollToBottom) {
                this.props.scrollToBottom();
            }
        });
        this.draftsForPost[this.props.rootId] = updatedDraft;
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
        const lastMessageReactionKeyCombo = ctrlOrMetaKeyPressed && e.shiftKey && Utils.isKeyPressed(e, KeyCodes.BACK_SLASH);

        // listen for line break key combo and insert new line character
        if (Utils.isUnhandledLineBreakKeyCombo(e)) {
            this.setState({
                draft: {
                    ...this.state.draft!,
                    message: Utils.insertLineBreakFromKeyEvent(e),
                },
            });
            return;
        }

        if (
            (this.props.ctrlSend || this.props.codeBlockOnCtrlEnter) &&
            Utils.isKeyPressed(e, Constants.KeyCodes.ENTER) &&
            (e.ctrlKey || e.metaKey)
        ) {
            this.setShowPreview(false);
            this.commentMsgKeyPress(e);
            return;
        }

        const draft = this.state.draft!;
        const {message} = draft;

        if (Utils.isKeyPressed(e, Constants.KeyCodes.ESCAPE)) {
            if (this.textboxRef.current) {
                this.textboxRef.current.blur();
            }
        }

        if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && Utils.isKeyPressed(e, Constants.KeyCodes.UP) && message === '') {
            e.preventDefault();
            if (this.textboxRef.current) {
                this.textboxRef.current.blur();
            }

            const {data: canEditNow} = this.props.onEditLatestPost();
            if (!canEditNow) {
                this.focusTextbox(true);
            }
        }

        const ctrlKeyCombo = Utils.cmdOrCtrlPressed(e) && !e.altKey && !e.shiftKey;
        const ctrlAltCombo = Utils.cmdOrCtrlPressed(e, true) && e.altKey;

        if (ctrlKeyCombo) {
            if (Utils.isKeyPressed(e, Constants.KeyCodes.UP)) {
                e.preventDefault();
                this.props.onMoveHistoryIndexBack();
            } else if (Utils.isKeyPressed(e, Constants.KeyCodes.DOWN)) {
                e.preventDefault();
                this.props.onMoveHistoryIndexForward();
            } else if (Utils.isKeyPressed(e, Constants.KeyCodes.B) ||
                Utils.isKeyPressed(e, Constants.KeyCodes.I)) {
                this.applyHotkeyMarkdown(e);
            }
        }

        if (ctrlAltCombo && Utils.isKeyPressed(e, Constants.KeyCodes.K)) {
            this.applyHotkeyMarkdown(e);
        }

        if (lastMessageReactionKeyCombo) {
            this.reactToLastMessage(e);
        }
    }

    applyHotkeyMarkdown = (e: React.KeyboardEvent) => {
        const res = Utils.applyHotkeyMarkdown(e);

        const draft = this.state.draft!;
        const modifiedDraft = {
            ...draft,
            message: res.message,
        };

        this.props.onUpdateCommentDraft(modifiedDraft);
        this.draftsForPost[this.props.rootId] = modifiedDraft;

        this.setState({
            draft: modifiedDraft,
        }, () => {
            const textbox = this.textboxRef.current?.getInputBox();
            Utils.setSelectionRange(textbox, res.selectionStart, res.selectionEnd);
        });
    }

    handleFileUploadChange = () => {
        this.focusTextbox();
    }

    handleUploadStart = (clientIds: string[]) => {
        const draft = this.state.draft!;
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

    handleUploadProgress = (filePreviewInfo: FilePreviewInfo) => {
        const uploadsProgressPercent = {...this.state.uploadsProgressPercent, [filePreviewInfo.clientId]: filePreviewInfo};
        this.setState({uploadsProgressPercent});
    }

    handleFileUploadComplete = (fileInfos: FileInfo[], clientIds: string, channelId: string, rootId: string) => {
        const draft = this.draftsForPost[rootId]!;
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

    handleUploadError = (err: string | ServerError | null, clientId: string | number = -1, currentChannelId?: string, rootId = '') => {
        if (clientId !== -1) {
            const draft = {...this.draftsForPost[rootId]!};
            const uploadsInProgress = [...draft.uploadsInProgress];

            const index = uploadsInProgress.indexOf(clientId as string);
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
        if (typeof serverError === 'string') {
            serverError = new Error(serverError);
        }

        this.setState({serverError}, () => {
            if (serverError && this.props.scrollToBottom) {
                this.props.scrollToBottom();
            }
        });
    }

    removePreview = (id: string) => {
        const draft = this.state.draft!;
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

                if (this.fileUploadRef.current) {
                    this.fileUploadRef.current.cancelUpload(id);
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
            fileInfos,
            uploadsInProgress,
        } = this.state.draft!;
        return fileInfos.length + uploadsInProgress.length;
    }

    getFileUploadTarget = () => {
        return this.textboxRef.current;
    }

    getCreateCommentControls = () => {
        return this.createCommentControlsRef.current;
    }

    focusTextbox = (keepFocus = false) => {
        if (this.textboxRef.current && (keepFocus || !UserAgent.isMobile())) {
            this.textboxRef.current.focus();
        }
    }

    shouldEnableAddButton = () => {
        const {draft} = this.state;
        if (draft) {
            const message = draft.message ? draft.message.trim() : '';
            const fileInfos = draft.fileInfos ? draft.fileInfos : [];
            if (message.trim().length !== 0 || fileInfos.length !== 0) {
                return true;
            }
        }

        return isErrorInvalidSlashCommand(this.state.serverError);
    }

    showPostDeletedModal = () => {
        this.props.openModal({
            modalId: ModalIdentifiers.POST_DELETED_MODAL,
            dialogType: PostDeletedModal,
        });
    }

    handleBlur = () => {
        this.lastBlurAt = Date.now();
    }

    handleHeightChange = (height: number, maxHeight: number) => {
        this.setState({renderScrollbar: height > maxHeight});
        window.requestAnimationFrame(() => {
            if (this.textboxRef.current) {
                this.setState({scrollbarWidth: Utils.scrollbarWidth(this.textboxRef.current.getInputBox())});
            }
        });

        if (this.props.onHeightChange) {
            this.props.onHeightChange(height, maxHeight);
        }
    }

    render() {
        const draft = this.state.draft!;
        const readOnlyChannel = !this.props.canPost;
        const {formatMessage} = this.props.intl;
        const enableAddButton = this.shouldEnableAddButton();
        const {renderScrollbar} = this.state;
        const ariaLabelReplyInput = Utils.localizeMessage('accessibility.sections.rhsFooter', 'reply input region');

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
                    rootId={this.props.rootId}
                    channelId={this.props.channelId}
                    postType={this.props.isThreadView ? 'thread' : 'comment'}
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
                        className={classNames('emoji-picker__container', 'post-action', {
                            'post-action--active': this.state.showEmojiPicker,
                        })}
                    >
                        <EmojiIcon className={'icon icon--emoji emoji-rhs '}/>
                    </button>
                </div>
            );
        }

        let createMessage;
        if (readOnlyChannel) {
            createMessage = Utils.localizeMessage('create_post.read_only', 'This channel is read-only. Only members with permission can post here.');
        } else {
            createMessage = Utils.localizeMessage('create_comment.addComment', 'Reply to this thread...');
        }

        let scrollbarClass = '';
        if (renderScrollbar) {
            scrollbarClass = ' scroll';
        }

        return (
            <form onSubmit={this.handleSubmit}>
                <div
                    role='form'
                    aria-label={ariaLabelReplyInput}
                    tabIndex={-1}
                    className={`post-create a11y__region${scrollbarClass}`}
                    style={this.state.renderScrollbar && this.state.scrollbarWidth ? {'--detected-scrollbar-width': `${this.state.scrollbarWidth}px`} as any : undefined}
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
                                onSelect={this.handleSelect}
                                onMouseUp={this.handleMouseUpKeyUp}
                                onKeyUp={this.handleMouseUpKeyUp}
                                onComposition={this.emitTypingEvent}
                                onHeightChange={this.handleHeightChange}
                                handlePostError={this.handlePostError}
                                value={readOnlyChannel ? '' : draft.message}
                                onBlur={this.handleBlur}
                                createMessage={createMessage}
                                emojiEnabled={this.props.enableEmojiPicker}
                                channelId={this.props.channelId}
                                rootId={this.props.rootId}
                                isRHS={true}
                                id='reply_textbox'
                                ref={this.textboxRef}
                                disabled={readOnlyChannel}
                                characterLimit={this.props.maxPostSize}
                                preview={this.props.shouldShowPreview}
                                suggestionList={RhsSuggestionList}
                                badConnection={this.props.badConnection}
                                listenForMentionKeyClick={true}
                                useChannelMentions={this.props.useChannelMentions}
                            />
                            <span
                                ref={this.createCommentControlsRef}
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
                                    showPreview={this.props.shouldShowPreview}
                                    updatePreview={this.setShowPreview}
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
                                value={formatMessage({id: 'create_comment.comment', defaultMessage: 'Reply'})}
                                onClick={this.handleSubmit}
                            />
                            {preview}
                            {serverError}
                        </div>
                    </div>
                </div>
            </form>
        );
    }
}

export default injectIntl(CreateComment);
