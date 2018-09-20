// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';
import {stripMarkdown} from 'utils/markdown';

import CommentedOnFilesMessage from 'components/post_view/commented_on_files_message';

export default class CommentedOn extends PureComponent {
    static propTypes = {
        displayName: PropTypes.string,
        enablePostUsernameOverride: PropTypes.bool,
        onCommentClick: PropTypes.func.isRequired,
        post: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            showSearchResults: PropTypes.func.isRequired,
            updateSearchTerms: PropTypes.func.isRequired,
        }).isRequired,
    }

    handleOnClick = () => {
        const {actions} = this.props;
        const displayName = this.makeUsername();
        actions.updateSearchTerms(displayName);
        actions.showSearchResults();
    }

    makeUsername = () => {
        const postProps = this.props.post.props;
        let username = this.props.displayName;
        if (
            this.props.enablePostUsernameOverride &&
            postProps &&
            postProps.from_webhook === 'true' &&
            postProps.override_username
        ) {
            username = postProps.override_username;
        }
        return username;
    }

    render() {
        const {
            post,
        } = this.props;

        const username = this.makeUsername();

        let apostrophe = '\'s';
        if (username.slice(-1) === 's') {
            apostrophe = '\'';
        }

        const name = (
            <a
                className='theme'
                onClick={this.handleOnClick}
            >
                {username}
            </a>
        );

        let message = '';
        if (post.message === '' && post.props && post.props.attachments) {
            const attachment = post.props.attachments[0];
            const webhookMessage = attachment.pretext || attachment.title || attachment.text || attachment.fallback;
            message = Utils.replaceHtmlEntities(webhookMessage);
        } else if (post.file_ids && post.file_ids.length > 0) {
            message = (
                <CommentedOnFilesMessage parentPostId={post.id}/>
            );
        } else {
            message = Utils.replaceHtmlEntities(post.message);
        }

        return (
            <div className='post__link'>
                <span>
                    <FormattedMessage
                        id='post_body.commentedOn'
                        defaultMessage='Commented on {name}{apostrophe} message: '
                        values={{
                            name,
                            apostrophe,
                        }}
                    />
                    <a
                        className='theme'
                        onClick={this.props.onCommentClick}
                    >
                        {stripMarkdown(message)}
                    </a>
                </span>
            </div>
        );
    }
}
