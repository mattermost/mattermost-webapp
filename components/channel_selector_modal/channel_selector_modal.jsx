// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import {localizeMessage, compareChannels} from 'utils/utils.jsx';

import MultiSelect from 'components/multiselect/multiselect.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import GlobeIcon from 'components/svg/globe_icon';
import LockIcon from 'components/svg/lock_icon';

const CHANNELS_PER_PAGE = 50;

export default class ChannelSelectorModal extends React.Component {
    static propTypes = {
        alreadySelected: PropTypes.array,
        searchTerm: PropTypes.string.isRequired,
        channels: PropTypes.array.isRequired,
        onModalDismissed: PropTypes.func,
        onChannelsSelected: PropTypes.func,
        excludeNames: PropTypes.arrayOf(PropTypes.string),
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
            excludeNames: [],
        };
    }

    componentDidMount() {
        this.props.actions.loadChannels(0, CHANNELS_PER_PAGE * 2).then(() => {
            this.setChannelsLoadingState(false);
        });
    }

    componentDidUpdate(prevProps) { // eslint-disable-line camelcase
        if (prevProps.searchTerm !== this.props.searchTerm) {
            clearTimeout(this.searchTimeoutId);

            const searchTerm = this.props.searchTerm;
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
            this.props.actions.loadChannels(page, CHANNELS_PER_PAGE).then(() => {
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
        let rowSelected = '';
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
                    {option.type === 'P' &&
                        <LockIcon className='icon icon__lock'/>}
                    {option.type === 'O' &&
                        <GlobeIcon className='icon icon__globe'/>}
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

        let channels = [];
        if (this.props.channels) {
            channels = this.props.channels.filter((channel) => {
                return (
                    (channel.delete_at === 0) &&
                    (channel.scheme_id !== this.currentSchemeId) &&
                    (this.props.alreadySelected.indexOf(channel.id) === -1) &&
                    (this.props.excludeNames.indexOf(channel.name) === -1)
                );
            });
            channels.sort(compareChannels);
        }

        return (
            <Modal
                dialogClassName={'more-modal more-direct-channels channel-selector-modal'}
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
                            defaultMessage='Add Channels To **Channel Selection** List'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <MultiSelect
                        key='addChannelsToSchemeKey'
                        options={channels}
                        optionRenderer={this.renderOption}
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
