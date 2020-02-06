// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import Permissions from 'mattermost-redux/constants/permissions';

import {browserHistory} from 'utils/browser_history';

import {getRelativeChannelURL} from 'utils/url';

import SearchableChannelList from 'components/searchable_channel_list.jsx';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';

const CHANNELS_CHUNK_SIZE = 50;
const CHANNELS_PER_PAGE = 50;
const SEARCH_TIMEOUT_MILLISECONDS = 100;

export default class MoreChannels extends React.Component {
    static propTypes = {
        channels: PropTypes.array.isRequired,
        archivedChannels: PropTypes.array.isRequired,
        currentUserId: PropTypes.string.isRequired,
        teamId: PropTypes.string.isRequired,
        teamName: PropTypes.string.isRequired,
        onModalDismissed: PropTypes.func,
        handleNewChannel: PropTypes.func,
        channelsRequestStarted: PropTypes.bool,
        bodyOnly: PropTypes.bool,
        canShowArchivedChannels: PropTypes.bool,
        morePublicChannelsModalType: PropTypes.string,
        actions: PropTypes.shape({
            getChannels: PropTypes.func.isRequired,
            getArchivedChannels: PropTypes.func.isRequired,
            joinChannel: PropTypes.func.isRequired,
            searchMoreChannels: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.searchTimeoutId = 0;

        this.state = {
            show: true,
            shouldShowArchivedChannels: this.props.morePublicChannelsModalType === 'private',
            search: false,
            searchedChannels: [],
            serverError: null,
            searching: false,
            searchTerm: '',
        };
    }

    componentDidMount() {
        this.props.actions.getChannels(this.props.teamId, 0, CHANNELS_CHUNK_SIZE * 2);
        if (this.props.canShowArchivedChannels) {
            this.props.actions.getArchivedChannels(this.props.teamId, 0, CHANNELS_CHUNK_SIZE * 2);
        }
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
        const {actions, currentUserId, teamId, teamName} = this.props;
        actions.joinChannel(currentUserId, teamId, channel.id).then((result) => {
            if (result.error) {
                this.setState({serverError: result.error.message});
            } else {
                browserHistory.push(getRelativeChannelURL(teamName, channel.name));
                this.handleHide();
            }

            if (done) {
                done();
            }
        });
    };

    search = (term) => {
        clearTimeout(this.searchTimeoutId);

        if (term === '') {
            this.onChange(true);
            this.setState({search: false, searchedChannels: [], searching: false, searchTerm: term});
            this.searchTimeoutId = '';
            return;
        }
        this.setState({search: true, searching: true, searchTerm: term});

        const searchTimeoutId = setTimeout(
            () => {
                this.props.actions.searchMoreChannels(term, this.state.shouldShowArchivedChannels).
                    then((result) => {
                        if (searchTimeoutId !== this.searchTimeoutId) {
                            return;
                        }

                        if (result.data) {
                            this.setSearchResults(result.data);
                        } else {
                            this.setState({searchedChannels: [], searching: false});
                        }
                    }).
                    catch(() => {
                        this.setState({searchedChannels: [], searching: false});
                    });
            },
            SEARCH_TIMEOUT_MILLISECONDS
        );

        this.searchTimeoutId = searchTimeoutId;
    };

    setSearchResults = (channels) => {
        this.setState({searchedChannels: this.state.shouldShowArchivedChannels ? channels.filter((c) => c.delete_at !== 0) : channels.filter((c) => c.delete_at === 0), searching: false});
    };

    toggleArchivedChannels = (shouldShowArchivedChannels) => {
        // search again when switching channels to update search results
        this.search(this.state.searchTerm);
        this.setState({shouldShowArchivedChannels});
    };

    render() {
        const {
            channels,
            archivedChannels,
            teamId,
            channelsRequestStarted,
            bodyOnly,
        } = this.props;

        const {
            search,
            searchedChannels,
            serverError: serverErrorState,
            show,
            searching,
            shouldShowArchivedChannels,
        } = this.state;

        let activeChannels;

        if (shouldShowArchivedChannels) {
            activeChannels = search ? searchedChannels : archivedChannels;
        } else {
            activeChannels = search ? searchedChannels : channels;
        }

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
                        defaultMessage='Create Channel'
                    />
                </button>
            </TeamPermissionGate>
        );

        const createChannelHelpText = (
            <TeamPermissionGate
                teamId={teamId}
                permissions={[Permissions.CREATE_PUBLIC_CHANNEL, Permissions.CREATE_PRIVATE_CHANNEL]}
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
            <React.Fragment>
                <SearchableChannelList
                    channels={activeChannels}
                    channelsPerPage={CHANNELS_PER_PAGE}
                    nextPage={this.nextPage}
                    isSearch={search}
                    search={this.search}
                    handleJoin={this.handleJoin}
                    noResultsText={createChannelHelpText}
                    loading={search ? searching : channelsRequestStarted}
                    createChannelButton={bodyOnly && createNewChannelButton}
                    toggleArchivedChannels={this.toggleArchivedChannels}
                    shouldShowArchivedChannels={this.state.shouldShowArchivedChannels}
                    canShowArchivedChannels={this.props.canShowArchivedChannels}
                />
                {serverError}
            </React.Fragment>
        );

        if (bodyOnly) {
            return body;
        }

        return (
            <Modal
                dialogClassName='a11y__modal more-modal more-modal--action'
                show={show}
                onHide={this.handleHide}
                onExited={this.handleExit}
                role='dialog'
                id='moreChannelsModal'
                aria-labelledby='moreChannelsModalLabel'
            >
                <Modal.Header
                    id='moreChannelsModalHeader'
                    closeButton={true}
                >
                    <Modal.Title
                        componentClass='h1'
                        id='moreChannelsModalLabel'
                    >
                        <FormattedMessage
                            id='more_channels.title'
                            defaultMessage='More Channels'
                        />
                    </Modal.Title>
                    {createNewChannelButton}
                </Modal.Header>
                <Modal.Body>
                    {body}
                </Modal.Body>
            </Modal>
        );
    }
}
