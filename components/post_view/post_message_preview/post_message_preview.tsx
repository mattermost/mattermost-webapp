// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo} from 'react';

import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import {useDispatch, useSelector} from 'react-redux';

import {MessageTextOutlineIcon} from '@mattermost/compass-icons/components';

import ViewThreadButton from 'components/threading/common/view_thread_button';

import UserProfileComponent from 'components/user_profile';
import {UserProfile} from '@mattermost/types/users';
import {Post} from '@mattermost/types/posts';
import Avatar from 'components/widgets/users/avatar';
import * as PostUtils from 'utils/post_utils';
import * as Utils from 'utils/utils';
import PostMessageView from 'components/post_view/post_message_view';
import PriorityLabel from 'components/post_priority/post_priority_label';

import Timestamp from 'components/timestamp';
import PostAttachmentContainer from '../post_attachment_container/post_attachment_container';
import FileAttachmentListContainer from 'components/file_attachment_list';
import PostAttachmentOpenGraph from 'components/post_view/post_attachment_opengraph';

import ReactionList from 'components/post_view/reaction_list';

import MattermostLogo from 'components/widgets/icons/mattermost_logo';
import {Constants} from 'utils/constants';
import {General} from 'mattermost-redux/constants';

import {makeGetThreadOrSynthetic} from 'mattermost-redux/selectors/entities/threads';

import {selectPost} from 'actions/views/rhs';

import {GlobalState} from 'types/store';

import {OwnProps} from './index';

export type Props = OwnProps & {
    currentTeamUrl: string;
    channelDisplayName?: string;
    user: UserProfile | null;
    hasImageProxy: boolean;
    enablePostIconOverride: boolean;
    isEmbedVisible: boolean;
    compactDisplay: boolean;
    isPostPriorityEnabled: boolean;
    isPermalink?: boolean;
    parentPost?: Post;
    handleFileDropdownOpened?: (open: boolean) => void;
    actions: {
        toggleEmbedVisibility: (id: string) => void;
    };
};

