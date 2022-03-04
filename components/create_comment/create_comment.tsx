// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React from 'react';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';

import {ModalData} from 'types/actions.js';

import {sortFileInfos} from 'mattermost-redux/utils/file_utils';

import Constants, {ModalIdentifiers} from 'utils/constants';
import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils.jsx';
import {
    specialMentionsInText,
    isErrorInvalidSlashCommand,
    groupsMentionedInText,
} from 'utils/post_utils';
import {getTable, formatMarkdownTableMessage, isGitHubCodeBlock, formatGithubCodePaste} from 'utils/paste';

import NotifyConfirmModal from 'components/notify_confirm_modal';
import FilePreview from 'components/file_preview';
import {FileUpload as FileUploadClass} from 'components/file_upload/file_upload';
import MsgTyping from 'components/msg_typing';
import PostDeletedModal from 'components/post_deleted_modal';
import TextboxLinks from 'components/textbox/textbox_links';
import MessageSubmitError from 'components/message_submit_error';
import {PostDraft} from 'types/store/rhs';
import {Group} from 'mattermost-redux/types/groups';
import {ChannelMemberCountsByGroup} from 'mattermost-redux/types/channels';
import {FilePreviewInfo} from 'components/file_preview/file_preview';
import {ActionResult} from 'mattermost-redux/types/actions';
import {ServerError} from 'mattermost-redux/types/errors';
import {FileInfo} from 'mattermost-redux/types/files';

import InputTextbox, {InputTextboxRef} from 'components/create_post/input_textbox';
import Controls from 'components/create_post/controls';

const CreateCommentDraftTimeoutMilliseconds = 500;

const emptyFunction = () => {/* Do nothing */};

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
      * The current draft of the comment
      */
    draft: PostDraft;

    /**
      * Whether the submit button is enabled
      */
    enableAddButton?: boolean;

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
      * To check if the timezones are enable on the server.
      */
    isTimezoneEnabled: boolean;

    /**
      * The last time, if any, when the selected post changed. Will be 0 if no post selected.
      */
    selectedPostFocussedAt: number;

    canPost: boolean;

    /**
      * To determine if the current user can send special channel mentions
      */
    useChannelMentions: boolean;

    /**
      * To determine if the current user can send LDAP group mentions
      */
    useLDAPGroupMentions: boolean;

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
    openModal: <P>(modalData: ModalData<P>) => void;
    useCustomGroupMentions: boolean;
    markdownPreviewFeatureIsEnabled: boolean;
}

