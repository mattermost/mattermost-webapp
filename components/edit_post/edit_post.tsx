// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ClipboardEventHandler, memo, useCallback, useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import {useIntl} from 'react-intl';

import {Post} from 'mattermost-redux/types/posts';
import {Emoji, SystemEmoji} from 'mattermost-redux/types/emojis';

import {AppEvents, Constants, ModalIdentifiers} from 'utils/constants';
import {
    formatGithubCodePaste,
    formatMarkdownTableMessage,
    getTable,
    isGitHubCodeBlock,
} from 'utils/paste';
import {postMessageOnKeyPress, splitMessageBasedOnCaretPosition} from 'utils/post_utils';
import {isMac} from 'utils/utils';
import * as Utils from 'utils/utils';

import DeletePostModal from 'components/delete_post_modal';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import Textbox, {TextboxClass} from 'components/textbox';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import {ModalData} from 'types/actions';

type DialogProps = {
    post?: Post;
    isRHS?: boolean;
};

export type Actions = {
    addMessageIntoHistory: (message: string) => void;
    editPost: (input: Partial<Post>) => Promise<Post>;
    unsetEditingPost: () => void;
    openModal: (input: ModalData<DialogProps>) => void;
    scrollPostListToBottom: () => void;
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
    useChannelMentions: boolean;
    editingPost: {
        post: Post | null;
        postId?: string;
        refocusId?: string;
        title?: string;
        isRHS?: boolean;
    };
    actions: Actions;
};

