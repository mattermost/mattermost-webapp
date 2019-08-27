// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {OverlayTrigger, Popover, Tooltip} from 'react-bootstrap';
import {FormattedMessage, intlShape} from 'react-intl';
import {Permissions} from 'mattermost-redux/constants';
import {memoizeResult} from 'mattermost-redux/utils/helpers';

import 'bootstrap';

import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import Markdown from 'components/markdown';
import PopoverListMembers from 'components/popover_list_members';
import SearchBar from 'components/search_bar';
import StatusIcon from 'components/status_icon';
import FlagIcon from 'components/widgets/icons/flag_icon';
import MentionsIcon from 'components/widgets/icons/mentions_icon';
import PinIcon from 'components/widgets/icons/pin_icon';
import SearchIcon from 'components/widgets/icons/search_icon';
import ArchiveIcon from 'components/widgets/icons/archive_icon';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import QuickSwitchModal from 'components/quick_switch_modal';
import {ChannelHeaderDropdown} from 'components/channel_header_dropdown';
import MenuWrapper from 'components/widgets/menu/menu_wrapper.jsx';
import GuestBadge from 'components/widgets/badges/guest_badge.jsx';
import BotBadge from 'components/widgets/badges/bot_badge.jsx';

import {
    Constants,
    ModalIdentifiers,
    NotificationLevels,
    RHSStates,
} from 'utils/constants';
import * as Utils from 'utils/utils';

import ChannelHeaderPlug from 'plugins/channel_header_plug';

import HeaderIconWrapper from './components/header_icon_wrapper';

const headerMarkdownOptions = {singleline: true, mentionHighlight: false, atMentions: true};
const popoverMarkdownOptions = {singleline: false, mentionHighlight: false, atMentions: true};

const SEARCH_BAR_MINIMUM_WINDOW_SIZE = 1140;

