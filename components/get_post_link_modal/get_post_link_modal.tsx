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
    post: {
        id?: string;
    };
}

type HandleToggle={
    (value: boolean, args: any): void;
}

export default class GetPostLinkModal extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            show: false,
            post: {
                id: '',
            },
        };
    }

    public componentDidMount(): void {
        ModalStore.addModalListener(Constants.ActionTypes.TOGGLE_GET_POST_LINK_MODAL, this.handleToggle);
    }

    public componentWillUnmount(): void {
        ModalStore.removeModalListener(Constants.ActionTypes.TOGGLE_GET_POST_LINK_MODAL, this.handleToggle);
    }

    private handleToggle: HandleToggle = (value, args) => {
        this.setState({
            show: value,
            post: Object.assign(this.state.post, args.post),
        });
    }

    private hide = (): void => {
        this.setState({
            show: false,
        });
    }

    public render(): JSX.Element {
        const {post, post: {id}, show} = this.state;
        const {currentTeamUrl} = this.props;

        let postID = 'undefined';
        if (post && id && id.length !== 0) {
            postID = id;
        }
        const postUrl = `${currentTeamUrl}/pl/${postID}`;

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
}
