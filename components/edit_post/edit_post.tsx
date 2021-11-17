// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import {useIntl} from 'react-intl';

import {Post} from 'mattermost-redux/types/posts';
import {Emoji, SystemEmoji} from 'mattermost-redux/types/emojis';
import {Constants, ModalIdentifiers} from '../../utils/constants';
import {
    formatGithubCodePaste,
    formatMarkdownTableMessage,
    getTable,
    isGitHubCodeBlock,
} from '../../utils/paste';
import {postMessageOnKeyPress, splitMessageBasedOnCaretPosition} from '../../utils/post_utils';
import * as Utils from '../../utils/utils';
import DeletePostModal from '../delete_post_modal';
import EmojiPickerOverlay from '../emoji_picker/emoji_picker_overlay';
import FileUpload from '../file_upload';
import FormattedMarkdownMessage from '../formatted_markdown_message';
import Textbox from '../textbox';
import EmojiIcon from '../widgets/icons/emoji_icon';

type OpenModal = {
    ModalId: string;
    dialogType: typeof React.Component;
    dialogProps: {
        post: Post;
        isRHS?: boolean;
    };
};

export type Actions = {
    addMessageIntoHistory: (message: string) => void;
    editPost: (input: Partial<Post>) => Promise<Post>;
    unsetEditingPost: () => void;
    openModal: (input: OpenModal) => void;
    setShowPreview: (newPreview: boolean) => void;
}

export type Props = {
    canEditPost?: boolean;
    canDeletePost?: boolean;
    readOnlyChannel?: boolean;
    channelId: string;
    codeBlockOnCtrlEnter: boolean;
    ctrlSend: boolean;
    config: {
        EnableEmojiPicker?: string;
        EnableGifPicker?: string;
    };
    maxPostSize: number;
    shouldShowPreview: boolean;
    useChannelMentions: boolean;
    editingPost: {
        post?: Post;
        postId?: string;
        refocusId?: string;
        title?: string;
        isRHS?: boolean;
    };
    actions: Actions;
};

export type State = {
    editText: string;
    caretPosition: number;
    postError: React.ReactNode;
    errorClass: string | null;
    showEmojiPicker: boolean;
    renderScrollbar: boolean;
    scrollbarWidth: number;
    prevShowState: boolean;
};

const {KeyCodes} = Constants;

const TOP_OFFSET = 0;
const RIGHT_OFFSET = 10;

