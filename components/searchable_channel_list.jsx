// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {AccountOutlineIcon, ArchiveOutlineIcon, CheckIcon, ChevronDownIcon, GlobeIcon, LockOutlineIcon} from '@mattermost/compass-icons/components';

import classNames from 'classnames';

import {isPrivateChannel} from 'mattermost-redux/utils/channel_utils';

import LoadingScreen from 'components/loading_screen';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';
import QuickInput from 'components/quick_input';
import LocalizedInput from 'components/localized_input/localized_input';
import CheckboxCheckedIcon from 'components/widgets/icons/checkbox_checked_icon';
import MagnifyingGlassSVG from 'components/common/svg_images_components/magnifying_glass_svg';

import BrowserStore from 'stores/browser_store';

import {t} from 'utils/i18n';
import * as UserAgent from 'utils/user_agent';
import {localizeMessage, localizeAndFormatMessage} from 'utils/utils';
import {isArchivedChannel} from 'utils/channel_utils';
import {ModalIdentifiers, StoragePrefixes} from 'utils/constants';

import MenuWrapper from './widgets/menu/menu_wrapper';
import Menu from './widgets/menu/menu';

const NEXT_BUTTON_TIMEOUT_MILLISECONDS = 500;

// todo sinan 1, 3, 5 (part of 2nd issue), 12
// todo sinan fix channel count and replace with results
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
            rememberChecked: BrowserStore.getItem(StoragePrefixes.HIDE_JOINED_CHANNELS, 'false') === 'true',
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
        if (this.isMemberOfChannel(channel.id)) {
            this.props.closeModal(ModalIdentifiers.MORE_CHANNELS);
        }
    }

    isMemberOfChannel(channelId) {
        return this.props.myChannelMemberships[channelId];
    }

    createChannelRow = (channel) => {
        const ariaLabel = `${channel.display_name}, ${channel.purpose}`.toLowerCase();
        let channelIcon;

        let memberCount = 0;
        if (this.props.allChannelStats[channel.id]) {
            memberCount = this.props.allChannelStats[channel.id].member_count;
        }

        if (isArchivedChannel(channel)) {
            channelIcon = <ArchiveOutlineIcon size={18}/>;
        } else if (isPrivateChannel(channel)) {
            channelIcon = <LockOutlineIcon size={18}/>;
        } else {
            channelIcon = <GlobeIcon size={18}/>;
        }

        const membershipIndicator = this.isMemberOfChannel(channel.id) ? (
            <div id='membershipIndicatorContainer'>
                <CheckIcon size={14}/>
                <FormattedMessage
                    id={'more_channels.joined'}
                    defaultMessage={'Joined'}
                />
                <span className='dot'/>
            </div>
        ) : null;

        const channelPurposeContainer = (
            <div id='channelPurposeContainer' >
                {membershipIndicator}
                <AccountOutlineIcon size={14}/>
                <span>{memberCount}</span>
                {channel.purpose.length > 0 && <span className='dot'/>}
                <span className='more-modal__description'>{channel.purpose}</span>
            </div>
        );

        const joinViewChannelButtonClass = classNames('btn', {
            outlineButton: this.isMemberOfChannel(channel.id),
            primaryButton: !this.isMemberOfChannel(channel.id),
        });

        const joinViewChannelButton = (
            <button
                onClick={this.handleJoin.bind(this, channel)}
                className={joinViewChannelButtonClass}
                disabled={this.state.joiningChannel}
            >
                <LoadingWrapper
                    loading={this.state.joiningChannel === channel.id}
                    text={localizeMessage('more_channels.joining', 'Joining...')}
                >
                    <FormattedMessage
                        id={this.isMemberOfChannel(channel.id) ? 'more_channels.view' : 'more_channels.join'}
                        defaultMessage={this.isMemberOfChannel(channel.id) ? 'View' : 'Join'}
                    />
                </LoadingWrapper>
            </button>
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
                        <span id='channelName'>{channel.display_name}</span>
                    </button>
                    {channelPurposeContainer}
                </div>
                <div className='more-modal__actions'>
                    {joinViewChannelButton}
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

    renderCheckboxIcon = () => {
        if (this.state.rememberChecked) {
            return (
                <CheckboxCheckedIcon/>
            );
        }
        return null;
    };

    handleChecked = () => {
        // If it was checked, and now we're unchecking it, clear the preference
        if (this.state.rememberChecked) {
            BrowserStore.setItem(StoragePrefixes.HIDE_JOINED_CHANNELS, 'false');
            this.props.hideJoinedChannelsPreference(false);
        } else {
            BrowserStore.setItem(StoragePrefixes.HIDE_JOINED_CHANNELS, 'true');
            this.props.hideJoinedChannelsPreference(true);
        }
        this.setState({rememberChecked: !this.state.rememberChecked});
    }

    render() {
        const channels = this.props.channels;
        let listContent;
        let nextButton;
        let previousButton;

        let emptyStateMessage = (
            <FormattedMessage
                id={this.props.shouldShowArchivedChannels ? t('more_channels.noArchived') : t('more_channels.noPublic')}
                tagName='strong'
                defaultMessage={this.props.shouldShowArchivedChannels ? 'No archived channels' : 'No public channels'}
            />
        );

        if (this.filter.current !== null && this.filter.current.value.length > 0) {
            emptyStateMessage = (
                <FormattedMessage
                    id='more_channels.noMore'
                    tagName='strong'
                    defaultMessage='No results for {text}'
                    values={{
                        text: this.filter.current.value,
                    }}
                />
            );
        }

        if (this.props.loading && channels.length === 0) {
            listContent = <LoadingScreen/>;
        } else if (channels.length === 0) {
            listContent = (
                <div className='no-channel-message'>
                    <MagnifyingGlassSVG/>
                    <h3 className='primary-message'>
                        {emptyStateMessage}
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
                        className='btn btn-link filter-control filter-control__next outlineButton'
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
                        className='btn btn-link filter-control filter-control__prev outlineButton'
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
                    {/* todo sinan move this inside input */}
                    <div className='search__font-icon'>
                        <i className='icon icon-magnify icon-16'/>
                    </div>
                    {/* todo sinan pass onclear */}
                    <QuickInput
                        id='searchChannelsTextbox'
                        ref={this.filter}
                        className='form-control filter-textbox'
                        placeholder={{id: t('filtered_channels_list.search'), defaultMessage: 'Search channels'}}
                        inputComponent={LocalizedInput}
                        onInput={this.doSearch}
                        clearable={true}
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
        let checkIcon;

        if (this.props.canShowArchivedChannels) {
            checkIcon = (
                <CheckIcon
                    size={18}
                    color={'var(--button-bg)'}
                />
            );
            channelDropdown = (
                <MenuWrapper id='channelsMoreDropdown'>
                    <a id='menuWrapper'>
                        <span>{this.props.shouldShowArchivedChannels ? localizeMessage('more_channels.show_archived_channels', 'Channel Type: Archived') : localizeMessage('more_channels.show_public_channels', 'Channel Type: Public')}</span>
                        <ChevronDownIcon
                            color={'rgba(var(--center-channel-color-rgb), 0.64)'}
                        />
                    </a>
                    <Menu
                        openLeft={false}
                        ariaLabel={localizeMessage('team_members_dropdown.menuAriaLabel', 'Change the role of a team member')} // todo sinan change the aria label
                    >
                        <div id='modalPreferenceContainer'>
                            <Menu.ItemAction
                                id='channelsMoreDropdownPublic'
                                onClick={this.toggleArchivedChannelsOff}
                                icon={<GlobeIcon size={16}/>}
                                text={localizeMessage('suggestion.search.public', 'Public Channels')}
                                rightDecorator={this.props.shouldShowArchivedChannels ? null : checkIcon}
                            />
                        </div>
                        <Menu.ItemAction
                            id='channelsMoreDropdownArchived'
                            onClick={this.toggleArchivedChannelsOn}
                            icon={<ArchiveOutlineIcon size={16}/>}
                            text={localizeMessage('suggestion.archive', 'Archived Channels')}
                            rightDecorator={this.props.shouldShowArchivedChannels ? checkIcon : null}
                        />
                    </Menu>
                </MenuWrapper>
            );
        }

        const hideJoinedPreferenceCheckbox = (
            <div className='d-flex align-items-center'>
                <button
                    className={`get-app__checkbox ${this.state.rememberChecked ? 'checked' : ''}`}
                    onClick={this.handleChecked}
                >
                    {this.renderCheckboxIcon()}
                </button>
                <FormattedMessage
                    id='more_channels.hide_joined'
                    defaultMessage='Hide Joined'
                />
            </div>
        );

        let channelCountLabel;
        if (channels.length === 0) {
            channelCountLabel = localizeMessage('more_channels.count_zero', '0 Results');
        } else if (channels.length === 1) {
            channelCountLabel = localizeMessage('more_channels.count_one', '1 Result');
        } else if (channels.length > 1) {
            channelCountLabel = localizeAndFormatMessage(t('more_channels.count'), '0 Results', {count: channels.length});
        } else {
            channelCountLabel = localizeMessage('more_channels.count_zero', '0 Results');
        }

        const dropDownContainer = (
            <div className='more-modal__dropdown'>
                <span id='channelCountLabel'>{channelCountLabel}</span>
                <div id='modalPreferenceContainer'>
                    {channelDropdown}
                    {hideJoinedPreferenceCheckbox}
                </div>
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
    myChannelMemberships: PropTypes.object.isRequired,
    allChannelStats: PropTypes.object.isRequired,
    closeModal: PropTypes.func.isRequired,
    hideJoinedChannelsPreference: PropTypes.func.isRequired,
};
/* eslint-enable react/no-string-refs */
