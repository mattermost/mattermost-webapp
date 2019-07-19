// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import LoadingScreen from 'components/loading_screen';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper.jsx';
import QuickInput from 'components/quick_input';
import * as UserAgent from 'utils/user_agent.jsx';
import {localizeMessage} from 'utils/utils.jsx';
import LocalizedInput from 'components/localized_input/localized_input';

import {t} from 'utils/i18n';

const NEXT_BUTTON_TIMEOUT_MILLISECONDS = 500;

export default class SearchableChannelList extends React.Component {
    constructor(props) {
        super(props);

        this.createChannelRow = this.createChannelRow.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.doSearch = this.doSearch.bind(this);

        this.nextTimeoutId = 0;

        this.state = {
            joiningChannel: '',
            page: 0,
            nextDisabled: false,
        };
    }

    componentDidMount() {
        // only focus the search box on desktop so that we don't cause the keyboard to open on mobile
        if (!UserAgent.isMobile() && this.refs.filter) {
            this.refs.filter.focus();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.page !== this.state.page) {
            $(this.refs.channelList).scrollTop(0);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (nextProps.isSearch && !this.props.isSearch) {
            this.setState({page: 0});
        }
    }

    handleJoin(channel) {
        this.setState({joiningChannel: channel.id});
        this.props.handleJoin(
            channel,
            () => {
                this.setState({joiningChannel: ''});
            }
        );
    }

    createChannelRow(channel) {
        const ariaLabel = `${channel.display_name}, ${channel.purpose}`.toLowerCase();

        return (
            <div
                className='more-modal__row'
                key={channel.id}
            >
                <div className='more-modal__details'>
                    <button
                        onClick={this.handleJoin.bind(this, channel)}
                        aria-label={ariaLabel}
                        className='style--none more-modal__name'
                    >
                        {channel.display_name}
                    </button>
                    <p className='more-modal__description'>{channel.purpose}</p>
                </div>
                <div className='more-modal__actions'>
                    <button
                        onClick={this.handleJoin.bind(this, channel)}
                        className='btn btn-primary'
                        disabled={this.state.joiningChannel}
                    >
                        <LoadingWrapper
                            loading={this.state.joiningChannel === channel.id}
                            text={localizeMessage('more_channels.joining', 'Joining...')}
                        >
                            <FormattedMessage
                                id='more_channels.join'
                                defaultMessage='Join'
                            />
                        </LoadingWrapper>
                    </button>
                </div>
            </div>
        );
    }

    nextPage(e) {
        e.preventDefault();
        this.setState({page: this.state.page + 1, nextDisabled: true});
        this.nextTimeoutId = setTimeout(() => this.setState({nextDisabled: false}), NEXT_BUTTON_TIMEOUT_MILLISECONDS);
        this.props.nextPage(this.state.page + 1);
        $(ReactDOM.findDOMNode(this.refs.channelListScroll)).scrollTop(0);
    }

    previousPage(e) {
        e.preventDefault();
        this.setState({page: this.state.page - 1});
        $(ReactDOM.findDOMNode(this.refs.channelListScroll)).scrollTop(0);
    }

    doSearch() {
        const term = this.refs.filter.value;
        this.props.search(term);
        if (term === '') {
            this.setState({page: 0});
        }
    }

    render() {
        const channels = this.props.channels;
        let listContent;
        let nextButton;
        let previousButton;

        if (this.props.loading && channels.length === 0) {
            listContent = <LoadingScreen style={{marginTop: '50%'}}/>;
        } else if (channels.length === 0) {
            listContent = (
                <div className='no-channel-message'>
                    <p className='primary-message'>
                        <FormattedMessage
                            id='more_channels.noMore'
                            defaultMessage='No more channels to join'
                        />
                    </p>
                    {this.props.noResultsText}
                </div>
            );
        } else {
            const pageStart = this.state.page * this.props.channelsPerPage;
            const pageEnd = pageStart + this.props.channelsPerPage;
            const channelsToDisplay = this.props.channels.slice(pageStart, pageEnd);
            listContent = channelsToDisplay.map(this.createChannelRow);

            if (channelsToDisplay.length >= this.props.channelsPerPage && pageEnd < this.props.channels.length) {
                nextButton = (
                    <button
                        className='btn btn-link filter-control filter-control__next'
                        onClick={this.nextPage}
                        disabled={this.state.nextDisabled}
                    >
                        <FormattedMessage
                            id='more_channels.next'
                            defaultMessage='Next'
                        />
                    </button>
                );
            }

            if (this.state.page > 0) {
                previousButton = (
                    <button
                        className='btn btn-link filter-control filter-control__prev'
                        onClick={this.previousPage}
                    >
                        <FormattedMessage
                            id='more_channels.prev'
                            defaultMessage='Previous'
                        />
                    </button>
                );
            }
        }

        let input = (
            <div className='filter-row filter-row--full'>
                <div className='col-sm-12'>
                    <QuickInput
                        id='searchChannelsTextbox'
                        ref='filter'
                        className='form-control filter-textbox'
                        placeholder={{id: t('filtered_channels_list.search'), defaultMessage: 'Search channels'}}
                        inputComponent={LocalizedInput}
                        onInput={this.doSearch}
                    />
                </div>
            </div>
        );

        if (this.props.createChannelButton) {
            input = (
                <div className='channel_search'>
                    <div className='search_input'>
                        <QuickInput
                            id='searchChannelsTextbox'
                            ref='filter'
                            className='form-control filter-textbox'
                            placeholder={{id: t('filtered_channels_list.search'), defaultMessage: 'Search channels'}}
                            inputComponent={LocalizedInput}
                            onInput={this.doSearch}
                        />
                    </div>
                    <div className='create_button'>
                        {this.props.createChannelButton}
                    </div>
                </div>
            );
        }

        return (
            <div className='filtered-user-list'>
                {input}
                <div
                    role='application'
                    ref='channelList'
                    className='more-modal__list'
                >
                    <div ref='channelListScroll'>
                        {listContent}
                    </div>
                </div>
                <div className='filter-controls'>
                    {previousButton}
                    {nextButton}
                </div>
            </div>
        );
    }
}

SearchableChannelList.defaultProps = {
    channels: [],
    isSearch: false,
};

SearchableChannelList.propTypes = {
    channels: PropTypes.arrayOf(PropTypes.object),
    channelsPerPage: PropTypes.number,
    nextPage: PropTypes.func.isRequired,
    isSearch: PropTypes.bool,
    search: PropTypes.func.isRequired,
    handleJoin: PropTypes.func.isRequired,
    noResultsText: PropTypes.object,
    loading: PropTypes.bool,
    createChannelButton: PropTypes.element,
};
