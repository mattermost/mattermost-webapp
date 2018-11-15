// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';

import MultiSelect from 'components/multiselect/multiselect.jsx';
import ConfirmModal from 'components/confirm_modal.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

const CHANNELS_PER_PAGE = 50;

export default class ChannelSelectorModal extends React.Component {
    static propTypes = {
        currentSchemeId: PropTypes.string,
        alreadySelected: PropTypes.array,
        searchTerm: PropTypes.string.isRequired,
        channels: PropTypes.array.isRequired,
        onModalDismissed: PropTypes.func,
        onChannelsSelected: PropTypes.func,
        actions: PropTypes.shape({
            loadChannels: PropTypes.func.isRequired,
            setModalSearchTerm: PropTypes.func.isRequired,
            searchChannels: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.searchTimeoutId = 0;

        this.state = {
            values: [],
            show: true,
            search: false,
            loadingChannels: true,
            confirmAddModal: false,
            confirmAddChannel: null,
        };
    }

    componentDidMount() {
        this.props.actions.loadChannels(0, CHANNELS_PER_PAGE * 2).then(() => {
            this.setChannelsLoadingState(false);
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.searchTerm !== nextProps.searchTerm) {
            clearTimeout(this.searchTimeoutId);

            const searchTerm = nextProps.searchTerm;
            if (searchTerm === '') {
                return;
            }

            this.searchTimeoutId = setTimeout(
                async () => {
                    this.setChannelsLoadingState(true);
                    await this.props.actions.searchChannels(searchTerm);
                    this.setChannelsLoadingState(false);
                },
                Constants.SEARCH_TIMEOUT_MILLISECONDS
            );
        }
    }

    handleHide = () => {
        this.props.actions.setModalSearchTerm('');
        this.setState({show: false});
    }

    handleExit = () => {
        if (this.props.onModalDismissed) {
            this.props.onModalDismissed();
        }
    }

    handleSubmit = (e) => {
        if (e) {
            e.preventDefault();
        }

        if (this.state.values.length === 0) {
            return;
        }

        this.props.onChannelsSelected(this.state.values);
        this.handleHide();
    }

    addValue = (value, confirmed = false) => {
        if (value.scheme_id !== null && value.scheme_id !== '' && !confirmed) {
            this.setState({confirmAddModal: true, confirmAddChannel: value});
            return;
        }
        const values = Object.assign([], this.state.values);
        const channelIds = values.map((v) => v.id);
        if (value && value.id && channelIds.indexOf(value.id) === -1) {
            values.push(value);
        }

        this.setState({values, confirmAddModal: false, confirmAddChannel: null});
    }

    setChannelsLoadingState = (loadingState) => {
        this.setState({
            loadingChannels: loadingState,
        });
    }

    handlePageChange = (page, prevPage) => {
        if (page > prevPage) {
            this.setChannelsLoadingState(true);
            this.props.actions.loadChannels(page + 1, CHANNELS_PER_PAGE).then(() => {
                this.setChannelsLoadingState(false);
            });
        }
    }

    handleDelete = (values) => {
        this.setState({values});
    }

    search = (term) => {
        this.props.actions.setModalSearchTerm(term);
    }

    renderOption(option, isSelected, onAdd) {
        var rowSelected = '';
        if (isSelected) {
            rowSelected = 'more-modal__row--selected';
        }

        return (
            <div
                key={option.id}
                ref={isSelected ? 'selected' : option.id}
                className={'more-modal__row clickable ' + rowSelected}
                onClick={() => onAdd(option)}
            >
                <div
                    className='more-modal__details'
                >
                    <span className='channel-name'>{option.display_name}</span>
                    <span className='team-name'>{'(' + option.team_display_name + ')'}</span>
                </div>
                <div className='more-modal__actions'>
                    <div className='more-modal__actions--round'>
                        <i className='fa fa-plus'/>
                    </div>
                </div>
            </div>
        );
    }

    renderValue(props) {
        return props.data.display_name + ' (' + props.data.team_display_name + ')';
    }

    renderConfirmModal(show, channel) {
        const title = (
            <FormattedMessage
                id='add_channels_to_scheme.confirmation.title'
                defaultMessage='Channel Override Scheme Change?'
            />
        );
        const message = (
            <FormattedMessage
                id='add_channels_to_scheme.confirmation.message'
                defaultMessage='This channel is already selected in another channel scheme, are you sure you want to move it to this channel scheme?'
            />
        );
        const confirmButtonText = (
            <FormattedMessage
                id='add_channels_to_scheme.confirmation.accept'
                defaultMessage='Yes, Move Channel'
            />
        );
        return (
            <ConfirmModal
                show={show}
                title={title}
                message={message}
                confirmButtonText={confirmButtonText}
                onCancel={() => this.setState({confirmAddModal: false, confirmAddChannel: null})}
                onConfirm={() => this.addValue(channel, true)}
            />
        );
    }

    render() {
        const confirmModal = this.renderConfirmModal(this.state.confirmAddModal, this.state.confirmAddChannel);
        const numRemainingText = (
            <FormattedMessage
                id='multiselect.selectChannels'
                defaultMessage='Use ↑↓ to browse, ↵ to select.'
            />
        );

        const buttonSubmitText = localizeMessage('multiselect.add', 'Add');

        let channels = [];
        if (this.props.channels) {
            channels = this.props.channels.filter((channel) => channel.delete_at === 0);
            channels = channels.filter((channel) => channel.scheme_id !== this.currentSchemeId);
            channels = channels.filter((channel) => this.props.alreadySelected.indexOf(channel.id) === -1);
            channels.sort((a, b) => {
                const aName = a.display_name.toUpperCase();
                const bName = b.display_name.toUpperCase();
                if (aName === bName) {
                    return 0;
                }
                if (aName > bName) {
                    return 1;
                }
                return -1;
            });
        }

        return (
            <Modal
                dialogClassName={'more-modal more-direct-channels channel-selector-modal'}
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleExit}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMarkdownMessage
                            id='add_channels_to_scheme.title'
                            defaultMessage='Add Channels To **Channel Selection** List'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {confirmModal}
                    <MultiSelect
                        key='addChannelsToSchemeKey'
                        options={channels}
                        optionRenderer={this.renderOption}
                        values={this.state.values}
                        valueKey='id'
                        valueRenderer={this.renderValue}
                        perPage={CHANNELS_PER_PAGE}
                        handlePageChange={this.handlePageChange}
                        handleInput={this.search}
                        handleDelete={this.handleDelete}
                        handleAdd={this.addValue}
                        handleSubmit={this.handleSubmit}
                        numRemainingText={numRemainingText}
                        buttonSubmitText={buttonSubmitText}
                        saving={false}
                        loading={this.state.loadingChannels}
                    />
                </Modal.Body>
            </Modal>
        );
    }
}
