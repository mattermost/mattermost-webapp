// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useRef, useState} from 'react';

import {FormattedList, FormattedMessage, useIntl} from 'react-intl';

import {useSelector} from 'react-redux';

import {ValueType} from 'react-select';

import classNames from 'classnames';

import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import NotificationBox from 'components/notification_box';

import {PostPreviewMetadata} from '@mattermost/types/posts';
import {GlobalState} from 'types/store';

import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {General, Permissions} from 'mattermost-redux/constants';

import Constants from 'utils/constants';

import PostMessagePreview from 'components/post_view/post_message_preview';
import GenericModal from 'components/generic_modal';

import ForwardPostChannelSelect, {ChannelOption} from './forward_post_channel_select';
import ForwardPostCommentInput from './forward_post_comment_input';

import {ActionProps, OwnProps, PropsFromRedux} from './index';

import './forward_post_modal.scss';

export type Props = PropsFromRedux & OwnProps & { actions: ActionProps };

const noop = () => {};

const ForwardPostModal = ({onExited, post, actions}: Props) => {
    const {formatMessage} = useIntl();

    const [comment, setComment] = useState('');
    const [bodyHeight, setBodyHeight] = useState<number>(0);
    const [hasError, setHasError] = useState<boolean>(false);
    const [postError, setPostError] = useState<React.ReactNode>(null);
    const [selectedChannel, setSelectedChannel] = useState<ChannelOption>();

    const getChannel = makeGetChannel();

    const channel = useSelector((state: GlobalState) => getChannel(state, {id: post.channel_id}));
    const currentTeam = useSelector(getCurrentTeam);

    const bodyRef = useRef<HTMLDivElement>();

    const measuredRef = useCallback((node) => {
        if (node !== null) {
            bodyRef.current = node;
            setBodyHeight(node.getBoundingClientRect().height);
        }
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const onHeightChange = (width: number, height: number) => {
        if (bodyRef.current) {
            setBodyHeight(bodyRef.current.getBoundingClientRect().height);
        }
    };

    const selectedChannelId = selectedChannel?.details?.id || '';

    const canPostInSelectedChannel = useSelector(
        (state: GlobalState) =>
            Boolean(selectedChannelId) &&
            haveIChannelPermission(
                state,
                selectedChannel?.details?.team_id || '',
                selectedChannelId,
                Permissions.CREATE_POST,
            ),
    );
    const isPrivateConversation = channel.type !== General.OPEN_CHANNEL;
    const canForwardPost = (isPrivateConversation || canPostInSelectedChannel) && !postError;

    const onHide = useCallback(() => {
        // focusPostTextbox();
        onExited?.();
    }, [onExited]);

    const handleChannelSelect = useCallback(
        (channel: ValueType<ChannelOption>) => {
            if (Array.isArray(channel)) {
                setSelectedChannel(channel[0]);
            }
            setSelectedChannel(channel as ChannelOption);
        },
        [],
    );

    // since the original post has a click handler specified we should prevent any action here
    const preventActionOnPreview = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const messagePreviewTitle = formatMessage({
        id: 'forward_post_modal.preview.title',
        defaultMessage: 'Message preview',
    });

    const previewMetaData: PostPreviewMetadata = {
        post,
        post_id: post.id,
        team_name: currentTeam.name,
        channel_display_name: channel.display_name,
        channel_type: channel.type,
        channel_id: channel.id,
    };

    let notification;
    if (isPrivateConversation) {
        let notificationText;
        if (channel.type === General.PRIVATE_CHANNEL) {
            const channelName = `~${channel.display_name}`;
            notificationText = (
                <FormattedMessage
                    id='forward_post_modal.notification.private_channel'
                    defaultMessage='This message is from a private channel and can only be shared with <strong>{channelName}</strong>'
                    values={{
                        channelName,
                        strong: (x: React.ReactNode) => <strong>{x}</strong>,
                    }}
                />
            );
        } else {
            const allParticipants = channel.display_name.split(', ');
            const participants = allParticipants.map((participant) => <strong key={participant}>{participant}</strong>);

            notificationText = (
                <FormattedMessage
                    id='forward_post_modal.notification.dm_or_gm'
                    defaultMessage='This message is from a private conversation and can only be shared with {participants}'
                    values={{
                        participants: <FormattedList value={participants}/>,
                        strong: (x: React.ReactNode) => <strong>{x}</strong>,
                    }}
                />
            );
        }

        notification = (
            <NotificationBox
                variant={'info'}
                text={notificationText}
            />
        );
    }

    const handlePostError = (error: React.ReactNode) => {
        setPostError(error);
        setHasError(true);
        setTimeout(() => setHasError(false), Constants.ANIMATION_TIMEOUT);
    };

    const handleSubmit = useCallback(async () => {
        if (postError) {
            return;
        }

        let result = await actions.forwardPost(
            post,
            isPrivateConversation ? channel.id : selectedChannelId,
            comment,
        );
        if (result.error) {
            handlePostError(result.error);
            return;
        }

        if (
            selectedChannel?.details.type === Constants.MENTION_MORE_CHANNELS &&
            selectedChannel?.details.type === Constants.OPEN_CHANNEL
        ) {
            result = await actions.joinChannelById(selectedChannelId);

            if (result.error) {
                handlePostError(result.error);
                return;
            }
        }

        // only switch channels when we are not in a private conversation
        if (!isPrivateConversation && selectedChannel) {
            result = await actions.switchToChannel(selectedChannel.details);

            if (result.error) {
                handlePostError(result.error);
                return;
            }
        }

        onHide();
    }, [
        postError,
        actions,
        post,
        isPrivateConversation,
        channel.id,
        selectedChannelId,
        comment,
        selectedChannel,
        onHide,
    ]);

    const postPreviewFooterMessage = formatMessage({
        id: 'forward_post_modal.preview.footer_message',
        defaultMessage: 'Originally posted in ~{channelName}',
    },
    {
        channel: channel.display_name,
    });

    return (
        <GenericModal
            className='a11y__modal forward-post'
            show={true}
            enforceFocus={false}
            autoCloseOnConfirmButton={false}
            useCompassDesign={true}
            modalHeaderText={formatMessage({
                id: 'forward_post_modal.title',
                defaultMessage: 'Forward message',
            })}
            confirmButtonText={formatMessage({
                id: 'forward_post_modal.button.forward',
                defaultMessage: 'Forward',
            })}
            cancelButtonText={formatMessage({
                id: 'forward_post_modal.button.cancel',
                defaultMessage: 'Cancel',
            })}
            isConfirmDisabled={!canForwardPost}
            handleConfirm={handleSubmit}
            handleEnterKeyPress={handleSubmit}
            handleCancel={onHide}
            onExited={onHide}
        >
            <div
                className={'forward-post__body'}
                ref={measuredRef}
            >
                {isPrivateConversation ? (
                    notification
                ) : (
                    <ForwardPostChannelSelect
                        onSelect={handleChannelSelect}
                        value={selectedChannel}
                        currentBodyHeight={bodyHeight}
                    />
                )}
                <ForwardPostCommentInput
                    canForwardPost={canForwardPost}
                    channelId={selectedChannelId}
                    comment={comment}
                    onChange={setComment}
                    onError={handlePostError}
                    onSubmit={handleSubmit}
                    onHeightChange={onHeightChange}
                />
                <div className={'forward-post__post-preview'}>
                    <span className={'forward-post__post-preview--title'}>
                        {messagePreviewTitle}
                    </span>
                    <div
                        className='post forward-post__post-preview--override'
                        onClick={preventActionOnPreview}
                    >
                        <PostMessagePreview
                            metadata={previewMetaData}
                            previewPost={previewMetaData.post}
                            handleFileDropdownOpened={noop}
                            preventClickAction={true}
                            previewFooterMessage={postPreviewFooterMessage}
                        />
                    </div>
                    {postError && (
                        <label
                            className={classNames('post-error', {
                                'animation--highlight': hasError,
                            })}
                        >
                            {postError}
                        </label>
                    )}
                </div>
            </div>
        </GenericModal>
    );
};

export default ForwardPostModal;
