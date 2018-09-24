
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import General from 'mattermost-redux/constants/general';

import * as WebrtcActions from 'actions/webrtc_actions';
import WebrtcStore from 'stores/webrtc_store';
import {Constants} from 'utils/constants';
import * as Utils from 'utils/utils';

export default class Webrtc extends React.PureComponent {
    static propTypes = {

        /**
         * Object with info about channel
         */
        channel: PropTypes.object.isRequired,

        /**
         * String that is id of user to contact
         */
        teammateId: PropTypes.string.isRequired,

        /**
         * String that is status of user to contact
         */
        teammateStatus: PropTypes.string.isRequired,

        /**
         * Boolean whether the Webrtc is enabled
         * from redux store
         */
        isWebrtcEnabled: PropTypes.bool.isRequired,

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
        return !this.state.isBusy || this.props.teammateStatus === General.ONLINE;
    }

    initWebrtc = () => {
        if (this.isContactAvailable()) {
            this.props.actions.closeRightHandSide();
            WebrtcActions.initWebrtc(this.props.teammateId, true);
        }
    }

    render() {
        const {channel, isWebrtcEnabled} = this.props;

        if (channel.type !== Constants.DM_CHANNEL) {
            return null;
        }

        if (!isWebrtcEnabled) {
            return null;
        }

        if (!Utils.isUserMediaAvailable()) {
            return null;
        }

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
