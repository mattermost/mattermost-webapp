// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import ModalStore from 'stores/modal_store.jsx';
import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import GetLinkModal from 'components/get_link_modal';

type Props = {
    currentTeamUrl: string;
    postId?: string | number;
    show: boolean;
    onHide: () => void;
}

export default class GetPostLinkModal extends React.PureComponent<Props> {
    public render(): JSX.Element|null {
        const {currentTeamUrl, show, postId} = this.props;

        if (postId && typeof postId === 'string' && postId.length !== 0) {
            const postUrl = `${currentTeamUrl}/pl/${postId}`;

            return (
                <GetLinkModal
                    show={show}
                    onHide={this.props.onHide}
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
