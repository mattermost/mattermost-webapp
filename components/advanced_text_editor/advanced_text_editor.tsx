// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useCallback, useState} from 'react';
import classNames from 'classnames';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import {t} from 'utils/i18n';
import * as Utils from 'utils/utils';
import {Emoji} from '@mattermost/types/emojis';
import {FileInfo} from '@mattermost/types/files';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import FilePreview from 'components/file_preview';
import FileUpload from 'components/file_upload';
import LocalizedIcon from 'components/localized_icon';
import MsgTyping from 'components/msg_typing';
import Textbox from 'components/textbox';
import TextboxClass from 'components/textbox/textbox';
import {ShowFormat} from 'components/advanced_text_editor/show_format/show_format';

import MessageSubmitError from 'components/message_submit_error';
import {Channel} from 'mattermost-redux/types/channels';
import {PostDraft} from 'types/store/rhs';
import {ServerError} from 'mattermost-redux/types/errors';
import {FilePreviewInfo} from 'components/file_preview/file_preview';
import {SendMessageTour} from 'components/onboarding_tour';
import {ToggleFormattingBar} from 'components/advanced_text_editor/toggle_formatting_bar/toggle_formatting_bar';
import {FormattingBar} from 'components/advanced_text_editor/formatting_bar';
import {ApplyMarkdownOptions} from 'utils/markdown/apply_markdown';
import {getIsMobileView} from 'selectors/views/browser';
import {FileUpload as FileUploadClass} from 'components/file_upload/file_upload';
import OverlayTrigger from 'components/overlay_trigger';

import './advanced_text_editor.scss';
import Constants from '../../utils/constants';
import KeyboardShortcutSequence, {KEYBOARD_SHORTCUTS} from '../keyboard_shortcuts/keyboard_shortcuts_sequence';
import Tooltip from '../tooltip';

