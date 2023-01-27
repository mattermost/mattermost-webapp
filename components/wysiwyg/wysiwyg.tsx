// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect, useRef, useState} from 'react';
import {EditorContent, Editor, useEditor} from '@tiptap/react';
import type {KeyboardShortcutCommand, JSONContent} from '@tiptap/react';
import isEqual from 'lodash/isEqual';

import {sortFileInfos} from 'mattermost-redux/utils/file_utils';

import FileUpload, {PostType} from 'components/file_upload';
import type {FileUploadClass} from 'components/file_upload';
import FilePreview from 'components/file_preview';
import type {FilePreviewInfo} from 'components/file_preview';

import Constants from 'utils/constants';
import {cmdOrCtrlPressed, isKeyPressed} from 'utils/utils';

import type {NewPostDraft} from 'types/store/draft';

import type {FileInfo} from '@mattermost/types/files';
import type {ServerError} from '@mattermost/types/errors';

// import all custom components, extensions, etc.
import {
    EditorContainer,
    EditorError,
    EditorMessageFooter,
    WysiwygContainer,
    WysiwygLayout,
} from './components/editor';
import EmojiPicker from './components/emoji-picker';
import {PriorityLabels} from './components/priority-labels';
import Toolbar from './components/toolbar';
import SendButton from './components/send-button';
import {Extensions} from './extensions';
import type {SuggestionConfig} from './extensions';
import {contentToMarkdown} from './utils/contentParser';

export enum Formatters {
    link,
    table,
    image,
    codeBlock,
}

export type WysiwygConfig = {
    disableFormatting?: Formatters[];
    enterHandling?: {
        ctrlSend?: boolean;
        codeBlockOnCtrlEnter?: boolean;
    };
    keyHandlers?: Record<string, KeyboardShortcutCommand>;
    suggestions?: Omit<SuggestionConfig, 'emoji'>;
    fileUpload?: {
        rootId: string;
        channelId: string;
        postType: PostType;
    };
    enablePriority?: boolean;
    enableEmojiPicker?: boolean;
    useCustomEmojis?: boolean;
    locale?: string;
};

export type MessageData = {
    content?: JSONContent;
    metadata?: NewPostDraft['metadata'];
} | null

type Props = {

    /**
     * Function to handle submitting the content.
     * Receives the current Markdown string as mandatory, as well as an object containing JSONContent and metadata
     * values from the editor as optional parameters.
     */
    onSubmit: (markdownText: string, data?: MessageData) => void;

    /**
     * Function to handle changes in the editors content.
     * Receives the current Markdown string as mandatory, as well as an object containing JSONContent and metadata
     * values from the editor as optional parameters.
     */
    onChange?: (markdownText: string, data?: MessageData) => void;

    /**
     * Function to handle changes in file attachments.
     * Receives the current filInfo array and uploadsInProgress values from the editor as optional parameters.
     */
    onAttachmentChange?: (fileInfos: FileInfo[], uploadsInProgress: string[]) => void;

    /**
     * Configuration object to fine-tune the WYSIWYG editor behavior.
     * Holds settings to disable certain formatting functions, configurations needed for the different types of
     * suggestions, additional keyHandlers and additional Controls for the toolbar.
     */
    config?: WysiwygConfig;

    /**
     * If present the editor will be populated with the content specified in this draft.
     */
    draft?: NewPostDraft;

    /**
     * A string to show when the editor is empty.
     */
    placeholder?: string;

    /**
     * Display an error message below the editor
     */
    errorMessage?: string;

    /**
     * Disables editing and formatting funcitonalities.
     */
    readOnly?: boolean;

    /**
     * Renders the Editor without the Layout/Structure component
     */
    noMargin?: boolean;

    /**
     * Elements to show in the footer element of the editor (if any)
     */
    footerContent?: React.ReactElement;
}

