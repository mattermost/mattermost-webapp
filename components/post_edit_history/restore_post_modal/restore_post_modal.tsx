// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {matchPath} from 'react-router-dom';

import {Post} from '@mattermost/types/posts';

import * as UserAgent from 'utils/user_agent';
import {browserHistory} from 'utils/browser_history';

const urlFormatForDMGMPermalink = '/:teamName/messages/:username/:postid';
const urlFormatForChannelPermalink = '/:teamName/channels/:channelname/:postid';

type Props = {
    channelName?: string;
    teamName?: string;
    post: Post;
    isRHS: boolean;
    onExited: () => void;
    actions: {
        handleRestore: (post: Post) => Promise<{ data: boolean }>;
    };
    location: {
        pathname: string;
    };
}

type State = {
    show: boolean;
}

export default class RestorePostModal extends React.PureComponent<Props, State> {
    restorePostBtn: React.RefObject<HTMLButtonElement>;

    constructor(props: Props) {
        super(props);
        this.restorePostBtn = React.createRef();

        this.state = {
            show: true,
        };
    }

    handleRestore = async () => {
        const {
            actions,
            post,
        } = this.props;

        let permalinkPostId = '';

        const result = await actions.handleRestore(post);

        const matchUrlForDMGM = matchPath<{ postid: string }>(this.props.location.pathname, {
            path: urlFormatForDMGMPermalink,
        });

        const matchUrlForChannel = matchPath<{ postid: string }>(this.props.location.pathname, {
            path: urlFormatForChannelPermalink,
        });

        if (matchUrlForDMGM) {
            permalinkPostId = matchUrlForDMGM.params.postid;
        } else if (matchUrlForChannel) {
            permalinkPostId = matchUrlForChannel.params.postid;
        }

        if (permalinkPostId === post.id) {
            const channelUrl = this.props.location.pathname.split('/').slice(0, -1).join('/');
            browserHistory.replace(channelUrl);
        }

        if (result.data) {
            this.onHide();
        }
    }

    handleEntered = () => {
        this.restorePostBtn?.current?.focus();
    }

    onHide = () => {
        this.setState({show: false});

        if (!UserAgent.isMobile()) {
            let element;
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
        return (
            <Modal
                dialogClassName='a11y__modal channel-invite'
                show={this.state.show}
                onEntered={this.handleEntered}
                onHide={this.onHide}
                onExited={this.props.onExited}
                enforceFocus={false}
                id='restorePostModal'
                role='dialog'
                aria-labelledby='restorePostModalLabel'
            >
                <Modal.Header closeButton={true}/>
                <Modal.Body
                    role='application'
                    className='overflow--visible'
                >
                    <div className='edit-post__restore__modal__header'>
                        <FormattedMessage
                            id='restore_post.title'
                            defaultMessage='Restore this message?'
                        />
                    </div>
                    <div className='edit-post__restore__modal__content'>
                        {this.props.post.message}
                    </div>
                </Modal.Body>
                <Modal.Footer className='edit-post__restore__modal__footer' >
                    <button
                        type='button'
                        className='btn cancel-button'
                        onClick={this.onHide}
                    >
                        <FormattedMessage
                            id='generic_modal.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        ref={this.restorePostBtn}
                        type='button'
                        autoFocus={true}
                        className='btn btn-primary'
                        onClick={this.handleRestore}
                        id='restorePostModalButton'
                    >
                        <FormattedMessage
                            id='generic_modal.confirm'
                            defaultMessage='Confirm'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
