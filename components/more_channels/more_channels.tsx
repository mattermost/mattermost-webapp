// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';
import {ActionFunc, ActionResult} from 'mattermost-redux/types/actions';
import Permissions from 'mattermost-redux/constants/permissions';

import {browserHistory} from 'utils/browser_history';

import {getRelativeChannelURL} from 'utils/url';

import NewChannelFlow from 'components/new_channel_flow';
import SearchableChannelList from 'components/searchable_channel_list.jsx';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import {ModalIdentifiers} from 'utils/constants';

const CHANNELS_CHUNK_SIZE = 50;
const CHANNELS_PER_PAGE = 50;
const SEARCH_TIMEOUT_MILLISECONDS = 100;

type Actions = {
    getChannels: (teamId: string, page: number, perPage: number) => ActionFunc | void;
    getArchivedChannels: (teamId: string, page: number, channelsPerPage: number) => ActionFunc | void;
    joinChannel: (currentUserId: string, teamId: string, channelId: string) => Promise<ActionResult>;
    searchMoreChannels: (term: string, shouldShowArchivedChannels: boolean) => Promise<ActionResult>;
    openModal: (modalData: {modalId: string; dialogType: any; dialogProps?: any}) => Promise<{
        data: boolean;
    }>;
    closeModal: (modalId: string) => void;
}

export type Props = {
    channels: Channel[];
    archivedChannels: Channel[];
    currentUserId: string;
    teamId: string;
    teamName: string;
    channelsRequestStarted?: boolean;
    bodyOnly?: boolean;
    canShowArchivedChannels?: boolean;
    morePublicChannelsModalType?: string;
    actions: Actions;
}

type State = {
    show: boolean;
    shouldShowArchivedChannels: boolean;
    search: boolean;
    searchedChannels: Channel[];
    serverError: React.ReactNode | string;
    searching: boolean;
    searchTerm: string;
}

export default class MoreChannels extends React.PureComponent<Props, State> {
    public searchTimeoutId: number;

    constructor(props: Props) {
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

    handleNewChannel = () => {
        this.handleExit();
        this.props.actions.openModal({
            modalId: ModalIdentifiers.NEW_CHANNEL_FLOW,
            dialogType: NewChannelFlow,
        });
    }

    handleExit = () => {
        this.props.actions.closeModal(ModalIdentifiers.MORE_CHANNELS);
    }

    onChange = (force: boolean) => {
        if (this.state.search && !force) {
            return;
        }

        this.setState({
            searchedChannels: [],
            serverError: null,
        });
    }

    nextPage = (page: number) => {
        this.props.actions.getChannels(this.props.teamId, page + 1, CHANNELS_PER_PAGE);
    }

    handleJoin = async (channel: Channel, done: () => void) => {
        const {actions, currentUserId, teamId, teamName} = this.props;
        const result = await actions.joinChannel(currentUserId, teamId, channel.id) as { error: any };

        if (result.error) {
            this.setState({serverError: result.error.message});
        } else {
            browserHistory.push(getRelativeChannelURL(teamName, channel.name));
            this.handleHide();
        }

        if (done) {
            done();
        }
    }

    search = (term: string) => {
        clearTimeout(this.searchTimeoutId);

        if (term === '') {
            this.onChange(true);
            this.setState({search: false, searchedChannels: [], searching: false, searchTerm: term});
            this.searchTimeoutId = 0;
            return;
        }
        this.setState({search: true, searching: true, searchTerm: term});

        const searchTimeoutId = window.setTimeout(
            async () => {
                try {
                    const {data} = await this.props.actions.searchMoreChannels(term, this.state.shouldShowArchivedChannels) as { data: any };
                    if (searchTimeoutId !== this.searchTimeoutId) {
                        return;
                    }

                    if (data) {
                        this.setSearchResults(data);
                    } else {
                        this.setState({searchedChannels: [], searching: false});
                    }
                } catch (ignoredErr) {
                    this.setState({searchedChannels: [], searching: false});
                }
            },
            SEARCH_TIMEOUT_MILLISECONDS,
        );

        this.searchTimeoutId = searchTimeoutId;
    }

    setSearchResults = (channels: Channel[]) => {
        this.setState({searchedChannels: this.state.shouldShowArchivedChannels ? channels.filter((c) => c.delete_at !== 0) : channels.filter((c) => c.delete_at === 0), searching: false});
    }

    toggleArchivedChannels = (shouldShowArchivedChannels: boolean) => {
        // search again when switching channels to update search results
        this.search(this.state.searchTerm);
        this.setState({shouldShowArchivedChannels});
    }

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
            serverError =
                <div className='form-group has-error'><label className='control-label'>{serverErrorState}</label></div>;
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
                    onClick={this.handleNewChannel}
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