export default class ChannelHeader extends React.PureComponent {
    static propTypes = {
        teamId: PropTypes.string.isRequired,
        currentUser: PropTypes.object.isRequired,
        channel: PropTypes.object,
        channelMember: PropTypes.object,
        dmUser: PropTypes.object,
        isFavorite: PropTypes.bool,
        isReadOnly: PropTypes.bool,
        isMuted: PropTypes.bool,
        hasGuests: PropTypes.bool,
        rhsState: PropTypes.oneOf(
            Object.values(RHSStates),
        ),
        isQuickSwitcherOpen: PropTypes.bool,
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
            openModal: PropTypes.func.isRequired,
            closeModal: PropTypes.func.isRequired,
        }).isRequired,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    constructor(props) {
        super(props);
        this.toggleFavoriteRef = React.createRef();

        const showSearchBar = Utils.windowWidth() > SEARCH_BAR_MINIMUM_WINDOW_SIZE;
        this.state = {
            showSearchBar,
        };

        this.getHeaderMarkdownOptions = memoizeResult((channelNamesMap) => (
            {...headerMarkdownOptions, channelNamesMap}
        ));
        this.getPopoverMarkdownOptions = memoizeResult((channelNamesMap) => (
            {...popoverMarkdownOptions, channelNamesMap}
        ));
    }

    componentDidMount() {
        this.props.actions.getCustomEmojisInText(this.props.channel ? this.props.channel.header : '');
        document.addEventListener('keydown', this.handleShortcut);
        document.addEventListener('keydown', this.handleQuickSwitchKeyPress);
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleShortcut);
        document.removeEventListener('keydown', this.handleQuickSwitchKeyPress);
        window.removeEventListener('resize', this.handleResize);
    }

    componentDidUpdate(prevProps) {
        const header = this.props.channel ? this.props.channel.header : '';
        const prevHeader = prevProps.channel ? prevProps.channel.header : '';
        if (header !== prevHeader) {
            this.props.actions.getCustomEmojisInText(header);
        }
    }

    handleResize = () => {
        const windowWidth = Utils.windowWidth();

        this.setState({showSearchBar: windowWidth > SEARCH_BAR_MINIMUM_WINDOW_SIZE});
    };

    handleClose = () => {
        this.props.actions.goToLastViewedChannel();
    };

    toggleFavorite = (e) => {
        e.stopPropagation();
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

    showPinnedPosts = (e) => {
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

    handleQuickSwitchKeyPress = (e) => {
        if (Utils.cmdOrCtrlPressed(e) && !e.shiftKey && Utils.isKeyPressed(e, Constants.KeyCodes.K)) {
            if (!e.altKey) {
                e.preventDefault();
                this.toggleQuickSwitchModal();
            }
        }
    }

    toggleQuickSwitchModal = () => {
        const {isQuickSwitcherOpen} = this.props;
        if (isQuickSwitcherOpen) {
            this.props.actions.closeModal(ModalIdentifiers.QUICK_SWITCH);
        } else {
            this.props.actions.openModal({
                modalId: ModalIdentifiers.QUICK_SWITCH,
                dialogType: QuickSwitchModal,
            });
        }
    }

    removeTooltipLink = () => {
        // Bootstrap adds the attr dynamically, removing it to prevent a11y readout
        this.toggleFavoriteRef.current.removeAttribute('aria-describedby');
    }

    showEditChannelHeaderModal = () => {
        if (this.refs.headerOverlay) {
            this.refs.headerOverlay.hide();
        }

        const {actions, channel} = this.props;
        const modalData = {
            modalId: ModalIdentifiers.EDIT_CHANNEL_HEADER,
            dialogType: EditChannelHeaderModal,
            dialogProps: {channel},
        };

        actions.openModal(modalData);
    }

    render() {
        const {
            teamId,
            currentUser,
            channel,
            channelMember,
            isMuted: channelMuted,
            isReadOnly,
            isFavorite,
            dmUser,
            rhsState,
            hasGuests,
        } = this.props;
        const {formatMessage} = this.context.intl;
        const ariaLabelChannelHeader = Utils.localizeMessage('accessibility.sections.channelHeader', 'channel header region');

        let hasGuestsText = '';
        if (hasGuests) {
            hasGuestsText = (
                <span className='has-guest-header'>
                    <FormattedMessage
                        id='channel_header.channelHasGuests'
                        defaultMessage='This channel has guests'
                    />
                </span>
            );
        }

        const channelIsArchived = channel.delete_at !== 0;
        if (Utils.isEmptyObject(channel) ||
            Utils.isEmptyObject(channelMember) ||
            Utils.isEmptyObject(currentUser) ||
            (!dmUser && channel.type === Constants.DM_CHANNEL)
        ) {
            // Use an empty div to make sure the header's height stays constant
            return (
                <div className='channel-header'/>
            );
        }

        const channelNamesMap = channel.props && channel.props.channel_mentions;

        let channelTitle = channel.display_name;
        let archivedIcon = null;
        if (channelIsArchived) {
            archivedIcon = (<ArchiveIcon className='icon icon__archive icon channel-header-archived-icon svg-text-color'/>);
        }
        const isDirect = (channel.type === Constants.DM_CHANNEL);
        const isGroup = (channel.type === Constants.GM_CHANNEL);
        const isPrivate = (channel.type === Constants.PRIVATE_CHANNEL);

        if (isDirect) {
            const teammateId = dmUser.id;
            if (currentUser.id === teammateId) {
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
            channelTitle = (
                <React.Fragment>
                    {channelTitle}
                    <GuestBadge show={Utils.isGuest(dmUser)}/>
                </React.Fragment>
            );
        }

        if (isGroup) {
            const usernames = channel.display_name.split(',');
            const nodes = [];
            for (const username of usernames) {
                const user = Utils.getUserByUsername(username.trim());
                nodes.push((
                    <React.Fragment key={username}>
                        {nodes.length !== 0 && ', '}
                        {username}
                        <GuestBadge show={Utils.isGuest(user)}/>
                    </React.Fragment>
                ));
            }
            channelTitle = nodes;
            if (hasGuests) {
                hasGuestsText = (
                    <span className='has-guest-header'>
                        <FormattedMessage
                            id='channel_header.groupMessageHasGuests'
                            defaultMessage='This group message has guests'
                        />
                    </span>
                );
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
        if (isDirect && !dmUser.delete_at && !dmUser.is_bot) {
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
        const headerText = (isDirect && dmUser.is_bot) ? dmUser.bot_description : channel.header;
        if (headerText) {
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
                        message={headerText}
                        options={this.getPopoverMarkdownOptions(channelNamesMap)}
                    />
                </Popover>
            );
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
                        {hasGuestsText}
                        <span onClick={Utils.handleFormattedTextClick}>
                            <Markdown
                                message={headerText}
                                options={this.getHeaderMarkdownOptions(channelNamesMap)}
                            />
                        </span>
                    </div>
                </OverlayTrigger>
            );
        } else {
            let editMessage;
            if (!isReadOnly && !channelIsArchived) {
                if (isDirect || isGroup) {
                    if (!isDirect || !dmUser.is_bot) {
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
                    }
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
                    {hasGuestsText}
                    {editMessage}
                </div>
            );
        }

        let toggleFavoriteTooltip;
        let toggleFavorite = null;
        let ariaLabel = '';

        if (!channelIsArchived) {
            if (isFavorite) {
                toggleFavoriteTooltip = (
                    <Tooltip id='favoriteTooltip'>
                        <FormattedMessage
                            id='channelHeader.removeFromFavorites'
                            defaultMessage='Remove from Favorites'
                        />
                    </Tooltip>
                );
                ariaLabel = formatMessage({id: 'channelHeader.removeFromFavorites', defaultMessage: 'Remove from Favorites'}).toLowerCase();
            } else {
                toggleFavoriteTooltip = (
                    <Tooltip id='favoriteTooltip'>
                        <FormattedMessage
                            id='channelHeader.addToFavorites'
                            defaultMessage='Add to Favorites'
                        />
                    </Tooltip>
                );
                ariaLabel = formatMessage({id: 'channelHeader.addToFavorites', defaultMessage: 'Add to Favorites'}).toLowerCase();
            }

            toggleFavorite = (
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={toggleFavoriteTooltip}
                    onEntering={this.removeTooltipLink}
                >
                    <button
                        id='toggleFavorite'
                        ref={this.toggleFavoriteRef}
                        onClick={this.toggleFavorite}
                        className={'style--none color--link channel-header__favorites ' + (this.props.isFavorite ? 'active' : 'inactive')}
                        aria-label={ariaLabel}
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
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={channelMutedTooltip}
                >
                    <button
                        id='toggleMute'
                        onClick={this.unmute}
                        className={'style--none color--link channel-header__mute inactive'}
                        aria-label={formatMessage({id: 'generic_icons.muted', defaultMessage: 'Muted Icon'})}
                    >
                        <i className={'icon fa fa-bell-slash-o'}/>
                    </button>
                </OverlayTrigger>
            );
        }

        let pinnedIconClass = 'channel-header__icon';
        if (rhsState === RHSStates.PIN) {
            pinnedIconClass += ' active';
        }

        let title = (
            <React.Fragment>
                {toggleFavorite}
                <MenuWrapper>
                    <div
                        id='channelHeaderDropdownButton'
                        className='channel-header__top'
                    >
                        <button
                            className='channel-header__trigger style--none'
                            aria-label={formatMessage({id: 'channel_header.menuAriaLabel', defaultMessage: 'Channel Menu'}).toLowerCase()}
                        >
                            <strong
                                role='heading'
                                aria-level='2'
                                id='channelHeaderTitle'
                                className='heading'
                            >
                                <span>
                                    {archivedIcon}
                                    {channelTitle}
                                </span>
                            </strong>
                            <span
                                id='channelHeaderDropdownIcon'
                                className='fa fa-angle-down header-dropdown__icon'
                                aria-label={formatMessage({id: 'generic_icons.dropdown', defaultMessage: 'Dropdown Icon'}).toLowerCase()}
                            />
                        </button>
                    </div>
                    <ChannelHeaderDropdown/>
                </MenuWrapper>
            </React.Fragment>
        );
        if (isDirect && dmUser.is_bot) {
            title = (
                <div
                    id='channelHeaderDropdownButton'
                    className='channel-header__top'
                >
                    {toggleFavorite}
                    <strong
                        role='heading'
                        aria-level='2'
                        id='channelHeaderTitle'
                        className='heading'
                    >
                        <span>
                            {archivedIcon}
                            {channelTitle}
                        </span>
                    </strong>
                    <BotBadge className='badge-popoverlist'/>
                </div>
            );
        }

        return (
            <div
                id='channel-header'
                aria-label={ariaLabelChannelHeader}
                role='application'
                tabIndex='-1'
                data-channelid={`${channel.id}`}
                className='channel-header alt a11y__region'
                data-a11y-sort-order='7'
            >
                <div className='flex-parent'>
                    <div className='flex-child'>
                        <div
                            id='channelHeaderInfo'
                            className='channel-header__info'
                        >
                            <div
                                className='channel-header__title dropdown'
                            >
                                <div>
                                    {title}
                                </div>
                                {muteTrigger}
                            </div>
                            {headerTextContainer}
                        </div>
                    </div>
                    <div className='flex-child'>
                        {popoverListMembers}
                    </div>
                    <ChannelHeaderPlug
                        channel={channel}
                        channelMember={channelMember}
                    />
                    <HeaderIconWrapper
                        iconComponent={
                            <PinIcon
                                className='icon icon__pin'
                                aria-hidden='true'
                            />
                        }
                        ariaLabel={true}
                        buttonClass={'style--none ' + pinnedIconClass}
                        buttonId={'channelHeaderPinButton'}
                        onClick={this.showPinnedPosts}
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
                        ariaLabel={true}
                        buttonId={'channelHeaderMentionButton'}
                        onClick={this.searchMentions}
                        tooltipKey={'recentMentions'}
                    />
                    <HeaderIconWrapper
                        iconComponent={
                            <FlagIcon className='icon icon__flag'/>
                        }
                        ariaLabel={true}
                        buttonId={'channelHeaderFlagButton'}
                        onClick={this.getFlagged}
                        tooltipKey={'flaggedPosts'}
                    />
                </div>
            </div>
        );
    }
}
