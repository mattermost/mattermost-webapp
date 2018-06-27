// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import ProfilePicture from 'components/profile_picture';
import MattermostLogo from 'components/svg/mattermost_logo';

import Constants from 'utils/constants';
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

    getStatus = (fromAutoResponder, fromWebhook) => {
        if (fromAutoResponder || fromWebhook) {
            return '';
        }

        return this.props.status;
    };

    render() {
        const isSystemMessage = PostUtils.isSystemMessage(this.props.post);
        if (isSystemMessage && !this.props.compactDisplay) {
            return <MattermostLogo className='icon'/>;
        }

        const fromAutoResponder = PostUtils.fromAutoResponder(this.props.post);
        const fromWebhook = PostUtils.isFromWebhook(this.props.post);

        const hasMention = !fromAutoResponder && !fromWebhook;
        const src = this.getProfilePicSrcForPost(fromAutoResponder, fromWebhook);
        const status = this.getStatus(fromAutoResponder, fromWebhook);

        return (
            <ProfilePicture
                hasMention={hasMention}
                isBusy={this.props.isBusy}
                isRHS={this.props.isRHS}
                src={src}
                status={status}
                user={this.props.user}
            />
        );
    }
}
