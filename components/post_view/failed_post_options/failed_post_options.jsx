// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class FailedPostOptions extends React.PureComponent {
    static propTypes = {
        post: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            createPost: PropTypes.func.isRequired,
            removePost: PropTypes.func.isRequired,
        }).isRequired,
    }

    retryPost = (e) => {
        e.preventDefault();

        const post = {...this.props.post};
        Reflect.deleteProperty(post, 'id');
        this.props.actions.createPost(post);
    }

    cancelPost = (e) => {
        e.preventDefault();

        this.props.actions.removePost(this.props.post);
    }

    render() {
        return (
            <span className='pending-post-actions'>
                <a
                    className='post-retry'
                    href='#'
                    onClick={this.retryPost}
                >
                    <FormattedMessage
                        id='pending_post_actions.retry'
                        defaultMessage='Retry'
                    />
                </a>
                {' - '}
                <a
                    className='post-cancel'
                    href='#'
                    onClick={this.cancelPost}
                >
                    <FormattedMessage
                        id='pending_post_actions.cancel'
                        defaultMessage='Cancel'
                    />
                </a>
            </span>
        );
    }
}
