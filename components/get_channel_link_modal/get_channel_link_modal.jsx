// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import ModalStore from 'stores/modal_store.jsx';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import {getSiteURL} from 'utils/url.jsx';

import GetLinkModal from 'components/get_link_modal.jsx';

export default class GetChannelLinkModal extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            show: false,
            channelLink: ''
        };
    }

    componentDidMount() {
        ModalStore.addModalListener(Constants.ActionTypes.TOGGLE_GET_CHANNEL_LINK_MODAL, this.handleToggle);
    }

    componentWillUnmount() {
        ModalStore.removeModalListener(Constants.ActionTypes.TOGGLE_GET_CHANNEL_LINK_MODAL, this.handleToggle);
    }

    handleToggle = (value, args) => {
        this.setState({
            show: value,
            channelLink: args ? args.link : ''
        });
    }

    render() {
        return (
            <GetLinkModal
                show={this.state.show}
                onHide={() => this.handleToggle(false)}
                title={Utils.localizeMessage('get_channel_link_modal.title', 'Channel Link')}
                helpText={Utils.localizeMessage('get_channel_link_modal.help', 'Paste the link below into a web browser to view the channel.')}
                link={getSiteURL() + this.state.channelLink}
            />
        );
    }
}
