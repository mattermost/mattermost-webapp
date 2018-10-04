// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Popover, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Permissions} from 'mattermost-redux/constants';
import {memoizeResult} from 'mattermost-redux/utils/helpers';

import 'bootstrap';

import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';

import * as WebrtcActions from 'actions/webrtc_actions.jsx';

import Markdown from 'components/markdown';
import {Constants, NotificationLevels, RHSStates, UserStatuses} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import {browserHistory} from 'utils/browser_history';
import PopoverListMembers from 'components/popover_list_members';
import SearchBar from 'components/search_bar';
import StatusIcon from 'components/status_icon.jsx';
import FlagIcon from 'components/svg/flag_icon';
import MentionsIcon from 'components/svg/mentions_icon';
import PinIcon from 'components/svg/pin_icon';
import SearchIcon from 'components/svg/search_icon';
import ArchiveIcon from 'components/svg/archive_icon';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import {ChannelHeaderDropdown} from 'components/channel_header_dropdown';

import ChannelHeaderPlug from 'plugins/channel_header_plug';

import HeaderIconWrapper from './components/header_icon_wrapper';

const headerMarkdownOptions = {singleline: true, mentionHighlight: false, atMentions: true};
const popoverMarkdownOptions = {singleline: false, mentionHighlight: false, atMentions: true};

const SEARCH_BAR_MINIMUM_WINDOW_SIZE = 1140;

export default class ChannelHeader extends React.Component {
    static propTypes = {
        actions: PropTypes.shape({
            favoriteChannel: PropTypes.func.isRequired,
            unfavoriteChannel: PropTypes.func.isRequired,
            showFlaggedPosts: PropTypes.func.isRequired,
            showPinnedPosts: PropTypes.func.isRequired,
            showMentions: PropTypes.func.isRequired,
            closeRightHandSide: PropTypes.func.isRequired,
            updateRhsState: PropTypes.func.isRequired,
            getCustomEmojisInText: PropTypes.func.isRequired,
            updateChannelNotifyProps: PropTypes.func.isRequired,
            goToLastViewedChannel: PropTypes.func.isRequired,
        }).isRequired,
        channel: PropTypes.object.isRequired,
        channelMember: PropTypes.object.isRequired,
        isFavorite: PropTypes.bool,
        currentUser: PropTypes.object.isRequired,
        dmUser: PropTypes.object,
        isReadOnly: PropTypes.bool,
        rhsState: PropTypes.oneOf(
            Object.values(RHSStates)
        ),
        lastViewedChannelName: PropTypes.string.isRequired,
        enableWebrtc: PropTypes.bool.isRequired,
        isWebrtcBusy: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        dmUser: {},
    };

    constructor(props) {
        super(props);

        const showSearchBar = Utils.windowWidth() > SEARCH_BAR_MINIMUM_WINDOW_SIZE;
        this.state = {
            showSearchBar,
            showEditChannelHeaderModal: false,
            isBusy: WebrtcStore.isBusy(),
        };

        this.getHeaderMarkdownOptions = memoizeResult((channelNamesMap) => (
            {...headerMarkdownOptions, channelNamesMap}
        ));
        this.getPopoverMarkdownOptions = memoizeResult((channelNamesMap) => (
            {...popoverMarkdownOptions, channelNamesMap}
        ));
    }

