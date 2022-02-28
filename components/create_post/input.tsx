import React, { useCallback, useRef, useState } from "react";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Utils from 'utils/utils.jsx';
import {Constants, Preferences, StoragePrefixes, UserStatuses} from 'utils/constants';
import { get, getInt } from "mattermost-redux/selectors/entities/preferences";
import { GlobalState } from "types/store";
import Textbox, { TextboxClass } from 'components/textbox';
import { getConfig } from "mattermost-redux/selectors/entities/general";
import {canUploadFiles as checkUploadFiles} from 'utils/file_utils';
import RhsSuggestionList from "components/suggestion/rhs_suggestion_list";
import { haveICurrentChannelPermission } from "mattermost-redux/selectors/entities/roles";
import {Permissions, Posts, Preferences as PreferencesRedux} from 'mattermost-redux/constants';
import { ClientConfig } from "mattermost-redux/types/config";
import { showPreviewOnCreatePost } from "selectors/views/textbox";
import { connectionErrorCount } from "selectors/views/system";
import { useIntl } from "react-intl";

import {FileUpload as FileUploadClass} from 'components/file_upload/file_upload'

import { FilePreviewInfo } from "components/file_preview/file_preview";
import { FileInfo } from "mattermost-redux/types/files";
import { ServerError } from "mattermost-redux/types/errors";
import MsgTyping from 'components/msg_typing';
import TextboxLinks from 'components/textbox/textbox_links';
import { setShowPreviewOnCreateComment, setShowPreviewOnCreatePost } from "actions/views/textbox";
import FilePreview from 'components/file_preview';
import {OnboardingTourSteps, SendMessageTour, TutorialTourName} from 'components/onboarding_tour';
import { getCurrentUserId } from "mattermost-redux/selectors/entities/common";
import Controls from "./controls";

import type {FileUploadProps} from './controls'

