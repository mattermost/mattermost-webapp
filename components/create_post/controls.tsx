// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useRef} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'types/store';

import LocalizedIcon from 'components/localized_icon';
import {t} from 'utils/i18n';
import FileUpload from 'components/file_upload';

import {haveICurrentChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';
import {showPreviewOnCreateComment, showPreviewOnCreatePost} from 'selectors/views/textbox';
import {FileInfo} from 'mattermost-redux/types/files';
import {FileUpload as FileUploadClass} from 'components/file_upload/file_upload';
import type {ServerError} from 'mattermost-redux/types/errors';
import type {FilePreviewInfo} from 'components/file_preview/file_preview';

import EmojiControl from './emoji_control';
import {InputTextboxRef} from './input_textbox';

export type FileUploadProps = {
    fileCount: number;
    fileUploadRef: React.RefObject<FileUploadClass>;
    handleFileUploadChange: () => void;
    handleUploadStart: (clientIds: string[], channelId: string) => void;
    handleFileUploadComplete: (fileInfos: FileInfo[], clientIds: string[], channelId: string, rootId?: string) => void;
    handleUploadError: (err: string | ServerError | null, clientId: string, channelId: string, rootId?: string) => void;
    handleUploadProgress: (filePreviewInfo: FilePreviewInfo) => void;
    getFileUploadTarget: () => InputTextboxRef | null;
}

type Props = {
    channelId: string;
    rootId?: string;
    message: string;
    caretPosition: number;
    isThreadView?: boolean;
    fileInfos: FileInfo[];
    fileUploadProps: FileUploadProps;
    setMessageAndCaretPosition: (message: string, caretPosition: number) => void;
    handleSubmit: (message: string) => void;
    focusTextbox: () => void;
}

const Controls = ({
    channelId,
    rootId,
    message,
    caretPosition,
    isThreadView = false,
    fileInfos,
    setMessageAndCaretPosition,
    handleSubmit,
    fileUploadProps,
    focusTextbox,
}: Props) => {
    const intl = useIntl();

    let postType = 'post';
    if (rootId) {
        postType = isThreadView ? 'thread' : 'comment';
    }
    const shouldEnableSendButton = message.trim().length || fileInfos.length;
    const sendButtonClass = 'send-button theme' + (shouldEnableSendButton ? '' : ' disabled');
    const readOnlyChannel = useSelector<GlobalState, boolean>((state) => !haveICurrentChannelPermission(state, Permissions.CREATE_POST));
    const enableEmojiPicker = useSelector<GlobalState, boolean>((state) => getConfig(state).EnableEmojiPicker === 'true');
    const shouldShowPreview = useSelector<GlobalState, boolean>((state) => (rootId ? showPreviewOnCreateComment(state) : showPreviewOnCreatePost(state)));
    const controlsRef = useRef<HTMLSpanElement>(null);

    const getCreateControls = useCallback(() => {
        return controlsRef.current;
    }, []);

    const doHandleSubmit = useCallback(() => {
        handleSubmit(message);
    }, [message]);

    return (
        <span
            ref={controlsRef}
            className='post-body__actions'
        >
            {!readOnlyChannel && !shouldShowPreview && (
                <FileUpload
                    fileCount={fileUploadProps.fileCount}
                    getTarget={fileUploadProps.getFileUploadTarget}
                    onFileUpload={fileUploadProps.handleFileUploadComplete}
                    onFileUploadChange={fileUploadProps.handleFileUploadChange}
                    onUploadError={fileUploadProps.handleUploadError}
                    onUploadStart={fileUploadProps.handleUploadStart}
                    onUploadProgress={fileUploadProps.handleUploadProgress}
                    ref={fileUploadProps.fileUploadRef}
                    postType={postType}
                    channelId={channelId}
                    rootId={rootId}
                />
            )}
            {enableEmojiPicker && !readOnlyChannel && !shouldShowPreview && (
                <EmojiControl
                    caretPosition={caretPosition}
                    getCreateControls={getCreateControls}
                    message={message}
                    setMessageAndCaretPosition={setMessageAndCaretPosition}
                    focusTextbox={focusTextbox}
                />
            )}
            {!rootId && (
                <a
                    role='button'
                    tabIndex={0}
                    aria-label={intl.formatMessage({
                        id: 'create_post.send_message',
                        defaultMessage: 'Send a message',
                    })}
                    className={sendButtonClass}
                    onClick={doHandleSubmit}
                >
                    <LocalizedIcon
                        className='fa fa-paper-plane'
                        title={{
                            id: t('create_post.icon'),
                            defaultMessage: 'Create a post',
                        }}
                    />
                </a>
            )}
        </span>
    );
};

export default Controls;
