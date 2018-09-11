
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {ONLINE} from 'mattermost-redux/constants/general';

import * as WebrtcActions from 'actions/webrtc_actions';
import WebrtcStore from 'stores/webrtc_store';

export default class WebrtcOption extends React.PureComponent {
    static propTypes = {

        /**
         * String that is id of user to contact
         */
        contactId: PropTypes.string.isRequired,

        /**
         * String that is status of user to contact
         */
        contactStatus: PropTypes.string.isRequired,

        /**
         * Object with action creators
         */
        actions: PropTypes.shape({
            closeRightHandSide: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            isBusy: WebrtcStore.isBusy(),
        };
    }

    componentDidMount() {
        WebrtcStore.addBusyListener(this.onBusy);
    }

    componentWillUnmount() {
        WebrtcStore.removeBusyListener(this.onBusy);
    }

    onBusy = (isBusy) => {
        this.setState({isBusy});
    }

    isContactAvailable = () => {
        return !this.state.isBusy || this.props.contactStatus === ONLINE;
    }

    initWebrtc = () => {
        if (this.isContactAvailable()) {
            this.props.actions.closeRightHandSide();
            WebrtcActions.initWebrtc(this.props.contactId, true);
        }
    }

    render() {
        let linkClass = '';
        if (!this.isContactAvailable()) {
            linkClass = ' disable-links';
        }

        return (
            <li
                role='presentation'
                className='webrtc__option'
            >
                <button
                    role='menuitem'
                    onClick={this.initWebrtc}
                    className={'style--none' + linkClass}
                >
                    <FormattedMessage
                        id='navbar_dropdown.webrtc.call'
                        defaultMessage='Start Video Call'
                    />
                </button>
            </li>
        );
    }
}
