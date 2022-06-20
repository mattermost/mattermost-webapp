// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useRef, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {Modal} from 'react-bootstrap';
import {useSelector} from 'react-redux';
import {ValueType} from 'react-select';

import {Group} from '@mattermost/types/groups';

import {FileInfo} from '@mattermost/types/files';

import {ActionResult} from 'mattermost-redux/types/actions';

import {Team} from '@mattermost/types/teams';
import {Channel} from '@mattermost/types/channels';
import {ClientConfig} from '@mattermost/types/config';
import {Post, PostMetadata, PostPreviewMetadata} from '@mattermost/types/posts';

import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {General, Permissions} from 'mattermost-redux/constants';

import {GlobalState} from 'types/store';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils';
import {applyMarkdown, ApplyMarkdownOptions} from 'utils/markdown/apply_markdown';
import {containsAtChannel, groupsMentionedInText} from 'utils/post_utils';
import {getSiteURL} from 'utils/url';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import Notification from 'components/notification/notification';
import PostMessagePreview from 'components/post_view/post_message_preview';
import Textbox, {TextboxClass, TextboxElement} from 'components/textbox';

import ForwardPostChannelSelect, {ChannelOption} from './forward_post_channel_select';

import './forward_post_modal.scss';

const {KeyCodes} = Constants;

export type StateProps = {

    // the current client config
    config: Partial<ClientConfig>;

    // the current channel
    currentChannel: Channel;

    // the current team
    currentTeam: Team;

    // id for the current user
    currentUserId: string;

    // determines if the connection has been bad before
    badConnection: boolean;

    // permalink relative to the server root URL
    relativePermaLink: string;

    // use groupd mentions defined for/by LDAP groups
    useLDAPGroupMentions: boolean;

    // use custom groupd mentions
    useCustomGroupMentions: boolean;

    groupsWithAllowReference: Map<string, Group> | null;
};

export type ActionProps = {

    // hooks called before a message is sent to the server
    runMessageWillBePostedHooks: (originalPost: Post) => ActionResult;

    // function called for posting the new message
    onSubmitPost: (post: Post, fileInfos: FileInfo[]) => void;

    // join the selected channel when necessary
    joinChannelById: (channelId: string) => Promise<ActionResult>;

    // switch to the selected channel
    switchToChannel: (channel: Channel) => Promise<ActionResult>;
}

export type OwnProps = {

    // The function called immediately after the modal is hidden
    onExited?: () => void;

    // the post that is going to be forwarded
    post: Post;
};

export type Props = StateProps & OwnProps & {actions: ActionProps };

