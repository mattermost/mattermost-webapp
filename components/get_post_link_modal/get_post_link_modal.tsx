// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import ModalStore from 'stores/modal_store.jsx';
import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import GetLinkModal from 'components/get_link_modal';

type Props = {
    currentTeamUrl: string;
}

type State = {
    show: boolean;
    postId?: string;
}

type Post = {
    id: string;
    message?: string;
}

export default class GetPostLinkModal extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            show: false,
        };
    }

    public componentDidMount(): void {
        ModalStore.addModalListener(Constants.ActionTypes.TOGGLE_GET_POST_LINK_MODAL, this.handleToggle);
    }

    public componentWillUnmount(): void {
        ModalStore.removeModalListener(Constants.ActionTypes.TOGGLE_GET_POST_LINK_MODAL, this.handleToggle);
    }

    public handleToggle = (value: boolean, args: {post: Post}): void => {
        const {post, post: {id}} = args;
        const postId = post && id && typeof id === 'string' && id.length !== 0 ? id : '';

        this.setState({
            show: value,
            postId,
        });
    }

    private hide = (): void => {
        this.setState({
            show: false,
        });
    }

    public render(): JSX.Element|null {
        const {postId, show} = this.state;
        const {currentTeamUrl} = this.props;

        if (postId && typeof postId === 'string' && postId.length !== 0) {
            const postUrl = `${currentTeamUrl}/pl/${postId}`;

            return (
                <GetLinkModal
                    show={show}
                    onHide={this.hide}
                    title={Utils.localizeMessage('get_post_link_modal.title', 'Copy Permalink')}
                    helpText={Utils.localizeMessage('get_post_link_modal.help', 'The link below allows authorized users to see your post.')}
                    link={postUrl}
                />
            );
        }

        // Dont show model if ID of post doesnt exists
        return null;
    }
}