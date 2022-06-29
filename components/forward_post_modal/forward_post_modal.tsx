// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {ValueType} from 'react-select';
import classNames from 'classnames';

import NotificationBox from 'components/notification_box';

import {PostPreviewMetadata} from '@mattermost/types/posts';
import {GlobalState} from 'types/store';

import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {General, Permissions} from 'mattermost-redux/constants';

import Constants from 'utils/constants';

import PostMessagePreview from 'components/post_view/post_message_preview';
import GenericModal from 'components/generic_modal';

import ForwardPostChannelSelect, {
    ChannelOption,
} from './forward_post_channel_select';
import ForwardPostCommentInput from './forward_post_comment_input';
import {ForwardPostContext} from './forward_post_context';

import {ActionProps, OwnProps, PropsFromRedux} from './index';

import './forward_post_modal.scss';

export type Props = PropsFromRedux & OwnProps & { actions: ActionProps };

const noop = () => {};

const ForwardPostModal = ({onExited, post, currentChannel, currentTeam, actions}: Props) => {
    const {formatMessage} = useIntl();

    const [comment, setComment] = useState('');
    const [postError, setPostError] = useState<React.ReactNode>(null);
    const [selectedChannel, setSelectedChannel] = useState<ChannelOption>();

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
    const isPrivateConversation = currentChannel.type !== General.OPEN_CHANNEL;
    const canForwardPost = isPrivateConversation || canPostInSelectedChannel;

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
        defaultMessage: 'Message Preview',
    });

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
                <FormattedMessage
                    id='forward_post_modal.notification.private_channel'
                    defaultMessage='This message is from a private channel and can only be shared with <strong>{channel}</strong>'
                    values={{
                        channel,
                        strong: (x: React.ReactNode) => <strong>{x}</strong>,
                    }}
                />
            );
        } else {
            const allParticipants = currentChannel.display_name.split(', ');
            const participants =
                allParticipants.length === 1 ? allParticipants[0] : `${allParticipants.
                    slice(0, -1).
                    join(', ')}</strong> and <strong>${
                    allParticipants[allParticipants.length - 1]
                }`;

            notificationText = (
                <FormattedMessage
                    id='forward_post_modal.notification.dm_or_gm'
                    defaultMessage='This message is from a private conversation and can only be shared with <strong>{participants}</strong>'
                    values={{
                        participants,
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

    const handleSubmit = useCallback(async () => {
        let result = await actions.forwardPost(
            post,
            isPrivateConversation ? currentChannel.id : selectedChannelId,
            comment,
        );
        if (result.error) {
            setPostError(result.error);
            return;
        }

        if (
            selectedChannel?.details.type === Constants.MENTION_MORE_CHANNELS &&
            selectedChannel?.details.type === Constants.OPEN_CHANNEL
        ) {
            result = await actions.joinChannelById(selectedChannelId);

            if (result.error) {
                setPostError(result.error);
                return;
            }
        }

        // only switch channels when we are not in a private conversation
        if (!isPrivateConversation && selectedChannel) {
            result = await actions.switchToChannel(selectedChannel.details);

            if (result.error) {
                setPostError(result.error);
                return;
            }
        }

        onHide();
    }, [
        actions,
        post,
        isPrivateConversation,
        currentChannel.id,
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
        channel: currentChannel.display_name,
    });

    const providerValue = {
        comment,
        setComment,
        setPostError,
    };

    return (
        <GenericModal
            className='a11y__modal forward-post'
            show={true}
            enforceFocus={false}
            autoCloseOnConfirmButton={false}
            useCompassDesign={true}
            modalHeaderText={formatMessage({
                id: 'forward_post_modal.title',
                defaultMessage: 'Forward Message',
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
            <ForwardPostContext.Provider value={providerValue}>
                <div className={'forward-post__body'}>
                    {isPrivateConversation ? (
                        notification
                    ) : (
                        <ForwardPostChannelSelect
                            onSelect={handleChannelSelect}
                            value={selectedChannel}
                        />
                    )}
                    <ForwardPostCommentInput
                        canForwardPost={canForwardPost}
                        channelId={selectedChannelId}
                        onSubmit={handleSubmit}
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
                                    'animation--highlight': postError,
                                })}
                            >
                                {postError}
                            </label>
                        )}
                    </div>
                </div>
            </ForwardPostContext.Provider>
        </GenericModal>
    );
};

export default ForwardPostModal;
