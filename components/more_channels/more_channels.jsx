// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import Permissions from 'mattermost-redux/constants/permissions';

import {browserHistory} from 'utils/browser_history';
import {joinChannel, searchMoreChannels} from 'actions/channel_actions.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import TeamStore from 'stores/team_store.jsx';

import SearchableChannelList from 'components/searchable_channel_list.jsx';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';

const CHANNELS_CHUNK_SIZE = 50;
const CHANNELS_PER_PAGE = 50;
const SEARCH_TIMEOUT_MILLISECONDS = 100;

export default class MoreChannels extends React.Component {
    static propTypes = {
        onModalDismissed: PropTypes.func,
        handleNewChannel: PropTypes.func,
        actions: PropTypes.shape({
            getChannels: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

        this.searchTimeoutId = 0;

        this.state = {
            show: true,
            search: false,
            channels: null,
            serverError: null,
        };
    }

    componentDidMount() {
        ChannelStore.addChangeListener(this.onChange);
        this.props.actions.getChannels(TeamStore.getCurrentId(), 0, CHANNELS_CHUNK_SIZE * 2);
    }

    componentWillUnmount() {
        ChannelStore.removeChangeListener(this.onChange);
    }

    handleHide = () => {
        this.setState({show: false});
    }

    handleExit = () => {
        if (this.props.onModalDismissed) {
            this.props.onModalDismissed();
        }
    }

    onChange = (force) => {
        if (this.state.search && !force) {
            return;
        }

        this.setState({
            channels: ChannelStore.getMoreChannelsList(),
            serverError: null,
        });
    }

    nextPage = (page) => {
        this.props.actions.getChannels(TeamStore.getCurrentId(), page + 1, CHANNELS_PER_PAGE);
    }

    handleJoin = (channel, done) => {
        joinChannel(
            channel,
            () => {
                browserHistory.push(TeamStore.getCurrentTeamRelativeUrl() + '/channels/' + channel.name);
                if (done) {
                    done();
                }

                this.handleHide();
            },
            (err) => {
                this.setState({serverError: err.message});
                if (done) {
                    done();
                }
            }
        );
    }

    search = (term) => {
        clearTimeout(this.searchTimeoutId);

        if (term === '') {
            this.onChange(true);
            this.setState({search: false});
            this.searchTimeoutId = '';
            return;
        }

        const searchTimeoutId = setTimeout(
            () => {
                searchMoreChannels(
                    term,
                    (channels) => {
                        if (searchTimeoutId !== this.searchTimeoutId) {
                            return;
                        }
                        this.setState({search: true, channels});
                    }
                );
            },
            SEARCH_TIMEOUT_MILLISECONDS
        );

        this.searchTimeoutId = searchTimeoutId;
    }

    render() {
        let serverError;
        if (this.state.serverError) {
            serverError = <div className='form-group has-error'><label className='control-label'>{this.state.serverError}</label></div>;
        }

        const createNewChannelButton = (
            <TeamPermissionGate
                teamId={TeamStore.getCurrentId()}
                permissions={[Permissions.CREATE_PUBLIC_CHANNEL]}
            >
                <button
                    id='createNewChannel'
                    type='button'
                    className='btn btn-primary channel-create-btn'
                    onClick={this.props.handleNewChannel}
                >
                    <FormattedMessage
                        id='more_channels.create'
                        defaultMessage='Create New Channel'
                    />
                </button>
            </TeamPermissionGate>
        );

        const createChannelHelpText = (
            <TeamPermissionGate
                teamId={TeamStore.getCurrentId()}
                permissions={[Permissions.CREATE_PUBLIC_CHANNEL]}
            >
                <p className='secondary-message'>
                    <FormattedMessage
                        id='more_channels.createClick'
                        defaultMessage="Click 'Create New Channel' to make a new one"
                    />
                </p>
            </TeamPermissionGate>
        );

        return (
            <Modal
                dialogClassName='more-modal more-modal--action'
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleExit}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='more_channels.title'
                            defaultMessage='More Channels'
                        />
                    </Modal.Title>
                    {createNewChannelButton}
                </Modal.Header>
                <Modal.Body>
                    <SearchableChannelList
                        channels={this.state.channels}
                        channelsPerPage={CHANNELS_PER_PAGE}
                        nextPage={this.nextPage}
                        isSearch={this.state.search}
                        search={this.search}
                        handleJoin={this.handleJoin}
                        noResultsText={createChannelHelpText}
                    />
                    {serverError}
                </Modal.Body>
            </Modal>
        );
    }
}