const EditPost = ({editingPost, actions, ...rest}: Props): JSX.Element => {
    const [editText, setEditText] = useState<string>(
        editingPost.post?.message_source || editingPost.post?.message || '',
    );
    const [caretPosition, setCaretPosition] = useState<number>(0);
    const [postError, setPostError] = useState<React.ReactNode | null>(null);
    const [errorClass, setErrorClass] = useState<string>('');
    const [refocusId, setRefocusId] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [renderScrollbar, setRenderScrollbar] = useState<boolean>(false);
    const [scrollbarWidth, setScrollbarWidth] = useState<number>(0);

    const textboxRef = useRef<HTMLInputElement>(null);
    const emojiButtonRef = useRef<null>(null);

    const {formatMessage} = useIntl();

    useEffect(() => textboxRef?.current?.focus(), []);
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (
                !e.clipboardData ||
                !e.clipboardData.items ||
                !rest.canEditPost ||
                (e.target as HTMLTextAreaElement).id !== 'edit_textbox'
            ) {
                return;
            }

            const {clipboardData} = e;
            const table = getTable(clipboardData);

            if (!table) {
                return;
            }

            e.preventDefault();

            let message = editText;
            let newCaretPosition = caretPosition;

            if (table && isGitHubCodeBlock(table.className)) {
                const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste(
                    caretPosition,
                    message,
                    clipboardData,
                );
                newCaretPosition = caretPosition + formattedCodeBlock.length;
                message = formattedMessage;
            } else if (table) {
                message = formatMarkdownTableMessage(table, editText.trim(), newCaretPosition);
                newCaretPosition = message.length - (editText.length - newCaretPosition);
            }

            setEditText(message);
            setCaretPosition(newCaretPosition);

            if (textboxRef.current) {
                Utils.setCaretPosition(textboxRef.current.getInputBox(), newCaretPosition);
            }
        };

        document.addEventListener('paste', handlePaste);

        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    });

    const readOnlyChannel = rest.readOnlyChannel || !rest.canEditPost;

    const isSaveDisabled = () => {
        const {post} = editingPost;
        const hasAttachments = post && post.file_ids && post.file_ids.length > 0;

        if (hasAttachments) {
            return !rest.canEditPost;
        }

        if (editText.trim() !== '') {
            return !rest.canEditPost;
        }

        return !rest.canDeletePost;
    };

    const applyHotkeyMarkdown = (e: React.KeyboardEvent) => {
        const res = Utils.applyHotkeyMarkdown(e);

        setEditText(res.message);
        if (textboxRef.current) {
            Utils.setSelectionRange(
                textboxRef.current.getInputBox(),
                res.selectionStart,
                res.selectionEnd,
            );
        }
    };

    const handleRefocusAndExit = () => {
        if (refocusId) {
            setTimeout(() => {
                const element = document.getElementById(refocusId);
                if (element) {
                    element.focus();
                }
            });
        }

        setRefocusId(null);
        setCaretPosition(0);
        setPostError(null);
        setErrorClass('');
        setRefocusId(null);
        setShowEmojiPicker(false);
        setRenderScrollbar(false);
        setScrollbarWidth(0);
    };

    const handleHide = (doRefocus = true) => {
        setRefocusId(doRefocus && editingPost.refocusId ? editingPost.refocusId : null);
        setEditText(editingPost.post?.message || '');
        actions.unsetEditingPost();
        handleRefocusAndExit();
    };

    const handleEdit = async () => {
        if (!editingPost.post || isSaveDisabled()) {
            return;
        }

        const updatedPost = {
            message: editText,
            id: editingPost.postId,
            channel_id: editingPost.post.channel_id,
        };

        if (postError) {
            setErrorClass('animation--highlight');
            setTimeout(() => setErrorClass(''), Constants.ANIMATION_TIMEOUT);
            return;
        }

        if (
            updatedPost.message === (editingPost.post?.message_source || editingPost.post?.message)
        ) {
            // no changes so just close the modal
            handleHide();
            return;
        }

        const hasAttachment = Boolean(
            editingPost.post?.file_ids && editingPost.post?.file_ids.length > 0,
        );
        if (updatedPost.message.trim().length === 0 && !hasAttachment) {
            handleHide(false);

            const deletePostModalData = {
                ModalId: ModalIdentifiers.DELETE_POST,
                dialogType: DeletePostModal,
                dialogProps: {
                    post: editingPost.post,
                    isRHS: editingPost.isRHS,
                },
            };

            actions.openModal(deletePostModalData);
            return;
        }

        actions.addMessageIntoHistory(updatedPost.message);

        const data = await actions.editPost(updatedPost as Post);

        if (data) {
            window.scrollTo(0, 0);
        }

        handleHide();
    };

    const handleEditKeyPress = (e: React.KeyboardEvent) => {
        const {ctrlSend, codeBlockOnCtrlEnter} = rest;

        const {allowSending, ignoreKeyPress} = postMessageOnKeyPress(
            e,
            editText,
            ctrlSend,
            codeBlockOnCtrlEnter,
            Date.now(),
            0,
            caretPosition,
        ) as {allowSending: boolean; ignoreKeyPress?: boolean};

        if (ignoreKeyPress) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (allowSending && textboxRef.current) {
            e.preventDefault();
            textboxRef.current.blur();
            handleEdit();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const {ctrlSend, codeBlockOnCtrlEnter} = rest;

        const ctrlOrMetaKeyPressed = e.ctrlKey || e.metaKey;
        const ctrlKeyCombo = Utils.cmdOrCtrlPressed(e) && !e.altKey && !e.shiftKey;
        const ctrlAltCombo = Utils.cmdOrCtrlPressed(e, true) && e.altKey;
        const ctrlEnterKeyCombo =
            (ctrlSend || codeBlockOnCtrlEnter) &&
            Utils.isKeyPressed(e, KeyCodes.ENTER) &&
            ctrlOrMetaKeyPressed;
        const markdownHotkey =
            Utils.isKeyPressed(e, KeyCodes.B) || Utils.isKeyPressed(e, KeyCodes.I);
        const markdownLinkKey = Utils.isKeyPressed(e, KeyCodes.K);

        // listen for line break key combo and insert new line character
        if (Utils.isUnhandledLineBreakKeyCombo(e)) {
            e.stopPropagation(); // perhaps this should happen in all of these cases? or perhaps Modal should not be listening?
            setEditText(Utils.insertLineBreakFromKeyEvent(e));
        } else if (ctrlEnterKeyCombo) {
            handleEdit();
        } else if (Utils.isKeyPressed(e, KeyCodes.ESCAPE) && !showEmojiPicker) {
            handleHide();
        } else if ((ctrlKeyCombo && markdownHotkey) || (ctrlAltCombo && markdownLinkKey)) {
            applyHotkeyMarkdown(e);
        }
    };

    const handleSelect = (e: React.SyntheticEvent) => {
        if (textboxRef.current) {
            Utils.adjustSelection(textboxRef.current.getInputBox(), e);
        }
    };

    const handleMouseUpKeyUp = (e: React.MouseEvent | React.KeyboardEvent) =>
        setCaretPosition(Utils.getCaretPosition(e.target));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setEditText(e.target.value);

    const handleHeightChange = (height: number, maxHeight: number) => {
        if (textboxRef.current) {
            setRenderScrollbar(height > maxHeight);
            setScrollbarWidth(Utils.scrollbarWidth(textboxRef.current.getInputBox()));
        }
    };

    const handlePostError = (_postError: React.ReactNode) => {
        if (_postError !== postError) {
            setPostError(_postError);
        }
    };

    const hideEmojiPicker = () => {
        setShowEmojiPicker(false);
        textboxRef.current?.focus();
    };

    const handleEmojiClick = (emoji?: Emoji) => {
        const emojiAlias =
            emoji &&
            (((emoji as SystemEmoji).short_names && (emoji as SystemEmoji).short_names[0]) ||
                emoji.name);

        if (!emojiAlias) {
            //Oops.. There went something wrong
            return;
        }

        if (editText === '') {
            setEditText(`:${emojiAlias}: `);
        } else {
            const {firstPiece, lastPiece} = splitMessageBasedOnCaretPosition(
                caretPosition,
                editText,
            );

            // check whether the first piece of the message is empty when cursor
            // is placed at beginning of message and avoid adding an empty string at the beginning of the message
            const newMessage = firstPiece === '' ? `:${emojiAlias}: ${lastPiece}` : `${firstPiece} :${emojiAlias}: ${lastPiece}`;
            const newCaretPosition = firstPiece === '' ? `:${emojiAlias}: `.length : `${firstPiece} :${emojiAlias}: `.length;

            const textbox = textboxRef.current?.getInputBox();

            setEditText(newMessage);
            setCaretPosition(newCaretPosition);
            Utils.setCaretPosition(textbox, newCaretPosition);
        }

        setShowEmojiPicker(false);
        textboxRef.current?.focus();
    };

    const handleGifClick = (gif: string) => {
        if (editText === '') {
            setEditText(gif);
        } else {
            const newMessage = (/\s+$/).test(editText) ? `${editText}${gif}` : `${editText} ${gif}`;
            setEditText(newMessage);
        }

        setShowEmojiPicker(false);
        textboxRef.current?.focus();
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
        if (showEmojiPicker) {
            textboxRef.current?.focus();
        }
    };

    let fileUpload;
    if (!readOnlyChannel && !rest.shouldShowPreview) {
        fileUpload = (
            <FileUpload
                ref={fileUploadRef}
                fileCount={this.getFileCount()}
                getTarget={this.getFileUploadTarget}
                onFileUploadChange={this.handleFileUploadChange}
                onUploadStart={this.handleUploadStart}
                onFileUpload={this.handleFileUploadComplete}
                onUploadError={this.handleUploadError}
                onUploadProgress={this.handleUploadProgress}
                rootId={this.props.rootId}
                channelId={this.props.channelId}
                postType='comment'
            />
        );
    }

    let emojiPicker = null;
    const emojiButtonAriaLabel = formatMessage({
        id: 'emoji_picker.emojiPicker',
        defaultMessage: 'Emoji Picker',
    }).toLowerCase();
    if (rest.config.EnableEmojiPicker === 'true' && !rest.shouldShowPreview) {
        emojiPicker = (
            <div>
                <EmojiPickerOverlay
                    show={showEmojiPicker}
                    container={() => textboxRef.current}
                    target={() => emojiButtonRef.current}
                    onHide={hideEmojiPicker}
                    onEmojiClick={handleEmojiClick}
                    onGifClick={handleGifClick}
                    enableGifPicker={rest.config.EnableGifPicker === 'true'}
                    topOffset={TOP_OFFSET}
                    rightOffset={RIGHT_OFFSET}
                />
                <button
                    aria-label={emojiButtonAriaLabel}
                    id='editPostEmoji'
                    ref={emojiButtonRef}
                    className='style--none post-action'
                    onClick={toggleEmojiPicker}
                >
                    <EmojiIcon className='icon icon--emoji'/>
                </button>
            </div>
        );
    }

    console.log('##### rest props', rest);

    return (
        <div
            className={classNames('textarea-wrapper', {
                scroll: renderScrollbar,
            })}
            style={
                renderScrollbar && scrollbarWidth ? ({'--detected-scrollbar-width': `${scrollbarWidth}px`} as React.CSSProperties) : undefined
            }
        >
            <Textbox
                tabIndex={0}
                rootId={editingPost.post ? Utils.getRootId(editingPost.post) : ''}
                onChange={handleChange}
                onKeyPress={handleEditKeyPress}
                onKeyDown={handleKeyDown}
                onSelect={handleSelect}
                onMouseUp={handleMouseUpKeyUp}
                onKeyUp={handleMouseUpKeyUp}
                onHeightChange={handleHeightChange}
                handlePostError={handlePostError}
                value={editText}
                channelId={rest.channelId}
                emojiEnabled={rest.config.EnableEmojiPicker === 'true'}
                createMessage={Utils.localizeMessage('edit_post.editPost', 'Edit the post...')}
                supportsCommands={false}
                suggestionListPosition='bottom'
                id='edit_textbox'
                ref={textboxRef}
                characterLimit={rest.maxPostSize}
                preview={rest.shouldShowPreview}
                useChannelMentions={rest.useChannelMentions}
            />
            <div className='post-body__actions'>
                {fileUpload}
                {emojiPicker}
            </div>
            <div className='post-body__helper-text'>
                <FormattedMarkdownMessage
                    id='create_post.helper_text'
                    defaultMessage='**ENTER** to Save, **ESC** to Cancel'
                />
            </div>
            {postError && (
                <div className={classNames('edit-post-footer', {'has-error': postError})}>
                    <label className={classNames('post-error', errorClass)}>{postError}</label>
                </div>
            )}
        </div>
    );
};

export default EditPost;
