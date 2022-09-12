// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties, useCallback, useRef, useState} from 'react';
import classNames from 'classnames';
import {useIntl} from 'react-intl';
import {EmoticonHappyOutlineIcon} from '@mattermost/compass-icons/components';

import {Emoji} from '@mattermost/types/emojis';
import {FileInfo} from '@mattermost/types/files';
import {ServerError} from '@mattermost/types/errors';
import {Channel} from '@mattermost/types/channels';
import {PostDraft} from 'types/store/draft';

import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import FilePreview from 'components/file_preview';
import FileUpload from 'components/file_upload';
import MsgTyping from 'components/msg_typing';
import Textbox, {TextboxElement} from 'components/textbox';
import TextboxClass from 'components/textbox/textbox';
import MessageSubmitError from 'components/message_submit_error';
import {FilePreviewInfo} from 'components/file_preview/file_preview';
import {SendMessageTour} from 'components/onboarding_tour';
import {FileUpload as FileUploadClass} from 'components/file_upload/file_upload';
import OverlayTrigger from 'components/overlay_trigger';
import KeyboardShortcutSequence, {KEYBOARD_SHORTCUTS} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';

import * as Utils from 'utils/utils';
import {ApplyMarkdownOptions} from 'utils/markdown/apply_markdown';
import Constants, {Locations} from 'utils/constants';
import RhsSuggestionList from '../suggestion/rhs_suggestion_list';
import Tooltip from '../tooltip';

import TexteditorActions from './texteditor_actions';
import FormattingBar from './formatting_bar';
import ShowFormat from './show_formatting';
import SendButton from './send_button';
import {IconContainer} from './formatting_bar/formatting_icon';

import './advanced_text_editor.scss';

type Props = {

    /**
     * location of the advanced text editor in the UI (center channel / RHS)
     */
    location: string;
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
    handleMouseUpKeyUp: (e: React.MouseEvent<TextboxElement> | React.KeyboardEvent<TextboxElement>) => void;
    handleSelect: (e: React.SyntheticEvent<TextboxElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent<TextboxElement>) => void;
    postMsgKeyPress: (e: React.KeyboardEvent<TextboxElement>) => void;
    handleChange: (e: React.ChangeEvent<TextboxElement>) => void;
    toggleEmojiPicker: () => void;
    handleGifClick: (gif: string) => void;
    handleEmojiClick: (emoji: Emoji) => void;
    handleEmojiClose: () => void;
    hideEmojiPicker: () => void;
    toggleAdvanceTextEditor: () => void;
    handleUploadProgress: (filePreviewInfo: FilePreviewInfo) => void;
    handleUploadError: (err: string | ServerError, clientId?: string, channelId?: string) => void;
    handleFileUploadComplete: (fileInfos: FileInfo[], clientIds: string[], channelId: string, rootId?: string) => void;
    handleUploadStart: (clientIds: string[], channelId: string) => void;
    handleFileUploadChange: () => void;
    getFileUploadTarget: () => HTMLInputElement | null;
    fileUploadRef: React.RefObject<FileUploadClass>;
    prefillMessage?: (message: string, shouldFocus?: boolean) => void;
    channelId: string;
    postId: string;
    textboxRef: React.RefObject<TextboxClass>;
    isThreadView?: boolean;
    additionalControls?: React.ReactNodeArray;
    labels?: React.ReactNode;
}

