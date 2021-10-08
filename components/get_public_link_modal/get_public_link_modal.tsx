// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import ModalStore from 'stores/modal_store.jsx';
import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import GetLinkModal from 'components/get_link_modal';

type Props = {
    link: string;
    actions: {
        getFilePublicLink: (fileId: string) => void;
    };
}

type State = {
    show: boolean;
    fileId: string;
}

export default class GetPublicLinkModal extends React.PureComponent<Props, State> {
    public static defaultProps: Partial<Props> = {
        link: '',
    };

    public constructor(props: Props) {
        super(props);

        this.state = {
            show: false,
            fileId: '',
        };
    }

    public componentWillUnmount() {
        ModalStore.removeModalListener(Constants.ActionTypes.TOGGLE_GET_PUBLIC_LINK_MODAL, this.handleToggle);
    }

    public componentDidMount() {
        ModalStore.addModalListener(Constants.ActionTypes.TOGGLE_GET_PUBLIC_LINK_MODAL, this.handleToggle);
    }

    public componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.state.show && !prevState.show) {
            this.props.actions.getFilePublicLink(this.state.fileId);
        }
    }

    handleToggle = (value: boolean, args: State) => {
        this.setState({
            show: value,
            fileId: args.fileId,
        });
    }

    public onHide = () => {
        this.setState({
            show: false,
        });
    }

    public render() {
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