const PostMessagePreview = (props: Props) => {
    const {
        currentTeamUrl,
        channelDisplayName,
        user,
        previewPost,
        metadata,
        isEmbedVisible,
        compactDisplay,
        preventClickAction,
        previewFooterMessage,
        handleFileDropdownOpened,
        isPostPriorityEnabled,
        isPermalink,
        parentPost,
    } = props;
    const dispatch = useDispatch();

    const toggleEmbedVisibility = () => {
        if (previewPost) {
            props.actions.toggleEmbedVisibility(previewPost.id);
        }
    };

    const getPostIconURL = (defaultURL: string, fromAutoResponder: boolean, fromWebhook: boolean): string => {
        const {enablePostIconOverride, hasImageProxy, previewPost} = props;
        const postProps = previewPost?.props;
        let postIconOverrideURL = '';
        let useUserIcon = '';
        if (postProps) {
            postIconOverrideURL = postProps.override_icon_url;
            useUserIcon = postProps.use_user_icon;
        }

        if (
            !fromAutoResponder &&
            fromWebhook &&
            !useUserIcon &&
            enablePostIconOverride
        ) {
            if (postIconOverrideURL && postIconOverrideURL !== '') {
                return PostUtils.getImageSrc(postIconOverrideURL, hasImageProxy);
            }
            return Constants.DEFAULT_WEBHOOK_LOGO;
        }

        return defaultURL;
    };

    const viewThread = useCallback(
        async (e) => {
            e.stopPropagation();
            if (parentPost) {
                await dispatch(selectPost(parentPost));
            }
        },
        [dispatch, parentPost],
    );

    const getThreadOrSynthetic = useMemo(makeGetThreadOrSynthetic, [parentPost?.id]);
    const lastReplyAt = useSelector((state: GlobalState) => getThreadOrSynthetic(state, parentPost!))?.last_reply_at;

    if (!previewPost) {
        return null;
    }

    const hasNewReplies = lastReplyAt && lastReplyAt > previewPost.create_at;
    const isBot = Boolean(user && user.is_bot);
    const isSystemMessage = PostUtils.isSystemMessage(previewPost);
    const fromWebhook = PostUtils.isFromWebhook(previewPost);
    const fromAutoResponder = PostUtils.fromAutoResponder(previewPost);
    const profileSrc = Utils.imageURLForUser(user?.id ?? '');
    const src = getPostIconURL(profileSrc, fromAutoResponder, fromWebhook);

    let avatar = (
        <Avatar
            size={'sm'}
            url={src}
            className={'avatar-post-preview'}
        />
    );
    if (isSystemMessage && !fromWebhook && !isBot) {
        avatar = <MattermostLogo className='icon'/>;
    } else if (user?.id) {
        avatar = (
            <Avatar
                username={user.username}
                size={'sm'}
                url={src}
                className={'avatar-post-preview'}
            />
        );
    }

    let fileAttachmentPreview = null;

    if (
        (previewPost.file_ids && previewPost.file_ids.length > 0) ||
        (previewPost.filenames && previewPost.filenames.length > 0)
    ) {
        fileAttachmentPreview = (
            <FileAttachmentListContainer
                post={previewPost}
                compactDisplay={compactDisplay}
                isInPermalink={true}
                handleFileDropdownOpened={handleFileDropdownOpened}
            />
        );
    }

    let urlPreview = null;

    if (previewPost && previewPost.metadata && previewPost.metadata.embeds) {
        const embed = previewPost.metadata.embeds[0];

        if (embed && embed.type === 'opengraph') {
            urlPreview = (
                <PostAttachmentOpenGraph
                    postId={previewPost.id}
                    link={embed.url}
                    isEmbedVisible={isEmbedVisible}
                    post={previewPost}
                    toggleEmbedVisibility={toggleEmbedVisibility}
                    isInPermalink={true}
                />
            );
        }
    }

    let teamUrl = `/${metadata.team_name}`;
    if (metadata.channel_type === General.DM_CHANNEL || metadata.channel_type === General.GM_CHANNEL) {
        teamUrl = currentTeamUrl;
    }

    const previewFooter = channelDisplayName || previewFooterMessage ? (
        <div className='post__preview-footer'>
            <p>
                {previewFooterMessage || (
                    <FormattedMessage
                        id='post_message_preview.channel'
                        defaultMessage='Only visible to users in ~{channel}'
                        values={{
                            channel: channelDisplayName,
                        }}
                    />
                )}
            </p>
        </div>
    ) : null;

    let reactionPreview;
    if (previewPost.props?.broadcasted_thread_reply && !isPermalink) {
        reactionPreview = (
            <div className='post__reactions'>
                <ReactionList post={previewPost}/>
            </div>
        );
    }

    return (
        <PostAttachmentContainer
            className='permalink'
            link={`${teamUrl}/pl/${metadata.post_id}`}
            selectedPost={previewPost.props?.broadcasted_thread_reply && !isPermalink ? previewPost : null}
            preventClickAction={preventClickAction}
        >
            <div className='post-preview'>
                {(!previewPost.props?.broadcasted_thread_reply || isPermalink) &&
                    <div className='post-preview__header'>
                        <div className='col col__name'>
                            <div className='post__img'>
                                <span className='profile-icon'>
                                    {avatar}
                                </span>
                            </div>
                        </div>
                        <div className={classNames('col col__name', 'permalink--username')}>
                            <UserProfileComponent
                                userId={user?.id}
                                hasMention={true}
                                disablePopover={true}
                                overwriteName={previewPost.props?.override_username || ''}
                            />
                        </div>
                        <div className='col d-flex align-items-center'>
                            <Timestamp
                                value={previewPost.create_at}
                                units={[
                                    'now',
                                    'minute',
                                    'hour',
                                    'day',
                                ]}
                                useTime={false}
                                day={'numeric'}
                                className='post-preview__time'
                            />
                            {previewPost.props?.priority && isPostPriorityEnabled && (
                                <span className='d-flex mr-2 ml-1'>
                                    <PriorityLabel priority={previewPost.props.priority}/>
                                </span>
                            )}
                        </div>
                    </div>
                }
                <PostMessageView
                    post={previewPost}
                    overflowType='ellipsis'
                    maxHeight={105}
                />
                {urlPreview}
                {fileAttachmentPreview}
                {reactionPreview || previewFooter}
                {previewPost.props?.broadcasted_thread_reply && !isPermalink &&
                    <ViewThreadButton
                        onClick={viewThread}
                        prepend={
                            <div className='ViewThreadButton_icon'>
                                <MessageTextOutlineIcon size={18}/>
                            </div>
                        }
                    >
                        <FormattedMessage
                            id={hasNewReplies ? 'post_message_preview.view_newer_replies_button' : 'post_message_preview.view_thread_button'}
                            defaultMessage={hasNewReplies ? 'View newer replies' : 'View Thread'}
                        />
                    </ViewThreadButton>
                }
            </div>
        </PostAttachmentContainer>
    );
};

export default PostMessagePreview;
