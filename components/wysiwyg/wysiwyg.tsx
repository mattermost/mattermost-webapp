// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {sortFileInfos} from 'mattermost-redux/utils/file_utils';
import React, {useEffect, useRef, useState} from 'react';
import type {FormEvent} from 'react';
import {KeyboardShortcutCommand} from '@tiptap/core';
import {
    EditorContent,
    useEditor,
} from '@tiptap/react';
import type {JSONContent} from '@tiptap/react';

import type {NewPostDraft} from 'types/store/draft';
import FileUpload, {FileUploadClass} from 'components/file_upload';

import {ServerError} from '@mattermost/types/errors';

import {FileInfo} from '@mattermost/types/files';

import FilePreview from '../file_preview';
import {FilePreviewInfo} from '../file_preview/file_preview';

// import all custom components, extensions, etc.
import {EditorContainer, WysiwygContainer} from './components/editor';
import EmojiPicker from './components/emoji-picker';
import Toolbar from './components/toolbar';
import SendButton from './components/send-button';
import {Extensions, SuggestionConfig} from './extensions';

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
    fileUpload: {
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
        config,
        reduxConfig,
        onSubmit,
        onChange,
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
                    submitAction: onSubmit,
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

            /* eslint-disable */
            console.group('##### Output to be stored in drafts or for submission');
            console.log('##### HTML', editor.getHTML());
            console.log('##### parsed Markdown', htmlToMarkdown(editor.getHTML()));
            console.groupEnd();
            /* eslint-enable */
        },
    }, [ctrlSend, codeBlockOnCtrlEnter]);

    const [attachments, setAttchments] = useState<FileInfo[]>([]);
    const [uploadsInProgress, setUploadsInProgress] = useState<string[]>([]);
    const [uploadsInProgressPercent, setUploadsInProgressPercent] = useState<Record<string, FileInfo>>({});
    const [, setError] = useState<string>('');
    const containerRef = useRef<HTMLDivElement>(null);
    const fileUploadRef = useRef<FileUploadClass>(null);

    // focus the editor on mount
    useEffect(() => {
        editor?.commands.focus();
    }, [editor]);

    if (!editor) {
        return null;
    }

    function handleSubmit(event?: React.FormEvent) {
        event?.preventDefault();

        // We should probably only allow submitting with the value from the editor to not create a case
        // where incorrect messages are being sent to the server
        onSubmit();
        editor?.commands.clearContent(true);
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
        setUploadsInProgress(uploadsInProgress.concat(clientIds));
        editor.commands.focus();
    };

    const removeIdsFromUploads = (clientIds: string[]) => {
        let updatedUploads = uploadsInProgress;

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

        if (updatedUploads.length !== uploadsInProgress.length) {
            setUploadsInProgress(updatedUploads);
        }
    };

    const handleFileUploadComplete = (fileInfos: FileInfo[], clientIds: string[]) => {
        removeIdsFromUploads(clientIds);

        if (fileInfos.length) {
            setAttchments(sortFileInfos(attachments.concat(fileInfos), locale));
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
        setUploadsInProgressPercent({
            ...uploadsInProgressPercent,
            [filePreviewInfo.clientId]: filePreviewInfo,
        });
    };

    const fileUpload = (!config || readOnly) ? null : (
        <FileUpload
            ref={fileUploadRef}
            fileCount={attachments.length + uploadsInProgress.length}
            getTarget={getFileUploadTarget}
            onFileUploadChange={() => editor.commands.focus()}
            onUploadStart={handleUploadStart}
            onFileUpload={handleFileUploadComplete}
            onUploadError={handleUploadError}
            onUploadProgress={handleUploadProgress}
            rootId={config?.fileUpload?.rootId}
            channelId={config?.fileUpload?.channelId}
            postType={config?.fileUpload?.postType}
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
            index = uploadsInProgress.indexOf(id);

            if (index !== -1) {
                removeIdsFromUploads([id]);
            }
        } else {
            setAttchments(attachments.filter((item, itemIndex) => index !== itemIndex));
        }
    };

    let attachmentPreview = null;
    if (!readOnly && (attachments.length > 0 || uploadsInProgress.length > 0)) {
        attachmentPreview = (
            <FilePreview
                fileInfos={attachments}
                onRemove={removePreview}
                uploadsInProgress={uploadsInProgress}
                uploadsProgressPercent={uploadsInProgressPercent}
            />
        );
    }

    const toolbarProps = {
        editor,
        rightControls,
        additionalControls: config?.additionalControls,
    };

    return (
        <WysiwygContainer>
            <EditorContainer ref={containerRef}>
                {headerContent}
                <EditorContent editor={editor}/>
                {attachmentPreview}
            </EditorContainer>
            <Toolbar {...toolbarProps}/>
        </WysiwygContainer>
    );
};