const AdvanceTextEditor = ({
    location,
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
    additionalControls,
    labels,
}: Props) => {
    const readOnlyChannel = !canPost;
    const {formatMessage} = useIntl();
    const ariaLabelMessageInput = Utils.localizeMessage(
        'accessibility.sections.centerFooter',
        'message input complimentary region',
    );
    const emojiPickerRef = useRef<HTMLButtonElement>(null);

    const [scrollbarWidth, setScrollbarWidth] = useState(0);
    const [renderScrollbar, setRenderScrollbar] = useState(false);

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
            <div>
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

    let postType = 'post';
    if (postId) {
        postType = isThreadView ? 'thread' : 'comment';
    }

    const fileUploadJSX = readOnlyChannel ? null : (
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

    const getEmojiPickerRef = () => {
        return emojiPickerRef.current;
    };

    let emojiPicker = null;
    const emojiButtonAriaLabel = formatMessage({
        id: 'emoji_picker.emojiPicker',
        defaultMessage: 'Emoji Picker',
    }).toLowerCase();

    if (enableEmojiPicker && !readOnlyChannel) {
        const emojiPickerTooltip = (
            <Tooltip id='upload-tooltip'>
                <KeyboardShortcutSequence
                    shortcut={KEYBOARD_SHORTCUTS.msgShowEmojiPicker}
                    hoistDescription={true}
                    isInsideTooltip={true}
                />
            </Tooltip>
        );
        emojiPicker = (
            <>
                <EmojiPickerOverlay
                    show={showEmojiPicker}
                    target={getEmojiPickerRef}
                    onHide={hideEmojiPicker}
                    onEmojiClose={handleEmojiClose}
                    onEmojiClick={handleEmojiClick}
                    onGifClick={handleGifClick}
                    enableGifPicker={enableGifPicker}
                    topOffset={-7}
                />
                <OverlayTrigger
                    placement='top'
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    trigger={Constants.OVERLAY_DEFAULT_TRIGGER}
                    overlay={emojiPickerTooltip}
                >
                    <IconContainer
                        id={'emojiPickerButton'}
                        ref={emojiPickerRef}
                        onClick={toggleEmojiPicker}
                        type='button'
                        aria-label={emojiButtonAriaLabel}
                        disabled={shouldShowPreview}
                        className={classNames({active: showEmojiPicker})}
                    >
                        <EmoticonHappyOutlineIcon
                            color={'currentColor'}
                            size={18}
                        />
                    </IconContainer>
                </OverlayTrigger>
            </>
        );
    }

    const disableSendButton = Boolean(readOnlyChannel || (!message.trim().length && !draft.fileInfos.length));
    const sendButton = readOnlyChannel ? null : (
        <SendButton
            disabled={disableSendButton}
            handleSubmit={handleSubmit}
        />
    );

    const showFormatJSX = disableSendButton ? null : (
        <ShowFormat
            onClick={handleShowFormat}
            active={shouldShowPreview}
        />
    );

    const extraControls = (
        <>
            {fileUploadJSX}
            {emojiPicker}
        </>
    );

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

    /**
     * by getting the value directly from the textbox we eliminate all unnecessary
     * re-renders for the FormattingBar component. The previous method of always passing
     * down the current message value that came from the parents state was not optimal,
     * although still working as expected
     */
    const getCurrentValue = useCallback(() => textboxRef.current?.getInputBox().value, [textboxRef]);
    const getCurrentSelection = useCallback(() => {
        const input = textboxRef.current?.getInputBox();

        return {
            start: input.selectionStart,
            end: input.selectionEnd,
        };
    }, [textboxRef]);

    let textboxId = 'textbox';

    switch (location) {
    case Locations.CENTER:
        textboxId = 'post_textbox';
        break;
    case Locations.RHS_COMMENT:
        textboxId = 'reply_textbox';
        break;
    case Locations.MODAL:
        textboxId = 'modal_textbox';
        break;
    }

    const formattingBar = readOnlyChannel ? null : (
        <FormattingBar
            applyMarkdown={applyMarkdown}
            getCurrentMessage={getCurrentValue}
            getCurrentSelection={getCurrentSelection}
            isOpen={true}
            disableControls={shouldShowPreview}
            additionalControls={additionalControls}
            extraControls={extraControls}
            toggleAdvanceTextEditor={toggleAdvanceTextEditor}
            showFormattingControls={!isFormattingBarHidden}
            location={location}
        />
    );

    return (
        <div
            className={classNames('AdvancedTextEditor', {
                'AdvancedTextEditor__attachment-disabled': !canUploadFiles,
                scroll: renderScrollbar,
            })}
            style={
                renderScrollbar && scrollbarWidth ? ({
                    '--detected-scrollbar-width': `${scrollbarWidth}px`,
                } as CSSProperties) : undefined
            }
        >
            <div
                className={'AdvancedTextEditor__body'}
                disabled={readOnlyChannel}
            >
                <div
                    role='application'
                    id='advancedTextEditorCell'
                    data-a11y-sort-order='2'
                    aria-label={ariaLabelMessageInput}
                    tabIndex={-1}
                    className='AdvancedTextEditor__cell a11y__region'
                >
                    {labels}
                    <Textbox
                        hasLabels={Boolean(labels)}
                        suggestionList={RhsSuggestionList}
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
                        id={textboxId}
                        ref={textboxRef!}
                        disabled={readOnlyChannel}
                        characterLimit={maxPostSize}
                        preview={shouldShowPreview}
                        badConnection={badConnection}
                        listenForMentionKeyClick={true}
                        useChannelMentions={useChannelMentions}
                        rootId={postId}
                    />
                    {attachmentPreview}
                    <TexteditorActions
                        placement='top'
                    >
                        {showFormatJSX}
                    </TexteditorActions>
                    {formattingBar}
                    <TexteditorActions
                        placement='bottom'
                    >
                        {sendButton}
                    </TexteditorActions>
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
                className={classNames('AdvancedTextEditor__footer', {
                    'AdvancedTextEditor__footer--has-error': postError || serverError,
                })}
            >
                {postError && <label className={classNames('post-error', {errorClass})}>{postError}</label>}
                {serverErrorJsx}
                <MsgTyping
                    channelId={channelId}
                    postId={postId}
                />
            </div>
        </div>
    );
};

export default AdvanceTextEditor;
