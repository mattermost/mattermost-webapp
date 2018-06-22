// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import Permissions from 'mattermost-redux/constants/permissions';

import {browserHistory} from 'utils/browser_history';
import {joinChannel, searchMoreChannels} from 'actions/channel_actions.jsx';

import {getRelativeChannelURL} from 'utils/url.jsx';

import SearchableChannelList from 'components/searchable_channel_list.jsx';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';

const CHANNELS_CHUNK_SIZE = 50;
const CHANNELS_PER_PAGE = 50;
const SEARCH_TIMEOUT_MILLISECONDS = 100;

export default class MoreChannels extends React.Component {
    static propTypes = {
        channels: PropTypes.array.isRequired,
        teamId: PropTypes.string.isRequired,
        teamName: PropTypes.string.isRequired,
        onModalDismissed: PropTypes.func,
        handleNewChannel: PropTypes.func,
        bodyOnly: PropTypes.bool,
        actions: PropTypes.shape({
            getChannels: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.searchTimeoutId = 0;

        this.state = {
            show: true,
            search: false,
            searchedChannels: [],
            serverError: null,
        };
    }

    componentDidMount() {
        this.props.actions.getChannels(this.props.teamId, 0, CHANNELS_CHUNK_SIZE * 2);
    }

    handleHide = () => {
        this.setState({show: false});

        if (this.props.bodyOnly) {
            this.handleExit();
        }
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
            searchedChannels: [],
            serverError: null,
        });
    }

    nextPage = (page) => {
        this.props.actions.getChannels(this.props.teamId, page + 1, CHANNELS_PER_PAGE);
    }

    handleJoin = (channel, done) => {
        joinChannel(
            channel,
            () => {
                browserHistory.push(getRelativeChannelURL(this.props.teamName, channel.name));
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
            this.setState({search: false, searchedChannels: []});
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
                        this.setState({search: true, searchedChannels: channels});
                    }
                );
            },
            SEARCH_TIMEOUT_MILLISECONDS
        );

        this.searchTimeoutId = searchTimeoutId;
    }

    render() {
        const {
            channels,
            teamId,
            bodyOnly,
        } = this.props;

        const {
            search,
            searchedChannels,
            serverError: serverErrorState,
            show,
        } = this.state;

        let serverError;
        if (serverErrorState) {
            serverError = <div className='form-group has-error'><label className='control-label'>{serverErrorState}</label></div>;
        }

        const createNewChannelButton = (
            <TeamPermissionGate
                teamId={teamId}
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
                teamId={teamId}
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

        const body = (
            <Modal.Body>
                <SearchableChannelList
                    channels={search ? searchedChannels : channels}
                    channelsPerPage={CHANNELS_PER_PAGE}
                    nextPage={this.nextPage}
                    isSearch={search}
                    search={this.search}
                    handleJoin={this.handleJoin}
                    noResultsText={createChannelHelpText}
                    createChannelButton={bodyOnly && createNewChannelButton}
                />
                {serverError}
            </Modal.Body>
        );

        if (bodyOnly) {
            return body;
        }

        return (
            <Modal
                dialogClassName='more-modal more-modal--action'
                show={show}
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
                {body}
            </Modal>
        );
    }
}
