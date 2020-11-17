// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import ModalStore from 'stores/modal_store.jsx';
import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import GetLinkModal from 'components/get_link_modal';

export default class GetPublicLinkModal extends React.PureComponent {
    static propTypes = {

        /**
         * Public link of the file
         */
        link: PropTypes.string,

        actions: PropTypes.shape({

            /**
             * An action to get public link
             */
            getFilePublicLink: PropTypes.func.isRequired,
        }).isRequired,
    }

    static defaultProps = {
        link: '',
    }

    constructor(props) {
        super(props);
        this.state = {
            show: false,
            fileId: '',
        };
    }

    componentWillUnmount() {
        ModalStore.removeModalListener(Constants.ActionTypes.TOGGLE_GET_PUBLIC_LINK_MODAL, this.handleToggle);
    }

    componentDidMount() {
        ModalStore.addModalListener(Constants.ActionTypes.TOGGLE_GET_PUBLIC_LINK_MODAL, this.handleToggle);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.show && !prevState.show) {
            this.props.actions.getFilePublicLink(this.state.fileId);
        }
    }

    handleToggle = (value, args) => {
        this.setState({
            show: value,
            fileId: args.fileId,
        });
    }

    onHide = () => {
        this.setState({
            show: false,
        });
    }

    render() {
        return (
            <GetLinkModal
                show={this.state.show}
                onHide={this.onHide}
                title={Utils.localizeMessage('get_public_link_modal.title', 'Copy Public Link')}
                helpText={Utils.localizeMessage('get_public_link_modal.help', 'The link below allows anyone to see this file without being registered on this server.')}
                link={this.props.link}
            />
        );
    }
}
