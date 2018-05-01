// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {browserHistory} from 'utils/browser_history';
import {createChannel} from 'actions/channel_actions';
import TeamStore from 'stores/team_store';
import {cleanUpUrlable} from 'utils/url';
import * as Utils from 'utils/utils';
import Constants from 'utils/constants';
import NewChannelModal from 'components/new_channel_modal';
import ChangeURLModal from 'components/change_url_modal';

export const SHOW_NEW_CHANNEL = 1;
export const SHOW_EDIT_URL = 2;
export const SHOW_EDIT_URL_THEN_COMPLETE = 3;

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
        onModalDismissed: PropTypes.func.isRequired,
    };

    static defaultProps = {
        show: false,
        channelType: Constants.OPEN_CHANNEL,
    };

    constructor(props) {
        super(props);
        this.state = {
            serverError: '',
            channelType: props.channelType || Constants.OPEN_CHANNEL,
            flowState: SHOW_NEW_CHANNEL,
            channelDisplayName: '',
            channelName: '',
            channelPurpose: '',
            channelHeader: '',
            nameModified: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        // If we are being shown, grab channel type from props and clear
        if (nextProps.show === true && this.props.show === false) {
            this.setState({
                serverError: '',
                channelType: nextProps.channelType,
                flowState: SHOW_NEW_CHANNEL,
                channelDisplayName: '',
                channelName: '',
                channelPurpose: '',
                channelHeader: '',
                nameModified: false,
            });
        }
    }

    onSubmit = () => {
        if (!this.state.channelDisplayName) {
            this.setState({serverError: Utils.localizeMessage('channel_flow.invalidName', 'Invalid Channel Name')});
            return;
        }

        if (this.state.channelName.length < 2) {
            this.setState({flowState: SHOW_EDIT_URL_THEN_COMPLETE});
            return;
        }

        const channel = {
            team_id: TeamStore.getCurrentId(),
            name: this.state.channelName,
            display_name: this.state.channelDisplayName,
            purpose: this.state.channelPurpose,
            header: this.state.channelHeader,
            type: this.state.channelType,
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
                if (err.id === 'model.channel.is_valid.2_or_more.app_error') {
                    this.setState({
                        flowState: SHOW_EDIT_URL_THEN_COMPLETE,
                        serverError: (
                            <FormattedMessage
                                id='channel_flow.handleTooShort'
                                defaultMessage='Channel URL must be 2 or more lowercase alphanumeric characters'
                            />
                        ),
                    });
                } else if (err.id === 'store.sql_channel.update.exists.app_error') {
                    this.setState({serverError: Utils.localizeMessage('channel_flow.alreadyExist', 'A channel with that URL already exists')});
                } else {
                    this.setState({serverError: err.message});
                }
            }
        );
    };

    onModalExited = () => {
        if (this.doOnModalExited) {
            this.doOnModalExited();
        }
    };

    typeSwitched = (e) => {
        e.preventDefault();

        let channelType = Constants.PRIVATE_CHANNEL;
        if (this.state.channelType === Constants.PRIVATE_CHANNEL) {
            channelType = Constants.OPEN_CHANNEL;
        }

        this.setState({
            channelType,
            serverError: '',
        });
    };

    urlChangeRequested = (e) => {
        if (e) {
            e.preventDefault();
        }
        this.setState({flowState: SHOW_EDIT_URL});
    };

    urlChangeSubmitted = (newURL) => {
        if (this.state.flowState === SHOW_EDIT_URL_THEN_COMPLETE) {
            this.setState({channelName: newURL, nameModified: true}, this.onSubmit);
        } else {
            this.setState({flowState: SHOW_NEW_CHANNEL, serverError: null, channelName: newURL, nameModified: true});
        }
    };

    urlChangeDismissed = () => {
        this.setState({flowState: SHOW_NEW_CHANNEL});
    };

    channelDataChanged = (data) => {
        this.setState({
            channelDisplayName: data.displayName,
            channelPurpose: data.purpose,
            channelHeader: data.header,
        });
        if (!this.state.nameModified) {
            this.setState({channelName: cleanUpUrlable(data.displayName.trim())});
        }
    };

    render() {
        const channelData = {
            name: this.state.channelName,
            displayName: this.state.channelDisplayName,
            purpose: this.state.channelPurpose,
            header: this.state.channelHeader,
        };

        let showChannelModal = false;
        let showGroupModal = false;
        let showChangeURLModal = false;

        let changeURLTitle = '';
        let changeURLSubmitButtonText = '';

        // Only listen to flow state if we are being shown
        if (this.props.show) {
            switch (this.state.flowState) {
            case SHOW_NEW_CHANNEL:
                if (this.state.channelType === Constants.OPEN_CHANNEL) {
                    showChannelModal = true;
                } else {
                    showGroupModal = true;
                }
                break;
            case SHOW_EDIT_URL:
                showChangeURLModal = true;
                changeURLTitle = (
                    <FormattedMessage
                        id='channel_flow.changeUrlTitle'
                        defaultMessage='Change Channel URL'
                    />
                );
                changeURLSubmitButtonText = changeURLTitle;
                break;
            case SHOW_EDIT_URL_THEN_COMPLETE:
                showChangeURLModal = true;
                changeURLTitle = (
                    <FormattedMessage
                        id='channel_flow.set_url_title'
                        defaultMessage='Set Channel URL'
                    />
                );
                changeURLSubmitButtonText = (
                    <FormattedMessage
                        id='channel_flow.create'
                        defaultMessage='Create Channel'
                    />
                );
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