export type State = {
    editText: string;
    selectionRange: {start: number; end: number};
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

const EditPost = ({editingPost, actions, canEditPost, config, ...rest}: Props): JSX.Element | null => {
    const [editText, setEditText] = useState<string>(
        editingPost?.post?.message_source || editingPost?.post?.message || '',
    );
    const [selectionRange, setSelectionRange] = useState<State['selectionRange']>({start: editText.length, end: editText.length});
    const [postError, setPostError] = useState<React.ReactNode | null>(null);
    const [errorClass, setErrorClass] = useState<string>('');
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [renderScrollbar, setRenderScrollbar] = useState<boolean>(false);

    const textboxRef = useRef<TextboxClass>(null);
    const emojiButtonRef = useRef<HTMLButtonElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const {formatMessage} = useIntl();

    useEffect(() => {
        const focusTextBox = () => textboxRef?.current?.focus();

        document.addEventListener(AppEvents.FOCUS_EDIT_TEXTBOX, focusTextBox);
        return () => document.removeEventListener(AppEvents.FOCUS_EDIT_TEXTBOX, focusTextBox);
    }, []);

    useEffect(() => {
        if (selectionRange.start === selectionRange.end) {
            Utils.setCaretPosition(textboxRef.current?.getInputBox(), selectionRange.start);
        } else {
            Utils.setSelectionRange(textboxRef.current?.getInputBox(), selectionRange.start, selectionRange.end);
        }
    }, [selectionRange]);

    // just a helper so it's not always needed to update with setting both properties to the same value
    const setCaretPosition = (position: number) => setSelectionRange({start: position, end: position});

    const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = useCallback(({clipboardData, target, preventDefault}) => {
        if (
            !clipboardData ||
            !clipboardData.items ||
            !canEditPost ||
            (target as HTMLTextAreaElement).id !== 'edit_textbox'
        ) {
            return;
        }

        const table = getTable(clipboardData);

        if (!table) {
            return;
        }

        preventDefault();

        let message = editText;
        let newCaretPosition = selectionRange.start;

        if (table && isGitHubCodeBlock(table.className)) {
            const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste(
                selectionRange.start,
                message,
                clipboardData,
            );
            message = formattedMessage;
            newCaretPosition = selectionRange.start + formattedCodeBlock.length;
        } else if (table) {
            message = formatMarkdownTableMessage(table, editText.trim(), newCaretPosition);
            newCaretPosition = message.length - (editText.length - newCaretPosition);
        }

        setEditText(message);
        setCaretPosition(newCaretPosition);
    }, [canEditPost, selectionRange, editText]);

    const isSaveDisabled = () => {
        const {post} = editingPost;
        const hasAttachments = post && post.file_ids && post.file_ids.length > 0;

        if (hasAttachments) {
            return !canEditPost;
        }

        if (editText.trim() !== '') {
            return !canEditPost;
        }

        return !rest.canDeletePost;
    };

    const applyHotkeyMarkdown = (e: React.KeyboardEvent) => {
        const res = Utils.applyHotkeyMarkdown(e);

        setEditText(res.message);
        setSelectionRange({start: res.selectionStart, end: res.selectionEnd});
    };

    const handleRefocusAndExit = (refocusId: string|null) => {
        if (refocusId) {
            const element = document.getElementById(refocusId);
            element?.focus();
        }

        actions.unsetEditingPost();
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

        if (updatedPost.message === (editingPost.post?.message_source || editingPost.post?.message)) {
            handleRefocusAndExit(editingPost.refocusId || null);
            return;
        }

        const hasAttachment = Boolean(
            editingPost.post?.file_ids && editingPost.post?.file_ids.length > 0,
        );
        if (updatedPost.message.trim().length === 0 && !hasAttachment) {
            handleRefocusAndExit(null);

            const deletePostModalData = {
                modalId: ModalIdentifiers.DELETE_POST,
                dialogType: DeletePostModal,
                dialogProps: {
                    post: editingPost.post,
                    isRHS: editingPost.isRHS,
                },
            };

            actions.openModal(deletePostModalData);
            return;
        }

        await actions.editPost(updatedPost as Post);

        handleRefocusAndExit(editingPost.refocusId || null);
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
            selectionRange.start,
        );

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
            handleRefocusAndExit(editingPost.refocusId || null);
        } else if ((ctrlKeyCombo && markdownHotkey) || (ctrlAltCombo && markdownLinkKey)) {
            applyHotkeyMarkdown(e);
        }
    };

    const handleSelect = (e: React.SyntheticEvent) => {
        if (textboxRef.current) {
            Utils.adjustSelection(textboxRef.current.getInputBox(), e);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setEditText(e.target.value);

    const handleHeightChange = (height: number, maxHeight: number) => setRenderScrollbar(height > maxHeight);

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
        const emojiAlias = emoji && (((emoji as SystemEmoji).short_names && (emoji as SystemEmoji).short_names[0]) || emoji.name);

        if (!emojiAlias) {
            //Oops.. There went something wrong
            return;
        }

        if (editText === '') {
            setEditText(`:${emojiAlias}: `);
        } else {
            const {firstPiece, lastPiece} = splitMessageBasedOnCaretPosition(
                selectionRange.start,
                editText,
            );

            // check whether the first piece of the message is empty when cursor
            // is placed at beginning of message and avoid adding an empty string at the beginning of the message
            const newMessage = firstPiece === '' ? `:${emojiAlias}: ${lastPiece}` : `${firstPiece} :${emojiAlias}: ${lastPiece}`;
            const newCaretPosition = firstPiece === '' ? `:${emojiAlias}: `.length : `${firstPiece} :${emojiAlias}: `.length;

            setEditText(newMessage);
            setCaretPosition(newCaretPosition);
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

    const getEmojiContainerRef = useCallback(() => textboxRef.current, [textboxRef]);
    const getEmojiTargetRef = useCallback(() => emojiButtonRef.current, [emojiButtonRef]);

    let emojiPicker = null;
    const emojiButtonAriaLabel = formatMessage({
        id: 'emoji_picker.emojiPicker',
        defaultMessage: 'Emoji Picker',
    }).toLowerCase();

    if (config.EnableEmojiPicker === 'true') {
        emojiPicker = (
            <>
                <EmojiPickerOverlay
                    show={showEmojiPicker}
                    container={getEmojiContainerRef}
                    target={getEmojiTargetRef}
                    onHide={hideEmojiPicker}
                    onEmojiClick={handleEmojiClick}
                    onGifClick={handleGifClick}
                    enableGifPicker={config.EnableGifPicker === 'true'}
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
            </>
        );
    }

    return (
        <div
            className={classNames('post--editing__wrapper', {
                scroll: renderScrollbar,
            })}
            ref={wrapperRef}
        >
            <Textbox
                tabIndex={0}
                rootId={editingPost.post ? Utils.getRootId(editingPost.post) : ''}
                onChange={handleChange}
                onKeyPress={handleEditKeyPress}
                onKeyDown={handleKeyDown}
                onSelect={handleSelect}
                onHeightChange={handleHeightChange}
                handlePostError={handlePostError}
                onPaste={handlePaste}
                value={editText}
                channelId={rest.channelId}
                emojiEnabled={config.EnableEmojiPicker === 'true'}
                createMessage={formatMessage({id: 'edit_post.editPost', defaultMessage: 'Edit the post...'})}
                supportsCommands={false}
                suggestionListPosition='bottom'
                id='edit_textbox'
                ref={textboxRef}
                characterLimit={rest.maxPostSize}
                useChannelMentions={rest.useChannelMentions}
            />
            <div className='post-body__actions'>
                {emojiPicker}
            </div>
            <EditPostHelperText ctrlSend={rest.ctrlSend}/>
            {postError && (
                <div className={classNames('edit-post-footer', {'has-error': postError})}>
                    <label className={classNames('post-error', errorClass)}>{postError}</label>
                </div>
            )}
        </div>
    );
};

type EditPostHelperTextProps = {
    ctrlSend: boolean;
}

const EditPostHelperText = memo(({ctrlSend}: EditPostHelperTextProps) => {
    const ctrlSendKey = isMac() ? '⌘+' : 'CTRL+';

    return (
        <div className='post-body__helper-text'>
            <FormattedMarkdownMessage
                id='edit_post.helper_text'
                defaultMessage='**{key}ENTER** to Save, **ESC** to Cancel'
                values={{
                    key: ctrlSend ? ctrlSendKey : '',
                }}
            />
        </div>
    );
});

export default EditPost;