const ForwardPostModal = (props: Props) => {
    const {
        onExited,
        post,
        config,
        currentChannel,
        currentTeam,
        currentUserId,
        badConnection,
        relativePermaLink,
        useLDAPGroupMentions,
        useCustomGroupMentions,
        groupsWithAllowReference,
        actions,
    } = props;

    const {formatMessage} = useIntl();

    const [comment, setComment] = useState('');
    const [postError, setPostError] = useState<React.ReactNode>(null);
    const [selectedChannel, setSelectedChannel] = useState<ChannelOption>();

    const textboxRef = useRef<TextboxClass>(null);

    const selectedChannelId = selectedChannel?.details?.id || '';

    const canPostInSelectedChannel = useSelector((state: GlobalState) => haveIChannelPermission(state, selectedChannel?.details?.team_id || '', selectedChannelId, Permissions.CREATE_POST));
    const useChannelMentions = useSelector((state: GlobalState) => haveIChannelPermission(state, selectedChannel?.details?.team_id || '', selectedChannelId, Permissions.USE_CHANNEL_MENTIONS));

    const maxPostSize = parseInt(config.MaxPostSize || '', 10) || Constants.DEFAULT_CHARACTER_LIMIT;
    const enableEmojiPicker = config.EnableEmojiPicker === 'true';
    const isPrivateConversation = currentChannel.type !== General.OPEN_CHANNEL;
    const canForwardPost = !isPrivateConversation && canPostInSelectedChannel;
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

    const handlePostError = (postError: React.ReactNode) => setPostError(postError);

    // we don't care in this textbox about it
    const handleHeightChange = Utils.noop;

    // we don't care in this textbox about it
    const handleMouseUpKeyUp = Utils.noop;

    // this does not make any sense in this modal, so we add noop here
    const emitTypingEvent = Utils.noop;

    // we do not allow sending the forwarding when hitting enter
    const postMsgKeyPress = Utils.noop;

    // we do not care about the blur event
    const handleBlur = Utils.noop;

    // since the original post has a click handler specified we should prevent any action here
    const preventActionOnPreview = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

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

    let notification;
    if (isPrivateConversation) {
        let notificationText;
        if (currentChannel.type === General.PRIVATE_CHANNEL) {
            const channel = `~${currentChannel.display_name}`;
            notificationText = (
                <FormattedMarkdownMessage
                    id={'forward_post_modal.notification.private_channel'}
                    defaultMessage={'This message is from a private channel and can only be shared within **{channel}**'}
                    values={{
                        channel,
                    }}
                />
            );
        } else {
            const allParticipants = currentChannel.display_name.split(', ');
            const participants = allParticipants.length === 1 ? allParticipants[0] : `${allParticipants.slice(0, -1).join(', ')}** and **${allParticipants[allParticipants.length - 1]}`;

            notificationText = (
                <FormattedMarkdownMessage
                    id={'forward_post_modal.notification.dm_or_gm'}
                    defaultMessage={'This message is from a private conversation and can only be shared within **{participants}**'}
                    values={{
                        participants,
                    }}
                />
            );
        }

        notification = (
            <Notification
                variant={'info'}
                text={notificationText}
            />
        );
    }

    const handlePostForwarding = async () => {
        let newPost = {} as Post;

        newPost.channel_id = isPrivateConversation ? currentChannel.id : selectedChannelId;

        const time = Utils.getTimestamp();
        const userId = currentUserId;

        newPost.message = comment ? `${comment}\n${permaLink}` : permaLink;
        newPost.pending_post_id = `${userId}:${time}`;
        newPost.user_id = userId;
        newPost.create_at = time;
        newPost.metadata = {} as PostMetadata;
        newPost.props = {};

        if (!useChannelMentions && containsAtChannel(newPost.message, {checkAllMentions: true})) {
            newPost.props.mentionHighlightDisabled = true;
        }

        if (!useLDAPGroupMentions && !useCustomGroupMentions && groupsMentionedInText(newPost.message, groupsWithAllowReference)) {
            newPost.props.disable_group_highlight = true;
        }

        const hookResult = await actions.runMessageWillBePostedHooks(newPost);

        if (hookResult.error) {
            setPostError(hookResult.error);

            return hookResult;
        }

        newPost = hookResult.data;

        actions.onSubmitPost(newPost, [] as FileInfo[]);

        return {data: true};
    };

    const handleSubmit = () => {
        handlePostForwarding().then((res) => {
            if (res.data === true) {
                if (selectedChannel?.details.type === Constants.MENTION_MORE_CHANNELS && selectedChannel?.details.type === Constants.OPEN_CHANNEL) {
                    return actions.joinChannelById(selectedChannelId);
                }
            }
            return {data: false};
        }).then(() => {
            if (selectedChannel) {
                return actions.switchToChannel(selectedChannel?.details);
            }
            return {data: false};
        }).then((res: ActionResult) => {
            if (res.data === true) {
                onHide();
            }
        });
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
                {isPrivateConversation ? notification : (
                    <ForwardPostChannelSelect
                        onSelect={handleChannelSelect}
                        value={selectedChannel}
                    />
                )}
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
                    useChannelMentions={false}
                    supportsCommands={false}
                    suggestionListPosition='bottom'
                />
                <div>
                    <span className={'forward-post__post-preview--title'}>{messagePreviewTitle}</span>
                    <div
                        className='post forward-post__post-preview--override'
                        onClick={preventActionOnPreview}
                    >
                        <PostMessagePreview
                            metadata={previewMetaData}
                            previewPost={previewMetaData.post}
                            handleFileDropdownOpened={Utils.noop}
                            isPostForwardPreview={true}
                        />
                    </div>
                    {postError && <label className={classNames('post-error', {'animation--highlight': postError})}>{postError}</label>}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button
                    onClick={onHide}
                    className={'btn btn-secondary'}
                    id={'forward-post_cancel'}
                >
                    <FormattedMessage
                        id='forward_post_modal.button.cancel'
                        defaultMessage='Cancel'
                    />
                </button>
                <button
                    disabled={!canForwardPost}
                    onClick={handleSubmit}
                    className={'btn btn-primary'}
                    id={'forward-post_forward'}
                >
                    <FormattedMessage
                        id='forward_post_modal.button.forward'
                        defaultMessage='Forward'
                    />
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default ForwardPostModal;
