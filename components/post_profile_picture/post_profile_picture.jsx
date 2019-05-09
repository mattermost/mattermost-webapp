// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import ProfilePicture from 'components/profile_picture';
import MattermostLogo from 'components/svg/mattermost_logo';

import Constants, {UserStatuses} from 'utils/constants';
import * as PostUtils from 'utils/post_utils';
import * as Utils from 'utils/utils';

export default class PostProfilePicture extends React.PureComponent {
    static propTypes = {
        compactDisplay: PropTypes.bool.isRequired,
        enablePostIconOverride: PropTypes.bool.isRequired,
        hasImageProxy: PropTypes.bool.isRequired,
        isBusy: PropTypes.bool,
        isRHS: PropTypes.bool,
        post: PropTypes.object.isRequired,
        status: PropTypes.string,
        user: PropTypes.object,
        isBot: PropTypes.bool,
    };

    static defaultProps = {
        status: UserStatuses.OFFLINE,
    };

    getProfilePicSrcForPost = (fromAutoResponder, fromWebhook) => {
        const {post, user} = this.props;

        if (this.props.compactDisplay) {
            return '';
        }

        let src = '';
        if (user && user.id === post.user_id) {
            src = Utils.imageURLForUser(user);
        } else if (post.user_id) {
            src = Utils.imageURLForUser(post.user_id);
        }

        if (!fromAutoResponder && fromWebhook && !post.props.use_user_icon && this.props.enablePostIconOverride) {
            if (post.props.override_icon_url) {
                src = PostUtils.getImageSrc(post.props.override_icon_url, this.props.hasImageProxy);
            } else {
                src = Constants.DEFAULT_WEBHOOK_LOGO;
            }
        }

        return src;
    };

    getStatus = (fromAutoResponder, fromWebhook, user) => {
        if (fromAutoResponder || fromWebhook || (user && user.is_bot)) {
            return '';
        }

        return this.props.status;
    };

    render() {
        const {
            compactDisplay,
            isBusy,
            isRHS,
            post,
            user,
            isBot,
        } = this.props;
        const isSystemMessage = PostUtils.isSystemMessage(post);
        const fromWebhook = PostUtils.isFromWebhook(post);
        if (isSystemMessage && !compactDisplay && !fromWebhook && !isBot) {
            return <MattermostLogo className='icon'/>;
        }

        const fromAutoResponder = PostUtils.fromAutoResponder(post);

        const hasMention = !fromAutoResponder && !fromWebhook;
        const src = this.getProfilePicSrcForPost(fromAutoResponder, fromWebhook);
        const status = this.getStatus(fromAutoResponder, fromWebhook, user);

        return (
            <ProfilePicture
                hasMention={hasMention}
                isBusy={isBusy}
                isRHS={isRHS}
                src={src}
                status={status}
                userId={user ? user.id : null}
                username={user ? user.username : null}
            />
        );
    }
}