    componentDidMount() {
        this.props.actions.getCustomEmojisInText(this.props.channel.header);
        document.addEventListener('keydown', this.handleShortcut);
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleShortcut);
        window.removeEventListener('resize', this.handleResize);
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.channel.id !== nextProps.channel.id) {
            this.props.actions.getCustomEmojisInText(nextProps.channel.header);
        }
    }

    handleResize = () => {
        const windowWidth = Utils.windowWidth();

        this.setState({showSearchBar: windowWidth > SEARCH_BAR_MINIMUM_WINDOW_SIZE});
    };

    onWebrtcChange = () => {
        this.setState({isBusy: WebrtcStore.isBusy()});
    };

    onBusy = (isBusy) => {
        this.setState({isBusy});
    };

    handleClose = () => {
        this.props.actions.goToLastViewedChannel();
    };

    toggleFavorite = () => {
        if (this.props.isFavorite) {
            this.props.actions.unfavoriteChannel(this.props.channel.id);
        } else {
            this.props.actions.favoriteChannel(this.props.channel.id);
        }
    };

    unmute = () => {
        const {actions, channel, channelMember, currentUser} = this.props;

        if (!channelMember || !currentUser || !channel) {
            return;
        }

        const options = {mark_unread: NotificationLevels.ALL};
        actions.updateChannelNotifyProps(currentUser.id, channel.id, options);
    };

    mute = () => {
        const {actions, channel, channelMember, currentUser} = this.props;

        if (!channelMember || !currentUser || !channel) {
            return;
        }

        const options = {mark_unread: NotificationLevels.MENTION};
        actions.updateChannelNotifyProps(currentUser.id, channel.id, options);
    };

    searchMentions = (e) => {
        e.preventDefault();
        if (this.props.rhsState === RHSStates.MENTION) {
            this.props.actions.closeRightHandSide();
        } else {
            this.props.actions.showMentions();
        }
    };

    getPinnedPosts = (e) => {
        e.preventDefault();
        if (this.props.rhsState === RHSStates.PIN) {
            this.props.actions.closeRightHandSide();
        } else {
            this.props.actions.showPinnedPosts();
        }
    };

    getFlagged = (e) => {
        e.preventDefault();
        if (this.props.rhsState === RHSStates.FLAG) {
            this.props.actions.closeRightHandSide();
        } else {
            this.props.actions.showFlaggedPosts();
        }
    };

    searchButtonClick = (e) => {
        e.preventDefault();
        this.props.actions.updateRhsState(RHSStates.SEARCH);
    };

    handleShortcut = (e) => {
        if (Utils.cmdOrCtrlPressed(e) && e.shiftKey) {
            if (Utils.isKeyPressed(e, Constants.KeyCodes.M)) {
                e.preventDefault();
                this.searchMentions(e);
            }
        }
    };

    hideRenameChannelModal = () => {
        this.setState({
            showRenameChannelModal: false,
        });
    };

    initWebrtc = (contactId, isOnline) => {
        if (isOnline && !this.props.isWebrtcBusy) {
            this.props.actions.closeRightHandSide();
            WebrtcActions.initWebrtc(contactId, true);
        }
    };

    handleOnMouseOver = () => {
        if (this.refs.headerOverlay) {
            this.refs.headerOverlay.show();
        }
    };

    handleOnMouseOut = () => {
        if (this.refs.headerOverlay) {
            this.refs.headerOverlay.hide();
        }
    };

    hideEditChannelHeaderModal = () => {
        this.setState({showEditChannelHeaderModal: false});
    };

    showEditChannelHeaderModal = () => {
        this.setState({showEditChannelHeaderModal: true});
    };

    handleWebRTCOnClick = (e) => {
        e.preventDefault();
        const dmUserId = this.props.dmUser.id;
        const dmUserStatus = this.props.dmUserStatus.status;
        const isOffline = dmUserStatus === UserStatuses.OFFLINE;
        const isDoNotDisturb = dmUserStatus === UserStatuses.DND;

        this.initWebrtc(dmUserId, !isOffline || !isDoNotDisturb);
    };

    render() {
        const channelIsArchived = this.props.channel.delete_at !== 0;
        if (Utils.isEmptyObject(this.props.channel) ||
            Utils.isEmptyObject(this.props.channelMember) ||
            Utils.isEmptyObject(this.props.currentUser)) {
            // Use an empty div to make sure the header's height stays constant
            return (
                <div className='channel-header'/>
            );
        }

        const channel = this.props.channel;
        const channelNamesMap = this.props.channel.props && this.props.channel.props.channel_mentions;

        const popoverContent = (
            <Popover
                id='header-popover'
                bStyle='info'
                bSize='large'
                placement='bottom'
                className='channel-header__popover'
                onMouseOver={this.handleOnMouseOver}
                onMouseOut={this.handleOnMouseOut}
            >
                <Markdown
                    message={channel.header}
                    options={this.getPopoverMarkdownOptions(channelNamesMap)}
                />
            </Popover>
        );

        let channelTitle = channel.display_name;
        let archivedIcon = null;
        if (channelIsArchived) {
            archivedIcon = (<ArchiveIcon className='icon icon__archive icon channel-header-archived-icon svg-text-color'/>);
        }
        const isDirect = (this.props.channel.type === Constants.DM_CHANNEL);
        const isGroup = (this.props.channel.type === Constants.GM_CHANNEL);
        const isPrivate = (this.props.channel.type === Constants.PRIVATE_CHANNEL);

        const channelMuted = isChannelMuted(this.props.channelMember);

        const teamId = this.props.channel.team_id;

        if (isDirect) {
            const teammateId = Utils.getUserIdFromChannelName(channel);
            if (this.props.currentUser.id === teammateId) {
                channelTitle = (
                    <FormattedMessage
                        id='channel_header.directchannel.you'
                        defaultMessage='{displayname} (you) '
                        values={{
                            displayname: Utils.getDisplayNameByUserId(teammateId),
                        }}
                    />
                );
            } else {
                channelTitle = Utils.getDisplayNameByUserId(teammateId) + ' ';
            }
        }

        let popoverListMembers;
        if (!isDirect) {
            popoverListMembers = (
                <PopoverListMembers
                    channel={channel}
                />
            );
        }

        let dmHeaderIconStatus;
        let dmHeaderTextStatus;
        if (channel.type === Constants.DM_CHANNEL && !this.props.dmUser.delete_at) {
            dmHeaderIconStatus = (
                <StatusIcon
                    type='avatar'
                    status={channel.status}
                />
            );

            dmHeaderTextStatus = (
                <span className='header-status__text'>
                    <FormattedMessage
                        id={`status_dropdown.set_${channel.status}`}
                        defaultMessage={Utils.toTitleCase(channel.status)}
                    />
                </span>
            );
        }

        let headerTextContainer;
        if (channel.header) {
            headerTextContainer = (
                <OverlayTrigger
                    trigger={'click'}
                    placement='bottom'
                    rootClose={true}
                    overlay={popoverContent}
                    ref='headerOverlay'
                >
                    <div
                        id='channelHeaderDescription'
                        className='channel-header__description'
                    >
                        {dmHeaderIconStatus}
                        {dmHeaderTextStatus}
                        <span onClick={Utils.handleFormattedTextClick}>
                            <Markdown
                                message={channel.header}
                                options={this.getHeaderMarkdownOptions(channelNamesMap)}
                            />
                        </span>
                    </div>
                </OverlayTrigger>
            );
        } else {
            let editMessage;
            if (!this.props.isReadOnly && !channelIsArchived) {
                if (isDirect || isGroup) {
                    editMessage = (
                        <button
                            className='style--none'
                            onClick={this.showEditChannelHeaderModal}
                        >
                            <FormattedMessage
                                id='channel_header.addChannelHeader'
                                defaultMessage='Add a channel description'
                            />
                        </button>
                    );
                } else {
                    editMessage = (
                        <ChannelPermissionGate
                            channelId={channel.id}
                            teamId={teamId}
                            permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]}
                        >
                            <button
                                className='style--none'
                                onClick={this.showEditChannelHeaderModal}
                            >
                                <FormattedMessage
                                    id='channel_header.addChannelHeader'
                                    defaultMessage='Add a channel description'
                                />
                            </button>
                        </ChannelPermissionGate>
                    );
                }
            }
            headerTextContainer = (
                <div
                    id='channelHeaderDescription'
                    className='channel-header__description light'
                >
                    {dmHeaderIconStatus}
                    {dmHeaderTextStatus}
                    {editMessage}
                </div>
            );
        }

        let toggleFavoriteTooltip;
        let toggleFavorite = null;
        if (!channelIsArchived) {
            if (this.props.isFavorite) {
                toggleFavoriteTooltip = (
                    <Tooltip id='favoriteTooltip'>
                        <FormattedMessage
                            id='channelHeader.removeFromFavorites'
                            defaultMessage='Remove from Favorites'
                        />
                    </Tooltip>
                );
            } else {
                toggleFavoriteTooltip = (
                    <Tooltip id='favoriteTooltip'>
                        <FormattedMessage
                            id='channelHeader.addToFavorites'
                            defaultMessage='Add to Favorites'
                        />
                    </Tooltip>
                );
            }

            toggleFavorite = (
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={toggleFavoriteTooltip}
                >
                    <button
                        id='toggleFavorite'
                        onClick={this.toggleFavorite}
                        className={'style--none color--link channel-header__favorites ' + (this.props.isFavorite ? 'active' : 'inactive')}
                    >
                        <i className={'icon fa ' + (this.props.isFavorite ? 'fa-star' : 'fa-star-o')}/>
                    </button>
                </OverlayTrigger>
            );
        }

        const channelMutedTooltip = (
            <Tooltip id='channelMutedTooltip'>
                <FormattedMessage
                    id='channelHeader.unmute'
                    defaultMessage='Unmute'
                />
            </Tooltip>
        );

        let muteTrigger;
        if (channelMuted) {
            muteTrigger = (
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={channelMutedTooltip}
                >
                    <button
                        id='toggleMute'
                        onClick={this.unmute}
                        className={'style--none color--link channel-header__mute inactive'}
                        aria-label={Utils.localizeMessage('generic_icons.muted', 'Muted Icon')}
                    >
                        <i className={'icon fa fa-bell-slash-o'}/>
                    </button>
                </OverlayTrigger>
            );
        }

        let pinnedIconClass = 'channel-header__icon';
        if (this.props.rhsState === RHSStates.PIN) {
            pinnedIconClass += ' active';
        }

        return (
            <div
                id='channel-header'
                className='channel-header alt'
            >
                <div className='flex-parent'>
                    <div className='flex-child'>
                        <div
                            id='channelHeaderInfo'
                            className='channel-header__info'
                        >
                            <div
                                id='channelHeaderTitle'
                                className='channel-header__title dropdown'
                            >
                                {toggleFavorite}
                                <h2>
                                    <button
                                        id='channelHeaderDropdownButton'
                                        className='dropdown-toggle theme style--none'
                                        type='button'
                                        data-toggle='dropdown'
                                        aria-expanded='true'
                                    >
                                        <strong
                                            id='channelHeaderTitle'
                                            className='heading'
                                        >
                                            {archivedIcon}
                                            {channelTitle}
                                        </strong>
                                        <span
                                            id='channelHeaderDropdownIcon'
                                            className='fa fa-angle-down header-dropdown__icon'
                                            title={Utils.localizeMessage('generic_icons.dropdown', 'Dropdown Icon')}
                                        />
                                    </button>
                                    <ChannelHeaderDropdown/>
                                </h2>
                                {muteTrigger}
                            </div>
                            {headerTextContainer}
                        </div>
                    </div>
                    <div className='flex-child'>
                        {popoverListMembers}
                    </div>
                    <ChannelHeaderPlug
                        channel={this.props.channel}
                        channelMember={this.props.channelMember}
                    />
                    <HeaderIconWrapper
                        iconComponent={
                            <PinIcon
                                className='icon icon__pin'
                                aria-hidden='true'
                            />
                        }
                        buttonClass={'style--none ' + pinnedIconClass}
                        buttonId={'channelHeaderPinButton'}
                        onClick={this.getPinnedPosts}
                        tooltipKey={'pinnedPosts'}
                    />
                    {this.state.showSearchBar ? (
                        <div className='flex-child search-bar__container'>
                            <SearchBar
                                showMentionFlagBtns={false}
                                isFocus={Utils.isMobile()}
                            />
                        </div>
                    ) : (
                        <HeaderIconWrapper
                            iconComponent={
                                <SearchIcon
                                    className='icon icon__search icon--stroke'
                                    aria-hidden='true'
                                />
                            }
                            buttonId={'channelHeaderSearchButton'}
                            onClick={this.searchButtonClick}
                            tooltipKey={'search'}
                        />
                    )}
                    <HeaderIconWrapper
                        iconComponent={
                            <MentionsIcon
                                className='icon icon__mentions'
                                aria-hidden='true'
                            />
                        }
                        buttonId={'channelHeaderMentionButton'}
                        onClick={this.searchMentions}
                        tooltipKey={'recentMentions'}
                    />
                    <HeaderIconWrapper
                        iconComponent={
                            <FlagIcon className='icon icon__flag'/>
                        }
                        buttonId={'channelHeaderFlagButton'}
                        onClick={this.getFlagged}
                        tooltipKey={'flaggedPosts'}
                    />
                </div>
            </div>
        );
    }
}
