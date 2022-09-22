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
import {getSiteURL} from '../../utils/url';
import * as Utils from '../../utils/utils';

import ForwardPostChannelSelect, {ChannelOption, makeSelectedChannelOption} from '../forward_post_modal/forward_post_channel_select';

import {ActionProps, OwnProps, PropsFromRedux} from './index';

import '../forward_post_modal/forward_post_modal.scss';

export type Props = PropsFromRedux & OwnProps & { actions: ActionProps };

const noop = () => {};

const MoveThreadModal = ({onExited, post, actions}: Props) => {
    const {formatMessage} = useIntl();

    const getChannel = makeGetChannel();

    const channel = useSelector((state: GlobalState) => getChannel(state, {id: post.channel_id}));
    const currentTeam = useSelector(getCurrentTeam);

    const relativePermaLink = useSelector((state: GlobalState) => Utils.getPermalinkURL(state, currentTeam.id, post.id));
    const permaLink = `${getSiteURL()}${relativePermaLink}`;

    const isPrivateConversation = channel.type !== General.OPEN_CHANNEL;

    const [comment, setComment] = useState('');
    const [bodyHeight, setBodyHeight] = useState<number>(0);
    const [hasError, setHasError] = useState<boolean>(false);
    const [postError, setPostError] = useState<React.ReactNode>(null);
    const [selectedChannel, setSelectedChannel] = useState<ChannelOption>();

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
        (state: GlobalState) => {
            const channelId = isPrivateConversation ? channel.id : selectedChannelId;
            const teamId = isPrivateConversation ? currentTeam.id : selectedChannel?.details?.team_id;

            return Boolean(channelId) &&
            haveIChannelPermission(
                state,
                teamId || '',
                channelId,
                Permissions.CREATE_POST,
            );
        },
    );

    const canMoveThread = (isPrivateConversation || canPostInSelectedChannel) && !postError;

    const onHide = useCallback(() => {
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
        let notificationText;
        notificationText = (
            <FormattedMessage
                id='forward_post_modal.notification.dm_or_gm'
                defaultMessage='Moving this thread changes who has access' // localization?
                values={{
                    strong: (x: React.ReactNode) => <strong>{x}</strong>,
                }}
            />
        );

    notification = (
        <NotificationBox
            variant={'info'}
            text={notificationText}
            id={'forward_post'}
        />
    );

    const handlePostError = (error: React.ReactNode) => {
        setPostError(error);
        setHasError(true);
        setTimeout(() => setHasError(false), Constants.ANIMATION_TIMEOUT);
    };

    const handleSubmit = async () => {
        if (postError) {
            return;
        }

        const channelToForward = isPrivateConversation ? makeSelectedChannelOption(channel) : selectedChannel;

        if (!channelToForward) {
            return;
        }

        const channelId = channelToForward.details.id;

        let result = await actions.forwardPost(
            post,
            channelToForward.details,
            comment,
        );

        if (result.error) {
            handlePostError(result.error);
            return;
        }

        if (
            channelToForward.details.type === Constants.MENTION_MORE_CHANNELS &&
            channelToForward.details.type === Constants.OPEN_CHANNEL
        ) {
            result = await actions.joinChannelById(channelId);

            if (result.error) {
                handlePostError(result.error);
                return;
            }
        }

        // only switch channels when we are not in a private conversation
        if (!isPrivateConversation) {
            result = await actions.switchToChannel(channelToForward.details);

            if (result.error) {
                handlePostError(result.error);
                return;
            }
        }

        // do deletions here?
        let deleteResult = await actions.moveThread(post.id, channelId);
        if(deleteResult.error) {
            // some errorchecking goes here
        }
        onHide();
    };

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
            id='forward-post-modal'
            show={true}
            enforceFocus={false}
            autoCloseOnConfirmButton={false}
            compassDesign={true}
            modalHeaderText={formatMessage({
                id: 'forward_post_modal.title',
                defaultMessage: 'Move thread',
            })}
            confirmButtonText={formatMessage({
                id: 'forward_post_modal.button.forward',
                defaultMessage: 'Move',
            })}
            cancelButtonText={formatMessage({
                id: 'forward_post_modal.button.cancel',
                defaultMessage: 'Cancel',
            })}
            isConfirmDisabled={!canMoveThread}
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

export default MoveThreadModal;
