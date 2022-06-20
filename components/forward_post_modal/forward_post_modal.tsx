// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {ValueType} from 'react-select';

import {Team} from '@mattermost/types/teams';

import {Channel} from '@mattermost/types/channels';

import {ClientConfig} from '@mattermost/types/config';

import {haveIChannelPermission, haveICurrentChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';

import {GlobalState} from 'types/store';

import {Post, PostPreviewMetadata} from '@mattermost/types/posts';

import Constants from 'utils/constants';
import {getPermalinkURL} from 'utils/utils';
import * as Utils from 'utils/utils';

import './forward_post_modal.scss';
import {connectionErrorCount} from '../../selectors/views/system';
import {applyMarkdown, ApplyMarkdownOptions} from '../../utils/markdown/apply_markdown';
import {getSiteURL} from '../../utils/url';
import PostMessagePreview from '../post_view/post_message_preview';
import Textbox, {TextboxClass, TextboxElement} from '../textbox';

import ForwardPostChannelSelect, {ChannelOption} from './forward_post_channel_select';

const {KeyCodes} = Constants;

export type StateProps = {

    // the current client config
    config: Partial<ClientConfig>;

    // the current channel
    currentChannel: Channel;

    // the current team
    currentTeam: Team;
};

export type ActionProps = {
    actions: Record<string, unknown>;
}

export type Props = StateProps & ActionProps & {

    // The function called immediately after the modal is hidden
    onExited?: () => void;

    // the post that is going to be forwarded
    post: Post;
}

const ForwardPostModal = ({onExited, post, config, currentChannel, currentTeam}: Props) => {
    const {formatMessage} = useIntl();

    const [comment, setComment] = useState('');
    const [caretPosition, setCaretPosition] = useState(0);
    const [renderScrollbar, setRenderScrollbar] = useState(false);
    const [postError, setPostError] = useState<React.ReactNode>(null);
    const [selectedChannel, setSelectedChannel] = useState<ChannelOption>();

    const textboxRef = useRef<TextboxClass>(null);
    const scrollbarWidth = useRef<number>();

    const selectedChannelId = selectedChannel?.details?.id || '';

    const badConnection = useSelector((state: GlobalState) => connectionErrorCount(state)) > 1;
    const canPostInSelectedChannel = useSelector((state: GlobalState) => haveIChannelPermission(state, selectedChannel?.details?.team_id || '', selectedChannelId, Permissions.CREATE_POST));
    const useChannelMentions = useSelector((state: GlobalState) => haveICurrentChannelPermission(state, Permissions.USE_CHANNEL_MENTIONS));
    const relativePermaLink = useSelector((state: GlobalState) => getPermalinkURL(state, currentTeam.id, post.id));

    const maxPostSize = parseInt(config.MaxPostSize || '', 10) || Constants.DEFAULT_CHARACTER_LIMIT;
    const enableEmojiPicker = config.EnableEmojiPicker === 'true';
    const canPost = selectedChannel && canPostInSelectedChannel;
    const {current: permaLink} = useRef<string>(`${getSiteURL()}${relativePermaLink}`);

    const onHide = () => {
        // focusPostTextbox();
        onExited?.();
    };

    const handleChannelSelect = (channel: ValueType<ChannelOption>) => {
        if (Array.isArray(channel)) {
            setSelectedChannel(channel[0]);
        }
        setSelectedChannel(channel as ChannelOption);
    };

    const handleChange = (e: React.ChangeEvent<TextboxElement>) => {
        const message = e.target.value;

        setComment(message);
    };

    const setCommentAsync = async (message: string) => {
        await setComment(message);
    };

    const applyMarkdownMode = (params: ApplyMarkdownOptions) => {
        const res = applyMarkdown(params);

        setCommentAsync(res.message).then(() => {
            const textbox = textboxRef.current?.getInputBox();
            Utils.setSelectionRange(textbox, res.selectionStart, res.selectionEnd);
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<TextboxElement>) => {
        const ctrlKeyCombo = Utils.cmdOrCtrlPressed(e) && !e.altKey && !e.shiftKey;
        const ctrlAltCombo = Utils.cmdOrCtrlPressed(e, true) && e.altKey;
        const ctrlShiftCombo = Utils.cmdOrCtrlPressed(e, true) && e.shiftKey;
        const markdownLinkKey = Utils.isKeyPressed(e, KeyCodes.K);

        const {
            selectionStart,
            selectionEnd,
            value,
        } = e.target as TextboxElement;

        // listen for line break key combo and insert new line character
        if (Utils.isUnhandledLineBreakKeyCombo(e)) {
            setComment(Utils.insertLineBreakFromKeyEvent(e));
        } else if (ctrlAltCombo && markdownLinkKey) {
            applyMarkdownMode({
                markdownMode: 'link',
                selectionStart,
                selectionEnd,
                message: value,
            });
        } else if (ctrlKeyCombo && Utils.isKeyPressed(e, KeyCodes.B)) {
            applyMarkdownMode({
                markdownMode: 'bold',
                selectionStart,
                selectionEnd,
                message: value,
            });
        } else if (ctrlKeyCombo && Utils.isKeyPressed(e, KeyCodes.I)) {
            applyMarkdownMode({
                markdownMode: 'italic',
                selectionStart,
                selectionEnd,
                message: value,
            });
        } else if (ctrlShiftCombo && Utils.isKeyPressed(e, KeyCodes.X)) {
            applyMarkdownMode({
                markdownMode: 'strike',
                selectionStart,
                selectionEnd,
                message: value,
            });
        } else if (ctrlShiftCombo && Utils.isKeyPressed(e, KeyCodes.E)) {
            e.stopPropagation();
            e.preventDefault();
        }
    };

    const handleSelect = (e: React.SyntheticEvent<Element, Event>) => {
        Utils.adjustSelection(textboxRef.current?.getInputBox(), e as React.KeyboardEvent<HTMLInputElement>);
    };

    const handleMouseUpKeyUp = (e: React.MouseEvent | React.KeyboardEvent) => setCaretPosition((e.target as HTMLInputElement).selectionStart || 0);

    const handleHeightChange = (height: number, maxHeight: number) => {
        setRenderScrollbar(height > maxHeight);

        window.requestAnimationFrame(() => {
            if (textboxRef.current) {
                scrollbarWidth.current = Utils.scrollbarWidth(textboxRef.current.getInputBox());
            }
        });
    };

    const handlePostError = (postError: React.ReactNode) => setPostError(postError);

    // this does not make any sense in this modal, so we add noop here
    const emitTypingEvent = Utils.noop;

    // we do not allow sending the forwarding when hitting enter
    const postMsgKeyPress = Utils.noop;

    // we do not care about the blur event
    const handleBlur = Utils.noop;

    const createMessage = formatMessage({id: 'forward_post_modal.comment.placeholder', defaultMessage: 'Add a comment (optional)'});
    const messagePreviewTitle = formatMessage({id: 'forward_post_modal.preview.title', defaultMessage: 'Message Preview'});
    const previewMetaData: PostPreviewMetadata = {
        post,
        post_id: post.id,
        team_name: currentTeam.name,
        channel_display_name: currentChannel.display_name,
        channel_type: currentChannel.type,
        channel_id: currentChannel.id,
    };

    return (
        <Modal
            dialogClassName='a11y__modal forward-post'
            show={true}
            onHide={onHide}
            enforceFocus={false}
            restoreFocus={false}
            role='dialog'
            aria-labelledby='forwardPostModalLabel'
            aria-describedby='forwardPostModalHint'
            animation={true}
        >
            <Modal.Header
                id='forwardPostModalLabel'
                closeButton={true}
            >
                <Modal.Title
                    componentClass='h1'
                    id='forwardPostModalTitle'
                >
                    <FormattedMessage
                        id='forward_post_modal.title'
                        defaultMessage='Forward Message'
                    />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ForwardPostChannelSelect
                    onSelect={handleChannelSelect}
                    value={selectedChannel}
                />
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
                    value={comment}
                    onBlur={handleBlur}
                    emojiEnabled={enableEmojiPicker}
                    createMessage={createMessage}
                    channelId={selectedChannelId}
                    id={'forward_post_textbox'}
                    ref={textboxRef}
                    disabled={false}
                    characterLimit={maxPostSize}
                    preview={false}
                    badConnection={badConnection}
                    listenForMentionKeyClick={true}
                    useChannelMentions={useChannelMentions}
                />
                <div>
                    <span className={'forward-post__post-preview--title'}>{messagePreviewTitle}</span>
                    <div className='post forward-post__post-preview--override'>
                        <PostMessagePreview
                            metadata={previewMetaData}
                            previewPost={previewMetaData.post}
                            handleFileDropdownOpened={Utils.noop}
                            isPostForwardPreview={true}
                        />
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ForwardPostModal;