type Props = {
    message: string;
    rootId?: string;
    isThreadView?: boolean;
    channelId: string;
    caretPosition: number;

    postError?: React.ReactNode,
    serverError: (ServerError & {submittedMessage?: string}) | null;
    fileInfos: FileInfo[];
    uploadsInProgress: string[];
    uploadsProgressPercent: {[clientId: string]: FilePreviewInfo};
    handleSubmit: () => void;
    handleChange: () => void;
    handleMsgKeyPress: () => void;
    handleKeyDown: () => void;
    handleSelect: () => void;
    handleMouseUpKeyUp: () => void;
    emitTypingEvent: () => void;
    handlePostError: () => void;
    handleBlur: () => void;
    removePreview: () => void;
    setShowPreview: () => void;
    prefillMessage: () => void;
    fileUploadProps: FileUploadProps,
    setMessageAndCaretPosition: (message: string, caretPosition:number) => void;

    onHeightChange?: (height: number, maxHeight: number) => void;
    textboxRef: React.RefObject<TextboxClass>;
}
const Input = ({
    caretPosition,
    message,
    rootId,
    isThreadView,
    channelId,
    postError,
    serverError,
    fileInfos = [],
    uploadsInProgress = [],
    uploadsProgressPercent = {},
    handleSubmit,
    handleChange,
    handleMsgKeyPress,
    handleKeyDown,
    handleSelect,
    handleMouseUpKeyUp,
    emitTypingEvent,
    handleBlur,
    handlePostError,
    removePreview,
    prefillMessage,
    setMessageAndCaretPosition,
    onHeightChange,
    fileUploadProps,
    textboxRef,
}: Props) => {
    const intl = useIntl();
    const [renderScrollbar, setRenderScrollbar] = useState(false);
    const [scrollbarWidth, setScrollbarWidht] = useState(0);
    const fullWidthTextBox = useSelector<GlobalState, boolean>((state) => {
        return get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.CHANNEL_DISPLAY_MODE, Preferences.CHANNEL_DISPLAY_MODE_DEFAULT) === Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN
    })
    const config = useSelector<GlobalState, Partial<ClientConfig>>((state) => {
        return getConfig(state)
    })
    const showSendTutorialTip = useSelector<GlobalState, boolean>((state) => {
        const userId = getCurrentUserId(state);
        const enableTutorial = getConfig(state).EnableTutorial === 'true';
        const tutorialStep = getInt(state, TutorialTourName.ONBOARDING_TUTORIAL_STEP, userId, 0);
        return  enableTutorial && tutorialStep === OnboardingTourSteps.SEND_MESSAGE
    });
    const enableEmojiPicker = config.EnableEmojiPicker === 'true';
    const canUploadFiles = checkUploadFiles(config);
    const canPost = useSelector<GlobalState, boolean>((state) => haveICurrentChannelPermission(state, Permissions.CREATE_POST));
    const useChannelMentions = useSelector<GlobalState, boolean>((state) => haveICurrentChannelPermission(state, Permissions.USE_CHANNEL_MENTIONS));
    const readOnlyChannel = !canPost;
    
    const maxPostSize = parseInt(config.MaxPostSize || '', 10) || Constants.DEFAULT_CHARACTER_LIMIT;
    const shouldShowPreview = useSelector<GlobalState, boolean>((state) => showPreviewOnCreatePost(state))
    const badConnection = useSelector<GlobalState, boolean>((state) => connectionErrorCount(state) > 1)
    const markdownPreviewFeatureIsEnabled = useSelector<GlobalState, boolean>((state) => Utils.isFeatureEnabled(Constants.PRE_RELEASE_FEATURES.MARKDOWN_PREVIEW, state))


    const attachmentsDisabled = canUploadFiles ? '' : ' post-create--attachment-disabled'
    const scrollbarClass = renderScrollbar ? 'scroll' : '';
    const centerClass = fullWidthTextBox ? '' : 'center';
    const formId = rootId ? 'create_comment' : 'create_post';
    const formClass = rootId ? undefined:centerClass;
    const divClass = rootId ? `post-create a11y__region${scrollbarClass}` : 'post-create' + attachmentsDisabled + scrollbarClass ;
    const div2Class = 'post-create-body' + (rootId ? ' comment-create-body': '');
    const dataOrder = rootId ? '4' : '2';
    const suggestionList = rootId ? RhsSuggestionList : undefined;
    const divStyle = useMemo(() => {
        return renderScrollbar && scrollbarWidth ? {'--detected-scrollbar-width': `${scrollbarWidth}px`} as any : undefined
    }, [renderScrollbar && scrollbarWidth])
    const textBoxId = rootId ? 'reply_textbox' : 'post_textbox'
    
    const postFooterClassName = 'post-create-footer' + (!rootId && postError ? 'has-error': '')

    const dispatch = useDispatch()
    const setShowPreview = dispatch(rootId ? setShowPreviewOnCreateComment : setShowPreviewOnCreatePost)

    let createMessage;
        if (readOnlyChannel) {
            createMessage = intl.formatMessage({
                    id: 'create_post.read_only', 
                    defaultMessage: 'This channel is read-only. Only members with permission can post here.',
            });
        } else if (rootId) {
            createMessage = intl.formatMessage({
                id: 'create_comment.addComment',
                defaultMessage: 'Reply to this thread...',
            });
        } else {
            createMessage = intl.formatMessage(
                {id: 'create_post.write', defaultMessage: 'Write to {channelDisplayName}'},
                {channelDisplayName: currentChannel.display_name},
            );
        }

    const ariaLabel = rootId ?
        Utils.localizeMessage('accessibility.sections.rhsFooter', 'reply input region'):
        Utils.localizeMessage('accessibility.sections.centerFooter', 'message input complimentary region');

    const handleHeightChange = useCallback((height: number, maxHeight: number) => {
        setRenderScrollbar(height > maxHeight);
        window.requestAnimationFrame(() => {
            if (textboxRef.current) {
                setScrollbarWidht(Utils.scrollbarWidth(textboxRef.current.getInputBox()))
            }
        });
        if (onHeightChange) {
            onHeightChange(height, maxHeight);
        }
    }, [])

    

    return (
        <form
            id={formId}
            className={formClass}
            onSubmit={handleSubmit}
        >
            <div
                className={divClass}
                style={divStyle}
            >
                <div
                    id={rootId} 
                    className={div2Class}
                >
                    <div
                        role='application'
                        id='centerChannelFooter'
                        aria-label={ariaLabel}
                        tabIndex={-1}
                        className='post-body__cell a11y__region'
                        data-a11y-sort-order={dataOrder}
                    >
                        <Textbox
                            onChange={handleChange}
                            onKeyPress={handleMsgKeyPress}
                            onKeyDown={handleKeyDown}
                            onSelect={handleSelect}
                            onMouseUp={handleMouseUpKeyUp}
                            onKeyUp={handleMouseUpKeyUp}
                            onComposition={emitTypingEvent}
                            onHeightChange={handleHeightChange}
                            handlePostError={handlePostError}
                            value={readOnlyChannel ? '' : message}
                            onBlur={handleBlur}
                            emojiEnabled={enableEmojiPicker}
                            createMessage={createMessage}
                            channelId={channelId}
                            id={textBoxId}
                            ref={textboxRef}
                            disabled={readOnlyChannel}
                            characterLimit={maxPostSize}
                            preview={shouldShowPreview}
                            badConnection={badConnection}
                            listenForMentionKeyClick={true}
                            useChannelMentions={useChannelMentions}
                            isRHS={Boolean(rootId)}
                            suggestionList={suggestionList}
                        />
                        <Controls 
                            caretPosition={caretPosition}
                            channelId={channelId}
                            fileInfos={fileInfos}
                            fileUploadProps={fileUploadProps}
                            handleSubmit={handleSubmit}
                            message={message}
                            setMessageAndCaretPosition={setMessageAndCaretPosition}
                            isThreadView={isThreadView}
                         />
                    </div>
                    {!rootId && showSendTutorialTip && (
                        <SendMessageTour
                            prefillMessage={prefillMessage}
                        />
                    )}
                </div>
                <div
                    id='postCreateFooter'
                    role='form'
                    className={postFooterClassName}
                >
                    <div className='d-flex justify-content-between'>
                        <MsgTyping
                            channelId={channelId}
                            postId=''
                        />
                        <TextboxLinks
                            isMarkdownPreviewEnabled={canPost && markdownPreviewFeatureIsEnabled}
                            hasExceededCharacterLimit={readOnlyChannel ? false : message.length > maxPostSize}
                            showPreview={shouldShowPreview}
                            updatePreview={setShowPreview}
                            hasText={readOnlyChannel ? false : message.length > 0}
                        />
                    </div>
                    <div>
                        {postError}
                        {!readOnlyChannel && (fileInfos.length || uploadsInProgress.length) && (
                            <FilePreview
                                fileInfos={fileInfos}
                                onRemove={removePreview}
                                uploadsInProgress={uploadsInProgress}
                                uploadsProgressPercent={uploadsProgressPercent}
                            />
                        )}
                        {serverError}
                    </div>
                </div>
            </div>
        </form>
    );
}

export default Input;
