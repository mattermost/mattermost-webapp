// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react';
import type {FormEvent} from 'react';
import type {KeyboardShortcutCommand} from '@tiptap/core';
import {EditorContent, useEditor} from '@tiptap/react';
import type {JSONContent} from '@tiptap/react';

import {sortFileInfos} from 'mattermost-redux/utils/file_utils';

import type {NewPostDraft} from 'types/store/draft';
import FileUpload from 'components/file_upload';
import type {FileUploadClass} from 'components/file_upload';
import FilePreview from 'components/file_preview';
import type {FilePreviewInfo} from 'components/file_preview';

import type {FileInfo} from '@mattermost/types/files';
import type {ServerError} from '@mattermost/types/errors';

// import all custom components, extensions, etc.
import {EditorContainer, WysiwygContainer} from './components/editor';
import EmojiPicker from './components/emoji-picker';
import Toolbar from './components/toolbar';
import SendButton from './components/send-button';
import {Extensions} from './extensions';
import type {SuggestionConfig} from './extensions';

import {htmlToMarkdown} from './utils/toMarkdown';

import {PropsFromRedux} from './index';

export enum Formatters {
    link,
    table,
    image,
    codeBlock,
}

export type WysiwygConfig = {
    disableFormatting?: Formatters[];
    keyHandlers?: Record<string, KeyboardShortcutCommand>;
    suggestions?: Omit<SuggestionConfig, 'emoji'>;
    additionalControls?: React.ReactNode[];
    fileUpload?: {
        rootId: string;
        channelId: string;
        postType: 'post' | 'thread' | 'comment';
    };
};

type Props = PropsFromRedux & {

    /**
     * Function to handle submitting the content.
     * Receives a FormEvent, current Markdown and current JSONContent values from the editor as optional parameters.
     */
    onSubmit: (e?: FormEvent, markdownText?: string, json?: JSONContent) => void;

    /**
     * Function to handle changes in the editors content.
     * Receives the current Markdown and JSONContent values from the editor as optional parameters.
     */
    onChange?: (markdownText: string, json?: JSONContent) => void;

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
     * Disables editing and formatting funcitonalities.
     */
    readOnly?: boolean;

    /**
     * Content to display above the editors editable area.
     */
    headerContent?: React.ReactNode | React.ReactNode[];
}

export default (props: Props) => {
    const {
        config = {},
        reduxConfig,
        onSubmit,
        onChange,
        onAttachmentChange,
        placeholder,
        readOnly,
        useCustomEmojis,
        ctrlSend,
        codeBlockOnCtrlEnter,
        headerContent,
        draft,
        locale,
    } = props;

    const editor = useEditor({
        extensions: [
            Extensions.configure({
                config,
                hardBreak: false,
                placeholder: placeholder ? {placeholder} : false,
                codeBlock: {defaultLanguage: 'css'},
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
                    ctrlSend,
                    codeBlockOnCtrlEnter,
                    additionalHandlers: config?.keyHandlers,
                },
            }),
        ],
        content: draft?.content,
        autofocus: 'end',
        onUpdate: ({editor}) => {
            // call the onChange function from the parent component (if available)
            onChange?.(htmlToMarkdown(editor.getHTML()), editor.getJSON());
        },
    }, []);

    // files currently attached to the editor
    const [attachments, setAttachments] = useState<FileInfo[]>(draft?.fileInfos || []);

    // files currently uploading
    const [uploads, setUploads] = useState<string[]>(draft?.uploadsInProgress || []);

    // percentage for the files that are uploading atm
    const [uploadsProgress, setUploadsProgress] = useState<Record<string, FileInfo>>({});
    const [error, setError] = useState<string>('');
    const containerRef = useRef<HTMLDivElement>(null);
    const fileUploadRef = useRef<FileUploadClass>(null);

    // since the attachment state is now being handled internally fire the optional `onAttachmentChange` handler
    useEffect(() => {
        onAttachmentChange?.(attachments, uploads);
    }, [onAttachmentChange, attachments, uploads]);

    if (!editor) {
        return null;
    }

    function handleSubmit(event?: React.FormEvent) {
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
        onSubmit();

        // 2. clear the editor content
        editor?.commands.clearContent(true);

        // 3. clear all attachments and related state
        setAttachments([]);
        setUploads([]);
        setUploadsProgress({});
    }

    const disableSendButton = editor.isEmpty;
    const sendButton = readOnly ? null : (
        <SendButton
            disabled={disableSendButton}
            handleSubmit={handleSubmit}
        />
    );

    const emojiPicker = reduxConfig.EnableEmojiPicker === 'true' ? <EmojiPicker editor={editor}/> : null;

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
            setError(errorMessage);
            return;
        }

        removeIdsFromUploads([clientId]);
        setError(errorMessage);
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
            postType={config?.fileUpload?.postType || 'post'}
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
        setError('');

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
        additionalControls: config?.additionalControls,
    };

    return (
        <>
            <WysiwygContainer>
                <EditorContainer ref={containerRef}>
                    {headerContent}
                    <EditorContent editor={editor}/>
                    {attachmentPreview}
                </EditorContainer>
                <Toolbar {...toolbarProps}/>
            </WysiwygContainer>
            {error && error}
        </>
    );
};
