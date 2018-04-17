// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

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

    constructor(props) {
        super(props);

        this.retryPost = this.retryPost.bind(this);
        this.cancelPost = this.cancelPost.bind(this);

        this.submitting = false;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.post.id !== this.props.post.id) {
            this.setState({
                submitting: false,
                submitted: false,
            });
        }
    }

    retryPost(e) {
        e.preventDefault();

        // Don't retry if already retrying or previously retried and succeeded (and waiting for
        // re-render).
        if (this.state.submitting || this.state.submitted) {
            return;
        }

        this.setState({
            submitting: true,
        });

        const post = {...this.props.post};
        Reflect.deleteProperty(post, 'id');
        this.props.actions.createPost(post,
            () => {
                this.setState({
                    submitted: true,
                });
            },
            (err) => {
                if (err && err.id && err.id === 'api.post.create_post.root_id.app_error') {
                    this.showPostDeletedModal();
                }

                this.setState({
                    submitting: false,
                });
            }
        );
    }

    cancelPost(e) {
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
