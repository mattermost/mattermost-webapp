// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {browserHistory} from 'utils/browser_history';
import * as UserAgent from 'utils/user_agent.jsx';

export default class DeletePostModal extends React.PureComponent {
    static propTypes = {

        channelName: PropTypes.string,
        focusedPostId: PropTypes.string,
        teamName: PropTypes.string,
        post: PropTypes.object.isRequired,
        commentCount: PropTypes.number.isRequired,

        /**
         * Does the post come from RHS mode
         */
        isRHS: PropTypes.bool.isRequired,

        /**
        * Function called when modal is dismissed
        */
        onHide: PropTypes.func.isRequired,

        actions: PropTypes.shape({

            /**
            * Function called for deleting post
            */
            deleteAndRemovePost: PropTypes.func.isRequired,
        }),
    }

    constructor(props) {
        super(props);
        this.handleDelete = this.handleDelete.bind(this);
        this.onHide = this.onHide.bind(this);
        this.state = {
            show: true,
        };
    }

    handleDelete = async () => {
        const {
            actions,
            channelName,
            focusedPostId,
            post,
            teamName,
        } = this.props;

        const {data} = await actions.deleteAndRemovePost(post);

        if (post.id === focusedPostId && channelName) {
            browserHistory.push('/' + teamName + '/channels/' + channelName);
        }

        if (data) {
            this.onHide();
        }
    }

    onHide() {
        this.setState({show: false});

        if (!UserAgent.isMobile()) {
            var element;
            if (this.props.isRHS) {
                element = document.getElementById('reply_textbox');
            } else {
                element = document.getElementById('post_textbox');
            }
            if (element) {
                element.focus();
            }
        }
    }

    render() {
        var commentWarning = '';
        if (this.props.commentCount > 0) {
            commentWarning = (
                <FormattedMessage
                    id='delete_post.warning'
                    defaultMessage='This post has {count, number} {count, plural, one {comment} other {comments}} on it.'
                    values={{
                        count: this.props.commentCount,
                    }}
                />
            );
        }

        const postTerm = this.props.post.root_id ? (
            <FormattedMessage
                id='delete_post.comment'
                defaultMessage='Comment'
            />
        ) : (
            <FormattedMessage
                id='delete_post.post'
                defaultMessage='Post'
            />
        );

        return (
            <Modal
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
                enforceFocus={false}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='delete_post.confirm'
                            defaultMessage='Confirm {term} Delete'
                            values={{
                                term: (postTerm),
                            }}
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FormattedMessage
                        id='delete_post.question'
                        defaultMessage='Are you sure you want to delete this {term}?'
                        values={{
                            term: (postTerm),
                        }}
                    />
                    <br/>
                    <br/>
                    {commentWarning}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-default'
                        onClick={this.onHide}
                    >
                        <FormattedMessage
                            id='delete_post.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        ref={(deletePostBtn) => {
                            this.deletePostBtn = deletePostBtn;
                        }}
                        type='button'
                        autoFocus={true}
                        className='btn btn-danger'
                        onClick={this.handleDelete}
                    >
                        <FormattedMessage
                            id='delete_post.del'
                            defaultMessage='Delete'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
