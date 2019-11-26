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

import * as UserAgent from 'utils/user_agent';

const CHANNELS_CHUNK_SIZE = 50;
const CHANNELS_PER_PAGE = 50;
const SEARCH_TIMEOUT_MILLISECONDS = 100;

export default class MoveToChannelPostModal extends React.PureComponent {
    static propTypes = {
        channels: PropTypes.array.isRequired,
        archivedChannels: PropTypes.array.isRequired,
        currentUserId: PropTypes.string.isRequired,
        teamId: PropTypes.string.isRequired,
        currentChannelName: PropTypes.string.isRequired,
        teamName: PropTypes.string.isRequired,
        onModalDismissed: PropTypes.func,
        handleNewChannel: PropTypes.func,
        channelsRequestStarted: PropTypes.bool,
        bodyOnly: PropTypes.bool,
        canShowArchivedChannels: PropTypes.bool,
        shouldShowArchivedChannels: PropTypes.bool,
        morePublicChannelsModalType: PropTypes.string,
        shouldShowMoveToChannelPost : PropTypes.bool,
        post: PropTypes.object.isRequired,
        isRHS: PropTypes.bool,
        onHide: PropTypes.func.isRequired,
        actions: PropTypes.shape({
            getAllChannels: PropTypes.func.isRequired,
            moveToChannelPost: PropTypes.func.isRequired,
            removePost: PropTypes.func.isRequired,
            searchMoreChannels: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.searchTimeoutId = 0;

        this.state = {
            show: true,
            shouldShowArchivedChannels: false,
            shouldShowMoveToChannelPost: true,
            search: false,
            searchedChannels: [],
            serverError: null,
            searching: false,
            searchTerm: ''
        };
    }

    componentDidMount() {
        this.props.actions.getAllChannels(this.props.teamId, 0, CHANNELS_CHUNK_SIZE * 2);
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
        this.props.actions.getAllChannels(this.props.teamId, page + 1, CHANNELS_PER_PAGE);
    }

    handleJoin = (channel, done) => {
        const {actions, post} = this.props;
        Promise.all([
            actions.moveToChannelPost(post.id, channel.id),
            actions.removePost(post),
        ]).then(() => {
            this.onHide();
        });
    };

    onHide = () => {
        this.setState({show: false});

        if (!UserAgent.isMobile()) {
            var element;
            if (this.props.isRHS) {
                element = document.getElementById('reply_textbox');
            } else {
                element = document.getElementById('post_textbox');
            }
            if (element) {
                element.focus();
            }
        }

        if (this.props.bodyOnly) {
            this.handleExit();
        }
    }

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
                this.props.actions.searchMoreChannels(term, false).
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
        this.setState({searchedChannels: channels.filter((c) => c.delete_at === 0), searching: false});
    };

    toggleArchivedChannels = (shouldShowArchivedChannels) => {
        // search again when switching channels to update search results
        this.search(this.state.searchTerm);
        this.setState({shouldShowArchivedChannels});
    };

    render() {
        const {
            channels,
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
            shouldShowMoveToChannelPost
        } = this.state;

        let activeChannels;
        activeChannels = search ? searchedChannels : channels;


        let serverError;
        if (serverErrorState) {
            serverError = <div className='form-group has-error'><label className='control-label'>{serverErrorState}</label></div>;
        }

        const body = (
            <React.Fragment>
                <SearchableChannelList
                    channels={activeChannels}
                    channelsPerPage={CHANNELS_PER_PAGE}
                    nextPage={this.nextPage}
                    isSearch={search}
                    search={this.search}
                    handleJoin={this.handleJoin}
                    loading={search ? searching : channelsRequestStarted}
                    toggleArchivedChannels={this.toggleArchivedChannels}
                    shouldShowArchivedChannels={this.state.shouldShowArchivedChannels}
                    canShowArchivedChannels={this.props.canShowArchivedChannels}
                    shouldShowMoveToChannelPost={this.state.shouldShowMoveToChannelPost}
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
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
                role='dialog'
                id='moveToChannelPostModal'
                aria-labelledby='moreChannelsModalLabel'
            >
                <Modal.Header
                    id='moveToChannelPostModalHeader'
                    closeButton={true}
                >
                    <Modal.Title
                        componentClass='h1'
                        id='moreChannelsModalLabel'
                    >
                        <FormattedMessage
                            id='move_to_channel_post.title'
                            defaultMessage='Select Channel'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {body}
                </Modal.Body>
            </Modal>
        );
    }
}
