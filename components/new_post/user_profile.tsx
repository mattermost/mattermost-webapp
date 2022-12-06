// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';
import {FormattedMessage} from 'react-intl';

import Constants, {Locations} from 'utils/constants';
import {fromAutoResponder} from 'utils/post_utils';

import {Post} from '@mattermost/types/posts';

import BotBadge from 'components/widgets/badges/bot_badge';
import Badge from 'components/widgets/badges/badge';
import UserProfile from 'components/user_profile';
import PostHeaderCustomStatus from 'components/post_view/post_header/post_header_custom_status';

type Props = {
    post: Post;
    compactDisplay?: boolean;
    colorizeUsernames?: boolean;
    isBusy?: boolean;
    enablePostUsernameOverride?: boolean;
    isConsecutivePost?: boolean;
    isBot: boolean;
    isSystemMessage: boolean;
    isPostBeingEdited?: boolean;
    isMobileView: boolean;
    location: keyof typeof Locations;
};

const PostUserProfile = (props: Props): JSX.Element | null => {
    const {post, compactDisplay, isMobileView, isConsecutivePost, isBusy, enablePostUsernameOverride, isBot, isSystemMessage, colorizeUsernames} = props;
    const isFromAutoResponder = fromAutoResponder(post);
    const colorize = compactDisplay && colorizeUsernames;

    let userProfile: ReactNode = null;
    let botIndicator = null;

    const customStatus = (
        <PostHeaderCustomStatus
            userId={props.post.user_id}
            isBot={props.isBot || post.props.from_webhook === 'true'}
            isSystemMessage={isSystemMessage}
        />
    );

    if (compactDisplay || isMobileView) {
        userProfile = (
            <UserProfile
                userId={post.user_id}
                channelId={post.channel_id}
                isBusy={isBusy}
                isRHS={props.location === Locations.RHS_COMMENT || props.location === Locations.RHS_ROOT}
                hasMention={true}
                colorize={colorize}
            />
        );
    }

    if (!isConsecutivePost) {
        userProfile = (
            <UserProfile
                userId={post.user_id}
                channelId={post.channel_id}
                isBusy={isBusy}
                isRHS={props.location === Locations.RHS_COMMENT || props.location === Locations.RHS_ROOT}
                hasMention={true}
                colorize={colorize}
            />
        );

        if (post.props && post.props.from_webhook) {
            const overwriteName = post.props.override_username && enablePostUsernameOverride ? post.props.override_username : undefined;
            userProfile = (
                <UserProfile
                    userId={post.user_id}
                    channelId={post.channel_id}
                    hideStatus={true}
                    overwriteName={overwriteName}
                    disablePopover={true}
                    colorize={colorize}
                />
            );

            botIndicator = (<BotBadge className='col col__name'/>);
        } else if (isFromAutoResponder) {
            userProfile = (
                <span className='auto-responder'>
                    <UserProfile
                        userId={post.user_id}
                        channelId={post.channel_id}
                        hideStatus={true}
                        isBusy={isBusy}
                        isRHS={props.location === Locations.RHS_COMMENT || props.location === Locations.RHS_ROOT}
                        hasMention={true}
                        colorize={colorize}
                    />
                </span>
            );
            botIndicator = (
                <Badge className='col col__name'>
                    <FormattedMessage
                        id='post_info.auto_responder'
                        defaultMessage='AUTOMATIC REPLY'
                    />
                </Badge>
            );
        } else if (isSystemMessage && isBot) {
            userProfile = (
                <UserProfile
                    userId={post.user_id}
                    channelId={post.channel_id}
                    hideStatus={true}
                    colorize={colorize}
                />
            );
        } else if (isSystemMessage) {
            userProfile = (
                <UserProfile
                    overwriteName={
                        <FormattedMessage
                            id='post_info.system'
                            defaultMessage='System'
                        />
                    }
                    overwriteImage={Constants.SYSTEM_MESSAGE_PROFILE_IMAGE}
                    disablePopover={true}
                    channelId={post.channel_id}
                    colorize={colorize}
                />
            );
        }
    }

    return (<div className='col col__name'>
        {userProfile}
        {botIndicator}
        {customStatus}
    </div>);
};

export default PostUserProfile;