type Props = {
    currentUserId: string;
    message: string;
    showEmojiPicker: boolean;
    uploadsProgressPercent: { [clientID: string]: FilePreviewInfo };
    currentChannel?: Channel;
    errorClass: string | null;
    serverError: (ServerError & { submittedMessage?: string }) | null;
    postError?: React.ReactNode;
    isFormattingBarHidden: boolean;
    draft: PostDraft;
    showSendTutorialTip?: boolean;
    handleSubmit: (e: React.FormEvent) => void;
    removePreview: (id: string) => void;
    setShowPreview: (newPreviewValue: boolean) => void;
    shouldShowPreview: boolean;
    maxPostSize: number;
    canPost: boolean;
    createPostControlsRef: React.RefObject<HTMLSpanElement>;
    applyMarkdown: (params: ApplyMarkdownOptions) => void;
    useChannelMentions: boolean;
    badConnection: boolean;
    currentChannelTeammateUsername?: string;
    canUploadFiles: boolean;
    enableEmojiPicker: boolean;
    enableGifPicker: boolean;
    handleBlur: () => void;
    handlePostError: (postError: React.ReactNode) => void;
    emitTypingEvent: () => void;
    handleMouseUpKeyUp: (e: React.MouseEvent | React.KeyboardEvent) => void;
    handleSelect: (e: React.SyntheticEvent) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    postMsgKeyPress: (e: React.KeyboardEvent) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    toggleEmojiPicker: () => void;
    handleGifClick: (gif: string) => void;
    handleEmojiClick: (emoji: Emoji) => void;
    handleEmojiClose: () => void;
    hideEmojiPicker: () => void;
    getCreatePostControls: () => void;
    toggleAdvanceTextEditor: () => void;
    handleUploadProgress: (filePreviewInfo: FilePreviewInfo) => void;
    handleUploadError: (err: string | ServerError, clientId: string, channelId: string) => void;
    handleFileUploadComplete: (fileInfos: FileInfo[], clientIds: string[], channelId: string, rootId?: string) => void;
    handleUploadStart: (clientIds: string[], channelId: string) => void;
    handleFileUploadChange: () => void;
    getFileUploadTarget: () => TextboxClass | null;
    fileUploadRef: React.RefObject<FileUploadClass>;
    prefillMessage?: (message: string, shouldFocus?: boolean) => void;
    channelId: string;
    postId: string;
    textboxRef: React.RefObject<TextboxClass>;
    isThreadView?: boolean;
}
const AdvanceTextEditor = ({
    message,
    showEmojiPicker,
    uploadsProgressPercent,
    currentChannel,
    channelId,
    postId,
    errorClass,
    serverError,
    postError,
    isFormattingBarHidden,
    draft,
    badConnection,
    handleSubmit,
    removePreview,
    showSendTutorialTip,
    setShowPreview,
    shouldShowPreview,
    maxPostSize,
    canPost,
    createPostControlsRef,
    applyMarkdown,
    useChannelMentions,
    currentChannelTeammateUsername,
    currentUserId,
    canUploadFiles,
    enableEmojiPicker,
    enableGifPicker,
    handleBlur,
    handlePostError,
    emitTypingEvent,
    handleMouseUpKeyUp,
    handleSelect,
    handleKeyDown,
    postMsgKeyPress,
    handleChange,
    toggleEmojiPicker,
    handleGifClick,
    handleEmojiClick,
    handleEmojiClose,
    hideEmojiPicker,
    getCreatePostControls,
    toggleAdvanceTextEditor,
    handleUploadProgress,
    handleUploadError,
    handleFileUploadComplete,
    handleUploadStart,
    handleFileUploadChange,
    getFileUploadTarget,
    fileUploadRef,
    prefillMessage,
    textboxRef,
    isThreadView,

}: Props) => {
    const readOnlyChannel = !canPost;
    const {formatMessage} = useIntl();
    const ariaLabelMessageInput = Utils.localizeMessage(
        'accessibility.sections.centerFooter',
        'message input complimentary region',
    );
    const isMobileView = useSelector(getIsMobileView);

    const [scrollbarWidth, setScrollbarWidth] = useState(0);
    const [renderScrollbar, setRenderScrollbar] = useState(false);

    const getSendButtonVisibilityState = () => {
        return !(isMobileView && (message.trim().length !== 0 || draft.fileInfos.length !== 0));
    };

    const handleHeightChange = (height: number, maxHeight: number) => {
        setRenderScrollbar(height > maxHeight);

        window.requestAnimationFrame(() => {
            if (textboxRef.current) {
                setScrollbarWidth(Utils.scrollbarWidth(textboxRef.current.getInputBox()));
            }
        });
    };

    const handleShowFormat = useCallback(() => {
        setShowPreview(!shouldShowPreview);
    }, [shouldShowPreview, setShowPreview]);

    let serverErrorJsx = null;
    if (serverError) {
        serverErrorJsx = (
            <MessageSubmitError
                error={serverError}
                submittedMessage={serverError.submittedMessage}
                handleSubmit={handleSubmit}
            />
        );
    }

    let attachmentPreview = null;
    if (!readOnlyChannel && (draft.fileInfos.length > 0 || draft.uploadsInProgress.length > 0)) {
        attachmentPreview = (
            <div className={classNames({'adv-txt-editor__attachment-preview': isFormattingBarHidden})}>
                <FilePreview
                    fileInfos={draft.fileInfos}
                    onRemove={removePreview}
                    uploadsInProgress={draft.uploadsInProgress}
                    uploadsProgressPercent={uploadsProgressPercent}
                />
            </div>
        );
    }

    const getFileCount = () => {
        return draft.fileInfos.length + draft.uploadsInProgress.length;
    };

    let fileUploadJSX;
    let showFormatJSX;
    let toggleFormattingBarJSX;
    if (!readOnlyChannel) {
        let postType = 'post';
        if (postId) {
            postType = isThreadView ? 'thread' : 'comment';
        }
        fileUploadJSX = (
            <FileUpload
                ref={fileUploadRef}
                fileCount={getFileCount()}
                getTarget={getFileUploadTarget}
                onFileUploadChange={handleFileUploadChange}
                onUploadStart={handleUploadStart}
                onFileUpload={handleFileUploadComplete}
                onUploadError={handleUploadError}
                onUploadProgress={handleUploadProgress}
                rootId={postId}
                channelId={channelId}
                postType={postType}
            />
        );
        showFormatJSX = (
            <ShowFormat
                onClick={handleShowFormat}
                active={shouldShowPreview}
            />
        );
        toggleFormattingBarJSX = (
            <ToggleFormattingBar
                onClick={toggleAdvanceTextEditor}
                active={!isFormattingBarHidden}
            />
        );
    }

    let emojiPicker = null;
    const emojiButtonAriaLabel = formatMessage({
        id: 'emoji_picker.emojiPicker',
        defaultMessage: 'Emoji Picker',
    }).toLowerCase();

    if (enableEmojiPicker && !readOnlyChannel) {
        emojiPicker = (
            <div>
                <EmojiPickerOverlay
                    show={showEmojiPicker}
                    target={getCreatePostControls}
                    onHide={hideEmojiPicker}
                    onEmojiClose={handleEmojiClose}
                    onEmojiClick={handleEmojiClick}
                    onGifClick={handleGifClick}
                    enableGifPicker={enableGifPicker}
                    topOffset={-7}
                />
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='left'
                    trigger={['hover', 'focus']}
                    overlay={<Tooltip id='upload-tooltip'>
                        <KeyboardShortcutSequence
                            shortcut={KEYBOARD_SHORTCUTS.msgShowEmojiPicker}
                            hoistDescription={true}
                            isInsideTooltip={true}
                        />
                    </Tooltip>}
                >
                    <button
                        type='button'
                        aria-label={emojiButtonAriaLabel}
                        onClick={toggleEmojiPicker}
                        className={classNames('emoji-picker__container', 'adv-txt-editor__action-button', {
                            'post-action--active': showEmojiPicker,
                        })}
                    >
                        <i className='icon icon-emoticon-happy-outline'/>
                    </button>
                </OverlayTrigger>
            </div>
        );
    }

    let createMessage;
    if (currentChannel && !readOnlyChannel) {
        createMessage = formatMessage(
            {
                id: 'create_post.write',
                defaultMessage: 'Write to {channelDisplayName}',
            },
            {channelDisplayName: currentChannel.display_name},
        );
    } else if (readOnlyChannel) {
        createMessage = Utils.localizeMessage(
            'create_post.read_only',
            'This channel is read-only. Only members with permission can post here.',
        );
    } else {
        createMessage = Utils.localizeMessage('create_comment.addComment', 'Reply to this thread...');
    }

    const messageValue = readOnlyChannel ? '' : message;

    return (
        <div
            className={classNames('adv-txt-editor', {
                'adv-txt-editor__attachment-disabled': !canUploadFiles,
                scroll: renderScrollbar,
            })}
            style={
                renderScrollbar && scrollbarWidth ? ({
                    '--detected-scrollbar-width': `${scrollbarWidth}px`,
                } as any) : undefined
            }
        >
            <div
                className={classNames('adv-txt-editor__body', {
                    'adv-txt-editor__body--collapsed': isFormattingBarHidden,
                })}
            >
                <div
                    role='application'
                    id='centerChannelFooter'
                    aria-label={ariaLabelMessageInput}
                    tabIndex={-1}
                    className='adv-txt-editor__cell a11y__region'
                >
                    <Textbox
                        onChange={handleChange}
                        onKeyPress={postMsgKeyPress}
                        onKeyDown={handleKeyDown}
                        onSelect={handleSelect}
                        onMouseUp={handleMouseUpKeyUp}
                        onKeyUp={handleMouseUpKeyUp}
                        onComposition={emitTypingEvent}
                        onHeightChange={handleHeightChange}
                        handlePostError={handlePostError}
                        value={messageValue}
                        onBlur={handleBlur}
                        emojiEnabled={enableEmojiPicker}
                        createMessage={createMessage}
                        channelId={channelId}
                        id='post_textbox'
                        ref={textboxRef!}
                        disabled={readOnlyChannel}
                        characterLimit={maxPostSize}
                        preview={shouldShowPreview}
                        badConnection={badConnection}
                        listenForMentionKeyClick={true}
                        useChannelMentions={useChannelMentions}
                    />
                    {attachmentPreview}
                    <FormattingBar
                        applyMarkdown={applyMarkdown}
                        value={messageValue}
                        textBox={textboxRef.current?.getInputBox()}
                        isOpen={!isFormattingBarHidden}
                    />
                    <span
                        className={classNames('adv-txt-editor__actions', 'adv-txt-editor__actions--top', {
                            formattingBarOpen: !isFormattingBarHidden,
                        })}
                    >
                        {showFormatJSX}
                    </span>
                    <span
                        ref={createPostControlsRef}
                        className={classNames('adv-txt-editor__actions', 'adv-txt-editor__actions--bottom')}
                    >
                        {toggleFormattingBarJSX}
                        {fileUploadJSX}
                        {emojiPicker}
                        <a
                            role='button'
                            tabIndex={0}
                            aria-label={formatMessage({
                                id: 'create_post.send_message',
                                defaultMessage: 'Send a message',
                            })}
                            className={classNames('adv-txt-editor__action-button', {
                                hidden: getSendButtonVisibilityState(),
                            })}
                            onClick={handleSubmit}
                        >
                            <LocalizedIcon
                                className='icon icon-send'
                                title={{
                                    id: t('create_post.icon'),
                                    defaultMessage: 'Create a post',
                                }}
                            />
                        </a>
                    </span>
                </div>
                {showSendTutorialTip && currentChannel && prefillMessage &&
                    <SendMessageTour
                        prefillMessage={prefillMessage}
                        currentChannel={currentChannel}
                        currentUserId={currentUserId}
                        currentChannelTeammateUsername={currentChannelTeammateUsername}
                    />}
            </div>
            <div
                id='postCreateFooter'
                role='form'
                className={classNames('adv-txt-editor__footer', {
                    'has-error': postError,
                })}
            >
                <div className='d-flex justify-content-between'>
                    <MsgTyping
                        channelId={channelId}
                        postId={postId}
                    />
                </div>
                <div>
                    {postError && <label className={classNames('post-error', {errorClass})}>{postError}</label>}
                    {serverErrorJsx}
                </div>
            </div>
        </div>
    );
};

export default AdvanceTextEditor;
