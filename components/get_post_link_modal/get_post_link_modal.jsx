// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import ModalStore from 'stores/modal_store.jsx';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import GetLinkModal from 'components/get_link_modal.jsx';

export default class GetPostLinkModal extends React.PureComponent {
    static propTypes = {

        /**
         * URL of current team
         */
        currentTeamUrl: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);

        this.handleToggle = this.handleToggle.bind(this);
        this.hide = this.hide.bind(this);

        this.state = {
            show: false,
            post: {},
        };
    }

    componentDidMount() {
        ModalStore.addModalListener(Constants.ActionTypes.TOGGLE_GET_POST_LINK_MODAL, this.handleToggle);
    }

    componentWillUnmount() {
        ModalStore.removeModalListener(Constants.ActionTypes.TOGGLE_GET_POST_LINK_MODAL, this.handleToggle);
    }

    handleToggle(value, args) {
        this.setState({
            show: value,
            post: args.post,
        });
    }

    hide() {
        this.setState({
            show: false,
        });
    }

    render() {
        const postUrl = this.props.currentTeamUrl + '/pl/' + this.state.post.id;
        return (
            <GetLinkModal
                show={this.state.show}
                onHide={this.hide}
                title={Utils.localizeMessage('get_post_link_modal.title', 'Copy Permalink')}
                helpText={Utils.localizeMessage('get_post_link_modal.help', 'The link below allows authorized users to see your post.')}
                link={postUrl}
            />
        );
    }
}
