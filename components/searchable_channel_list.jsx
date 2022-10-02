// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {AccountOutlineIcon, ArchiveOutlineIcon, DotsHorizontalIcon, GlobeIcon, LockIcon} from '@mattermost/compass-icons/components';

import {isPrivateChannel} from 'mattermost-redux/utils/channel_utils';

import LoadingScreen from 'components/loading_screen';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';
import QuickInput from 'components/quick_input';
import LocalizedInput from 'components/localized_input/localized_input';

import {t} from 'utils/i18n';
import * as UserAgent from 'utils/user_agent';
import {localizeMessage, localizeAndFormatMessage} from 'utils/utils';
import {isArchivedChannel} from 'utils/channel_utils';

import MenuWrapper from './widgets/menu/menu_wrapper';
import Menu from './widgets/menu/menu';

const NEXT_BUTTON_TIMEOUT_MILLISECONDS = 500;

// todo sinan check typescript migration PR. If it is converted transfer your changes to TS file
export default class SearchableChannelList extends React.PureComponent {
    static getDerivedStateFromProps(props, state) {
        return {isSearch: props.isSearch, page: props.isSearch && !state.isSearch ? 0 : state.page};
    }

    constructor(props) {
        super(props);

        this.nextTimeoutId = 0;

        this.state = {
            joiningChannel: '',
            page: 0,
            nextDisabled: false,
        };

        this.filter = React.createRef();
        this.channelListScroll = React.createRef();
    }

    componentDidMount() {
        // only focus the search box on desktop so that we don't cause the keyboard to open on mobile
        if (!UserAgent.isMobile() && this.filter.current) {
            this.filter.current.focus();
        }
    }

    handleJoin(channel) {
        this.setState({joiningChannel: channel.id});
        this.props.handleJoin(
            channel,
            () => {
                this.setState({joiningChannel: ''});
            },
        );
    }

    createChannelRow = (channel) => {
        const ariaLabel = `${channel.display_name}, ${channel.purpose}`.toLowerCase();
        let channelIcon;
        const {shouldShowArchivedChannels} = this.props;

        // todo sinan fix team member count
        // const memberCount = this.props.allChannelStats[channel.id].member_count || 0
        const memberCount = 120;

        if (isArchivedChannel(channel)) {
            channelIcon = <ArchiveOutlineIcon size={18}/>;
        } else if (isPrivateChannel(channel)) {
            channelIcon = <LockIcon size={18}/>;
        } else {
            channelIcon = <GlobeIcon size={18}/>;
        }

        // todo sinan fix dot
        const channelPurposeContainer = (
            <div id='channelPurposeContainer' >
                <AccountOutlineIcon size={14}/>
                <span>{memberCount}</span>
                <span className='dot'/>
                <span className='more-modal__description'>{channel.purpose}</span>
            </div>
        );

        return (
            <div
                className='more-modal__row'
                key={channel.id}
                id={`ChannelRow-${channel.name}`}
            >
                <div className='more-modal__details'>
                    <button
                        onClick={this.handleJoin.bind(this, channel)}
                        aria-label={ariaLabel}
                        className='style--none more-modal__name'
                    >
                        {channelIcon}
                        {channel.display_name}
                    </button>
                    {}
                    {channelPurposeContainer}
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
                                id={shouldShowArchivedChannels ? t('more_channels.view') : t('more_channels.join')}
                                defaultMessage={shouldShowArchivedChannels ? 'View' : 'Join'}
                            />
                        </LoadingWrapper>
                    </button>
                </div>
            </div>
        );
    }

    nextPage = (e) => {
        e.preventDefault();
        this.setState({page: this.state.page + 1, nextDisabled: true});
        this.nextTimeoutId = setTimeout(() => this.setState({nextDisabled: false}), NEXT_BUTTON_TIMEOUT_MILLISECONDS);
        this.props.nextPage(this.state.page + 1);
        this.channelListScroll.current?.scrollTo({top: 0});
    }

    previousPage = (e) => {
        e.preventDefault();
        this.setState({page: this.state.page - 1});
        this.channelListScroll.current?.scrollTo({top: 0});
    }

    doSearch = () => {
        const term = this.filter.current.value;
        this.props.search(term);
        if (term === '') {
            this.setState({page: 0});
        }
    }
    toggleArchivedChannelsOn = () => {
        this.props.toggleArchivedChannels(true);
    }
    toggleArchivedChannelsOff = () => {
        this.props.toggleArchivedChannels(false);
    }

    render() {
        const channels = this.props.channels;
        let listContent;
        let nextButton;
        let previousButton;

        if (this.props.loading && channels.length === 0) {
            listContent = <LoadingScreen/>;
        } else if (channels.length === 0) {
            listContent = (
                <div className='no-channel-message'>
                    <h3 className='primary-message'>
                        <FormattedMessage
                            id='more_channels.noMore'
                            tagName='strong'
                            defaultMessage='No more channels to join'
                        />
                    </h3>
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

        // sinan todo add icon. check home page search
        let input = (
            <div className='filter-row filter-row--full'>
                <div className='col-sm-12'>
                    <QuickInput
                        id='searchChannelsTextbox'
                        ref={this.filter}
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
                            ref={this.filter}
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

        let channelDropdown;

        if (this.props.canShowArchivedChannels) {
            channelDropdown = (
                <MenuWrapper id='channelsMoreDropdown'>
                    <a>
                        <span>{this.props.shouldShowArchivedChannels ? localizeMessage('more_channels.show_archived_channels', 'Show: Archived Channels') : localizeMessage('more_channels.show_public_channels', 'Show: Public Channels')}</span>
                        <span className='caret'/>
                    </a>
                    <Menu
                        openLeft={false}
                        ariaLabel={localizeMessage('team_members_dropdown.menuAriaLabel', 'Change the role of a team member')}
                    >
                        <Menu.ItemAction
                            id='channelsMoreDropdownPublic'
                            onClick={this.toggleArchivedChannelsOff}
                            text={localizeMessage('suggestion.search.public', 'Public Channels')}
                        />
                        <Menu.ItemAction
                            id='channelsMoreDropdownArchived'
                            onClick={this.toggleArchivedChannelsOn}
                            text={localizeMessage('suggestion.archive', 'Archived Channels')}
                        />
                    </Menu>
                </MenuWrapper>
            );
        }

        let channelCountLabel;
        if (channels.length === 0) {
            channelCountLabel = localizeMessage('more_channels.count_zero', '0 Channel');
        } else if (channels.length === 1) {
            channelCountLabel = localizeMessage('more_channels.count_one', '1 Channel');
        } else if (channels.length > 1) {
            channelCountLabel = localizeAndFormatMessage('more_channels.count', '- Channel', {count: channels.length});
        } else {
            channelCountLabel = localizeAndFormatMessage('more_channels.count', '- Channel', {count: '-'});
        }

        const dropDownContainer = (
            <div className='more-modal__dropdown'>
                <span id='channelCountLabel'>{channelCountLabel}</span>
                {channelDropdown}
            </div>
        );

        return (
            <div className='filtered-user-list'>
                {input}
                {dropDownContainer}
                <div
                    role='application'
                    ref='channelList'
                    className='more-modal__list'
                >
                    <div
                        id='moreChannelsList'
                        ref={this.channelListScroll}
                    >
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
    toggleArchivedChannels: PropTypes.func.isRequired,
    shouldShowArchivedChannels: PropTypes.bool.isRequired,
    canShowArchivedChannels: PropTypes.bool.isRequired,
};
/* eslint-enable react/no-string-refs */
