// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {browserHistory} from 'react-router';

import {createChannel} from 'actions/channel_actions';
import TeamStore from 'stores/team_store';

import {cleanUpUrlable} from 'utils/url';
import * as Utils from 'utils/utils';
import Constants from 'utils/constants';

import NewChannelModal from 'components/new_channel_modal';
import ChangeURLModal from 'components/change_url_modal';

export default class NewChannelFlow extends React.Component {

    static propTypes = {

        /**
        * Set whether to show the modal or not
        */
        show: PropTypes.bool.isRequired,

        /**
        * Set to Constants.OPEN_CHANNEL or Constants.PRIVATE_CHANNEL depending on which modal we should show
        */
        channelType: PropTypes.string.isRequired,

        /**
        * Function to call when modal is dimissed
        */
        onModalDismissed: PropTypes.func.isRequired
    }

    static defaultProps = {
        show: false,
        channelType: Constants.OPEN_CHANNEL
    }

    constructor(props) {
        super(props);
        this.state = {
            serverError: '',
            channelType: props.channelType || Constants.OPEN_CHANNEL,
            flowState: Constants.SHOW_NEW_CHANNEL,
            channelDisplayName: '',
            channelName: '',
            channelPurpose: '',
            channelHeader: '',
            nameModified: false
        };
    }
    componentWillReceiveProps(nextProps) {
        // If we are being shown, grab channel type from props and clear
        if (nextProps.show === true && this.props.show === false) {
            this.setState({
                serverError: '',
                channelType: nextProps.channelType,
                flowState: Constants.SHOW_NEW_CHANNEL,
                channelDisplayName: '',
                channelName: '',
                channelPurpose: '',
                channelHeader: '',
                nameModified: false
            });
        }
    }
    onSubmit = () => {
        if (!this.state.channelDisplayName) {
            this.setState({serverError: Utils.localizeMessage('channel_flow.invalidName', 'Invalid Channel Name')});
            return;
        }

        const channel = {
            team_id: TeamStore.getCurrentId(),
            name: this.state.channelName,
            display_name: this.state.channelDisplayName,
            purpose: this.state.channelPurpose,
            header: this.state.channelHeader,
            type: this.state.channelType
        };

        createChannel(
            channel,
            (data) => {
                this.doOnModalExited = () => {
                    browserHistory.push(TeamStore.getCurrentTeamRelativeUrl() + '/channels/' + data.name);
                };

                this.props.onModalDismissed();
            },
            (err) => {
                if (err.id === 'store.sql_channel.update.exists.app_error') {
                    this.setState({serverError: Utils.localizeMessage('channel_flow.alreadyExist', 'A channel with that URL already exists')});
                    return;
                }
                this.setState({serverError: err.message});
            }
        );
    }
    onModalExited = () => {
        if (this.doOnModalExited) {
            this.doOnModalExited();
        }
    }
    typeSwitched = (e) => {
        e.preventDefault();
        if (this.state.channelType === Constants.PRIVATE_CHANNEL) {
            this.setState({channelType: Constants.OPEN_CHANNEL});
        } else {
            this.setState({channelType: Constants.PRIVATE_CHANNEL});
        }
    }
    urlChangeRequested = (e) => {
        if (e) {
            e.preventDefault();
        }
        this.setState({flowState: Constants.SHOW_EDIT_URL});
    }
    urlChangeSubmitted = (newURL) => {
        this.setState({flowState: Constants.SHOW_NEW_CHANNEL, serverError: null, channelName: newURL, nameModified: true});
    }
    urlChangeDismissed = () => {
        this.setState({flowState: Constants.SHOW_NEW_CHANNEL});
    }
    channelDataChanged = (data) => {
        this.setState({
            channelDisplayName: data.displayName,
            channelPurpose: data.purpose,
            channelHeader: data.header
        });
        if (!this.state.nameModified) {
            this.setState({channelName: cleanUpUrlable(data.displayName.trim())});
        }
    }
    render() {
        const channelData = {
            name: this.state.channelName,
            displayName: this.state.channelDisplayName,
            purpose: this.state.channelPurpose
        };

        let showChannelModal = false;
        let showGroupModal = false;
        let showChangeURLModal = false;

        let changeURLTitle = '';
        let changeURLSubmitButtonText = '';

        // Only listen to flow state if we are being shown
        if (this.props.show) {
            switch (this.state.flowState) {
            case Constants.SHOW_NEW_CHANNEL:
                if (this.state.channelType === Constants.OPEN_CHANNEL) {
                    showChannelModal = true;
                } else {
                    showGroupModal = true;
                }
                break;
            case Constants.SHOW_EDIT_URL:
                showChangeURLModal = true;
                changeURLTitle = (
                    <FormattedMessage
                        id='channel_flow.changeUrlTitle'
                        defaultMessage='Change Channel URL'
                    />
                );
                changeURLSubmitButtonText = changeURLTitle;
                break;
            }
        }
        return (
            <span>
                <NewChannelModal
                    show={showChannelModal}
                    channelType={Constants.OPEN_CHANNEL}
                    channelData={channelData}
                    serverError={this.state.serverError}
                    onSubmitChannel={this.onSubmit}
                    onModalDismissed={this.props.onModalDismissed}
                    onModalExited={this.onModalExited}
                    onTypeSwitched={this.typeSwitched}
                    onChangeURLPressed={this.urlChangeRequested}
                    onDataChanged={this.channelDataChanged}
                />
                <NewChannelModal
                    show={showGroupModal}
                    channelType={Constants.PRIVATE_CHANNEL}
                    channelData={channelData}
                    serverError={this.state.serverError}
                    onSubmitChannel={this.onSubmit}
                    onModalExited={this.onModalExited}
                    onModalDismissed={this.props.onModalDismissed}
                    onTypeSwitched={this.typeSwitched}
                    onChangeURLPressed={this.urlChangeRequested}
                    onDataChanged={this.channelDataChanged}
                />
                <ChangeURLModal
                    show={showChangeURLModal}
                    title={changeURLTitle}
                    submitButtonText={changeURLSubmitButtonText}
                    currentURL={this.state.channelName}
                    serverError={this.state.serverError}
                    onModalSubmit={this.urlChangeSubmitted}
                    onModalDismissed={this.urlChangeDismissed}
                    onModalExited={this.onModalExited}
                />
            </span>
        );
    }
}