type State = {
    uploadsProgressPercent: {[clientID: string]: FilePreviewInfo};
    renderScrollbar: boolean;
    scrollbarWidth: number;
    draft?: PostDraft;
    rootId?: string;
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

    private textboxRef: React.RefObject<InputTextboxRef>;
    private fileUploadRef: React.RefObject<FileUploadClass>;

    static defaultProps = {
        focusOnMount: true,
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        let updatedState: Partial<State> = {
            createPostErrorId: props.createPostErrorId,
            rootId: props.rootId,
            draft: state.draft || {...props.draft, caretPosition: props.draft.message.length, uploadsInProgress: []},
        };

        const rootChanged = props.rootId !== state.rootId;
        if (rootChanged) {
            updatedState = {...updatedState, draft: {...props.draft, uploadsInProgress: rootChanged ? [] : props.draft.uploadsInProgress}};
        }

        return updatedState;
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            uploadsProgressPercent: {},
            renderScrollbar: false,
            scrollbarWidth: 0,
            errorClass: null,
            serverError: null,
        };

        this.textboxRef = React.createRef();
        this.fileUploadRef = React.createRef();
    }

    componentDidMount() {
        const {useLDAPGroupMentions, getChannelMemberCountsByGroup, channelId, clearCommentDraftUploads, setShowPreview, draft} = this.props;
        clearCommentDraftUploads();
        setShowPreview(false);

        if (this.props.focusOnMount) {
            this.focusTextbox();
        }

        document.addEventListener('paste', this.pasteHandler);
        window.addEventListener('beforeunload', this.saveDraft);
        if (useLDAPGroupMentions) {
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
        window.removeEventListener('beforeunload', this.saveDraft);
        this.saveDraft();
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (prevState.draft!.uploadsInProgress.length < this.state.draft!.uploadsInProgress.length && this.props.scrollToBottom) {
            this.props.scrollToBottom();
        }

        // Focus on textbox when returned from preview mode
        if (prevProps.shouldShowPreview && !this.props.shouldShowPreview) {
            this.focusTextbox();
        }

        if (prevProps.rootId !== this.props.rootId || prevProps.selectedPostFocussedAt !== this.props.selectedPostFocussedAt) {
            if (this.props.useLDAPGroupMentions) {
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

    handleNotifyAllConfirmation = (message: string) => {
        this.doSubmit(message);
    }

    showNotifyAllModal = (mentions: string[], channelTimezoneCount: number, memberNotifyCount: number, message: string) => {
        this.props.openModal({
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

    handlePostError = (postError: React.ReactNode) => {
        this.setState({postError});
    }

    handleSubmitEvent = (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        this.handleSubmit(this.state.draft?.message || '');
    }

    handleSubmit = async (message: string) => {
        const {
            channelMembersCount,
            enableConfirmNotificationsToChannel,
            useChannelMentions,
            isTimezoneEnabled,
            groupsWithAllowReference,
            channelMemberCountsByGroup,
            useLDAPGroupMentions,
            useCustomGroupMentions,
        } = this.props;
        const draft = this.state.draft!;
        const notificationsToChannel = enableConfirmNotificationsToChannel && useChannelMentions;
        let memberNotifyCount = 0;
        let channelTimezoneCount = 0;
        let mentions: string[] = [];

        const specialMentions = specialMentionsInText(message);
        const hasSpecialMentions = Object.values(specialMentions).includes(true);

        if (enableConfirmNotificationsToChannel && !hasSpecialMentions && (useLDAPGroupMentions || useCustomGroupMentions)) {
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

        if (!useLDAPGroupMentions && !useCustomGroupMentions && mentions.length > 0) {
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
            this.showNotifyAllModal(mentions, channelTimezoneCount, memberNotifyCount, message);
            return;
        }

        await this.doSubmit(message);
    }

    doSubmit = async (message: string) => {
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
        if (isErrorInvalidSlashCommand(serverError) && message === serverError?.submittedMessage) {
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
            err.submittedMessage = message;
            this.setState({serverError: err});
            return;
        }

        if (this.saveDraftFrame) {
            clearTimeout(this.saveDraftFrame);
        }
        this.setState({draft: {...this.props.draft, uploadsInProgress: []}});
        this.draftsForPost[this.props.rootId] = null;
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

    handleFileUploadComplete = (fileInfos: FileInfo[], clientIds: string[], channelId: string, rootId?: string) => {
        if (!rootId) {
            return;
        }
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

    onUpdatedCaretPosition = (p: number) => {
        this.setState({
            caretPosition: p,
        });
    }

    setMessageAndCaretPosition = (newMessage: string, newCaretPosition: number) => {
        const modifiedDraft = {
            ...this.state.draft!,
            message: newMessage,
        };

        this.props.onUpdateCommentDraft(modifiedDraft);
        this.draftsForPost[this.props.rootId] = modifiedDraft;

        this.setState({
            draft: modifiedDraft,
        });
        this.setCaretPosition(newCaretPosition);
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

        let scrollbarClass = '';
        if (renderScrollbar) {
            scrollbarClass = ' scroll';
        }

        const message = this.state.draft?.message || '';

        return (
            <form onSubmit={this.handleSubmitEvent}>
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
                            <InputTextbox
                                channelId={this.props.channelId}
                                onBlur={this.handleBlur}
                                onHeightChanged={this.handleHeightChange}
                                onPostError={this.handlePostError}
                                rootId={this.props.rootId}
                                submit={this.handleSubmit}
                                ref={this.textboxRef}
                                caretPosition={this.state.caretPosition || 0}
                                handleChange={this.handleChange}
                                updateCaretPosition={this.onUpdatedCaretPosition}
                                value={message}
                            />
                            <Controls
                                caretPosition={this.state.caretPosition || 0}
                                channelId={this.props.channelId}
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
                                isThreadView={this.props.isThreadView}
                                rootId={this.props.rootId}
                            />
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
                                    isMarkdownPreviewEnabled={this.props.canPost && this.props.markdownPreviewFeatureIsEnabled}
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
                                onClick={this.handleSubmitEvent}
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