const Wysiwyg = (props: Props) => {
    const {
        config = {},
        noMargin = false,
        onSubmit,
        onChange,
        onAttachmentChange,
        placeholder,
        readOnly,
        draft,
        footerContent,
        errorMessage,
    } = props;

    const [metadata, setMetadata] = useState<NewPostDraft['metadata']|null>(draft?.metadata);

    const {enableEmojiPicker = false, useCustomEmojis = false, locale = 'en'} = config;

    const handleSubmit = async (editor: Editor, event?: React.FormEvent) => {
        event?.preventDefault();

        /**
         * TODO: should we maybe type this as a promise so we can ensure to only clear the
         *       content and attachments when the operation was succesful?
         *       This could be helpful since, most of the time, we will have some API calls we need to wait for anyways.
         *
         * @example:
         * ```
         * onSubmit().then(() => {
         *     editor?.commands.clearContent(true);
         *     setAttachments([]);
         *     setUploads([]);
         *     setUploadsProgress({});
         * }).catch(({error}) => {
         *     // Something went wrong
         *     setError({error});
         * })
         * ```
         */

        // 1. fire the passed onSubmit function
        await onSubmit(contentToMarkdown(editor.getJSON()), {content: editor.getJSON()});

        if (!editor.isEmpty) {
            // 2. clear the editor content
            editor.commands.clearContent(true);
        }

        // 3. clear all attachments and related state
        setAttachments([]);
        setUploads([]);
        setUploadsProgress({});
        setMetadata(null);
    };

    const editor = useEditor({
        extensions: [
            Extensions.configure({
                config,
                hardBreak: false,
                placeholder: placeholder ? {placeholder} : false,
                codeBlock: {
                    exitOnArrowDown: true,
                },
                table: {allowTableNodeSelection: true},
                link: {
                    linkOnPaste: false,
                    openOnClick: false,
                    HTMLAttributes: {class: 'wysiwyglink'},
                },
                suggestions: {
                    emoji: {useCustomEmojis},
                    mention: config?.suggestions?.mention,
                    channel: config?.suggestions?.channel,
                    command: config?.suggestions?.command,
                },
                keyHandling: {
                    submitAction: handleSubmit,
                    ctrlSend: config?.enterHandling?.ctrlSend,
                    codeBlockOnCtrlEnter: config?.enterHandling?.codeBlockOnCtrlEnter,
                    additionalHandlers: config?.keyHandlers,
                },
            }),
        ],
        content: draft?.content,
        autofocus: 'end',
        onUpdate: ({editor}) => {
            // call the onChange function from the parent component (if available)
            onChange?.(contentToMarkdown(editor.getJSON()), {content: editor.getJSON()});
        },
        onTransaction({editor, transaction}) {
            // The editor state has changed.
            if (transaction.getMeta('priority') !== undefined) {
                const updatedMetadata = {...metadata, priority: transaction.getMeta('priority')};
                setMetadata(updatedMetadata);
                onChange?.(editor.getHTML(), {content: editor.getJSON(), metadata: updatedMetadata});
            }
        },
    }, [config]);

    // files currently attached to the editor
    const [attachments, setAttachments] = useState<FileInfo[]>(draft?.fileInfos || []);

    // files currently uploading
    const [uploads, setUploads] = useState<string[]>(draft?.uploadsInProgress || []);

    // percentage for the files that are uploading atm
    const [uploadsProgress, setUploadsProgress] = useState<Record<string, FileInfo>>({});
    const [fileError, setFileError] = useState<string>('');
    const containerRef = useRef<HTMLDivElement>(null);
    const fileUploadRef = useRef<FileUploadClass>(null);

    // since the attachment state is now being handled internally fire the optional `onAttachmentChange` handler
    useEffect(() => {
        onAttachmentChange?.(attachments, uploads);
    }, [onAttachmentChange, attachments, uploads]);

    // TODO: once we are able to replace the proprietary upload handler with the built-in mechanics we can use the
    //       keyhandler from tiptap instead, which is more powerful
    useEffect(() => {
        const keyUploadHandler = (e: KeyboardEvent) => {
            if (editor?.isFocused && cmdOrCtrlPressed(e) && !e.shiftKey && isKeyPressed(e, Constants.KeyCodes.U)) {
                e.preventDefault();
                fileUploadRef.current?.simulateInputClick();
            }
        };
        document.addEventListener('keydown', keyUploadHandler);

        return () => document.removeEventListener('keydown', keyUploadHandler);
    }, [editor, fileUploadRef]);

    if (!editor) {
        return <div>{'NOTHING TO SEE HERE'}</div>;
    }

    const disableSendButton = editor.isEmpty && !attachments.length;
    const sendButton = readOnly ? null : (
        <SendButton
            disabled={disableSendButton}
            handleSubmit={(event) => handleSubmit(editor, event)}
        />
    );

    // this can potentially be made a property in the config
    const emojiPicker = enableEmojiPicker ? <EmojiPicker editor={editor}/> : null;

    const getFileUploadTarget = () => containerRef.current;

    const handleUploadStart = (clientIds: string[]) => {
        setUploads(uploads.concat(clientIds));
        editor.commands.focus();
    };

    const removeIdsFromUploads = (clientIds: string[]) => {
        let updatedUploads = uploads;

        // remove each finished file from uploads
        for (let i = 0; i < clientIds.length; i++) {
            const id = clientIds[i];
            if (updatedUploads.length) {
                const index = updatedUploads.indexOf(id);

                if (index !== -1) {
                    updatedUploads = updatedUploads.filter((item, itemIndex) => index !== itemIndex);
                    fileUploadRef.current?.cancelUpload(id);
                }
            }
        }

        if (updatedUploads.length !== uploads.length) {
            setUploads(updatedUploads);
        }
    };

    const handleFileUploadComplete = (fileInfos: FileInfo[], clientIds: string[]) => {
        removeIdsFromUploads(clientIds);

        if (fileInfos.length) {
            setAttachments(sortFileInfos(attachments.concat(fileInfos), locale));
        }

        editor.commands.focus();
    };

    const handleUploadError = (err: string | ServerError, clientId?: string) => {
        const errorMessage = typeof err === 'string' ? err : err.message;

        if (!clientId) {
            setFileError(errorMessage);
            return;
        }

        removeIdsFromUploads([clientId]);
        setFileError(errorMessage);
    };

    const handleUploadProgress = (filePreviewInfo: FilePreviewInfo) => {
        setUploadsProgress({
            ...uploadsProgress,
            [filePreviewInfo.clientId]: filePreviewInfo,
        });
    };

    const fileUpload = (!config?.fileUpload || readOnly) ? null : (
        <FileUpload
            ref={fileUploadRef}
            fileCount={attachments.length + uploads.length}
            getTarget={getFileUploadTarget}
            onFileUploadChange={() => editor.commands.focus()}
            onUploadStart={handleUploadStart}
            onFileUpload={handleFileUploadComplete}
            onUploadError={handleUploadError}
            onUploadProgress={handleUploadProgress}
            rootId={config?.fileUpload?.rootId || ''}
            channelId={config?.fileUpload?.channelId || ''}
            postType={config?.fileUpload?.postType || PostType.post}
        />
    );

    const rightControls = (
        <>
            {fileUpload}
            {emojiPicker}
            {sendButton}
        </>
    );

    const removePreview = (id: string) => {
        // Clear previous errors
        setFileError('');

        // id can either be the id of an uploaded file or the client id of an in progress upload
        let index = attachments.findIndex((info) => info.id === id);
        if (index === -1) {
            index = uploads.indexOf(id);

            if (index !== -1) {
                removeIdsFromUploads([id]);
            }
        } else {
            setAttachments(attachments.filter((item, itemIndex) => index !== itemIndex));
        }
    };

    const attachmentPreview = readOnly || !(attachments.length || uploads.length) ? null : (
        <FilePreview
            fileInfos={attachments}
            onRemove={removePreview}
            uploadsInProgress={uploads}
            uploadsProgressPercent={uploadsProgress}
        />
    );

    const toolbarProps = {
        editor,
        rightControls,
    };

    const showFooter = fileError || footerContent;

    return (
        <WysiwygLayout noMargin={noMargin}>
            <WysiwygContainer>
                <EditorContainer ref={containerRef}>
                    <PriorityLabels
                        editor={editor}
                        priority={metadata?.priority}
                    />
                    <EditorContent editor={editor}/>
                    {attachmentPreview}
                </EditorContainer>
                <Toolbar {...toolbarProps}/>
            </WysiwygContainer>
            {showFooter && (
                <EditorMessageFooter>
                    {errorMessage && <EditorError>{errorMessage}</EditorError>}
                    {fileError && <EditorError>{fileError}</EditorError>}
                    {footerContent}
                </EditorMessageFooter>
            )}
        </WysiwygLayout>
    );
};

export default memo(Wysiwyg, (prevProps, nextProps) => {
    return isEqual(prevProps.config, nextProps.config);
});

export type {Editor, JSONContent};
