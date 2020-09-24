// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants';
import {localizeMessage, compareChannels} from 'utils/utils.jsx';

import MultiSelect from 'components/multiselect/multiselect';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

const CHANNELS_PER_PAGE = 50;

export default class ChannelSelectorModal extends React.PureComponent {
    static propTypes = {
        searchTerm: PropTypes.string.isRequired,
        onModalDismissed: PropTypes.func,
        onChannelsSelected: PropTypes.func,
        groupID: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            loadChannels: PropTypes.func.isRequired,
            setModalSearchTerm: PropTypes.func.isRequired,
            searchAllChannels: PropTypes.func.isRequired,
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
            channels: [],
        };

        this.selectedItemRef = React.createRef();
    }

    componentDidMount() {
        this.props.actions.loadChannels(0, CHANNELS_PER_PAGE + 1, this.props.groupID, false).then((response) => {
            this.setState({channels: response.data.sort(compareChannels)});
            this.setChannelsLoadingState(false);
        });
    }

    componentDidUpdate(prevProps) { // eslint-disable-line camelcase
        if (prevProps.searchTerm !== this.props.searchTerm) {
            clearTimeout(this.searchTimeoutId);

            const searchTerm = this.props.searchTerm;
            if (searchTerm === '') {
                this.props.actions.loadChannels(0, CHANNELS_PER_PAGE + 1, this.props.groupID, false).then((response) => {
                    this.setState({channels: response.data.sort(compareChannels)});
                    this.setChannelsLoadingState(false);
                });
            } else {
                this.searchTimeoutId = setTimeout(
                    async () => {
                        this.setChannelsLoadingState(true);
                        const response = await this.props.actions.searchAllChannels(searchTerm, {not_associated_to_group: this.props.groupID});
                        this.setState({channels: response.data});
                        this.setChannelsLoadingState(false);
                    },
                    Constants.SEARCH_TIMEOUT_MILLISECONDS,
                );
            }
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

    addValue = (value) => {
        const values = Object.assign([], this.state.values);
        if (value && value.id && values.findIndex((v) => v.id === value.id) === -1) {
            values.push(value);
        }

        this.setState({values});
    }

    setChannelsLoadingState = (loadingState) => {
        this.setState({
            loadingChannels: loadingState,
        });
    }

    handlePageChange = (page, prevPage) => {
        if (page > prevPage) {
            this.setChannelsLoadingState(true);
            this.props.actions.loadChannels(page, CHANNELS_PER_PAGE + 1, this.props.groupID, false).then((response) => {
                const newState = [...this.state.channels];
                const stateChannelIDs = this.state.channels.map((stateChannel) => stateChannel.id);
                response.data.forEach((serverChannel) => {
                    if (!stateChannelIDs.includes(serverChannel.id)) {
                        newState.push(serverChannel);
                    }
                });
                this.setState({channels: newState.sort(compareChannels)});
                this.setChannelsLoadingState(false);
            });
        }
    }

    handleDelete = (values) => {
        this.setState({values});
    }

    search = (term, multiselectComponent) => {
        if (multiselectComponent.state.page !== 0) {
            multiselectComponent.setState({page: 0});
        }
        this.props.actions.setModalSearchTerm(term);
    }

    renderOption = (option, isSelected, onAdd, onMouseMove) => {
        let rowSelected = '';
        if (isSelected) {
            rowSelected = 'more-modal__row--selected';
        }

        return (
            <div
                key={option.id}
                ref={isSelected ? this.selectedItemRef : option.id}
                className={'more-modal__row clickable ' + rowSelected}
                onClick={() => onAdd(option)}
                onMouseMove={() => onMouseMove(option)}
            >
                <div
                    className='more-modal__details'
                >
                    {option.type === Constants.PRIVATE_CHANNEL &&
                        <i className='icon icon-lock-outline'/>}
                    {option.type === Constants.OPEN_CHANNEL &&
                        <i className='icon icon-globe'/>}
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

    render() {
        const numRemainingText = (
            <FormattedMessage
                id='multiselect.selectChannels'
                defaultMessage='Use ↑↓ to browse, ↵ to select.'
            />
        );

        const buttonSubmitText = localizeMessage('multiselect.add', 'Add');

        return (
            <Modal
                dialogClassName={'a11y__modal more-modal more-direct-channels channel-selector-modal'}
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleExit}
                role='dialog'
                aria-labelledby='channelSelectorModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='channelSelectorModalLabel'
                    >
                        <FormattedMarkdownMessage
                            id='add_channels_to_scheme.title'
                            defaultMessage='Add Channels to **Channel Selection** List'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <MultiSelect
                        key='addChannelsToSchemeKey'
                        options={this.state.channels}
                        optionRenderer={this.renderOption}
                        selectedItemRef={this.selectedItemRef}
                        values={this.state.values}
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
                        placeholderText={localizeMessage('multiselect.addChannelsPlaceholder', 'Search and add channels')}
                    />
                </Modal.Body>
            </Modal>
        );
    }
}
