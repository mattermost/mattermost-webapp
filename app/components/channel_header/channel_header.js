// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React from 'react';
import PropTypes from 'prop-types';
import {Tooltip, Overlay} from 'react-bootstrap';
import {FormattedMessage, injectIntl} from 'react-intl';
import classNames from 'classnames';

import {Permissions} from 'mattermost-redux/constants';
import {memoizeResult} from 'mattermost-redux/utils/helpers';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import 'bootstrap';

import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import Markdown from 'components/markdown';
import OverlayTrigger from 'components/overlay_trigger';
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
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import GuestBadge from 'components/widgets/badges/guest_badge';
import BotBadge from 'components/widgets/badges/bot_badge';
import Popover from 'components/widgets/popover';
import {
    Constants,
    ModalIdentifiers,
    NotificationLevels,
    RHSStates,
} from 'utils/constants';
import {intlShape} from 'utils/react_intl';
import * as Utils from 'utils/utils';

import ChannelHeaderPlug from 'plugins/channel_header_plug';

import HeaderIconWrapper from './components/header_icon_wrapper';
import UserGuideDropdown from './components/user_guide_dropdown';

const headerMarkdownOptions = {singleline: true, mentionHighlight: false, atMentions: true};
const popoverMarkdownOptions = {singleline: false, mentionHighlight: false, atMentions: true};

const SEARCH_BAR_MINIMUM_WINDOW_SIZE = 1140;

class ChannelHeader extends React.PureComponent {
    static propTypes = {
        teamId: PropTypes.string.isRequired,
        currentUser: PropTypes.object.isRequired,
        channel: PropTypes.object,
        channelMember: PropTypes.object,
        dmUser: PropTypes.object,
        gmMembers: PropTypes.array,
        isFavorite: PropTypes.bool,
        isReadOnly: PropTypes.bool,
        isMuted: PropTypes.bool,
        hasGuests: PropTypes.bool,
        rhsState: PropTypes.oneOf(
            Object.values(RHSStates),
        ),
        rhsOpen: PropTypes.bool,
        isQuickSwitcherOpen: PropTypes.bool,
        intl: intlShape.isRequired,
        pinnedPostsCount: PropTypes.number,
        hasMoreThanOneTeam: PropTypes.bool,
        actions: PropTypes.shape({
            favoriteChannel: PropTypes.func.isRequired,
            unfavoriteChannel: PropTypes.func.isRequired,
            showFlaggedPosts: PropTypes.func.isRequired,
            showPinnedPosts: PropTypes.func.isRequired,
            showMentions: PropTypes.func.isRequired,
            openRHSSearch: PropTypes.func.isRequired,
            closeRightHandSide: PropTypes.func.isRequired,
            getCustomEmojisInText: PropTypes.func.isRequired,
            updateChannelNotifyProps: PropTypes.func.isRequired,
            goToLastViewedChannel: PropTypes.func.isRequired,
            openModal: PropTypes.func.isRequired,
            closeModal: PropTypes.func.isRequired,
        }).isRequired,
        teammateNameDisplaySetting: PropTypes.string.isRequired,
        currentRelativeTeamUrl: PropTypes.string.isRequired,
        newSideBarPreference: PropTypes.bool,
        announcementBarCount: PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.toggleFavoriteRef = React.createRef();
        this.headerDescriptionRef = React.createRef();
        this.headerPopoverTextMeasurerRef = React.createRef();
        this.headerOverlayRef = React.createRef();

        this.state = {showSearchBar: ChannelHeader.getShowSearchBar(props), popoverOverlayWidth: 0, showChannelHeaderPopover: false, leftOffset: 0, topOffset: 0};

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

    static getDerivedStateFromProps(nextProps) {
        return {showSearchBar: ChannelHeader.getShowSearchBar(nextProps)};
    }

    static getShowSearchBar(props) {
        return (Utils.windowWidth() > SEARCH_BAR_MINIMUM_WINDOW_SIZE) || props.rhsOpen;
    }

    handleResize = () => {
        this.setState({showSearchBar: ChannelHeader.getShowSearchBar(this.props)});
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

        this.props.actions.openRHSSearch();
    };

    handleShortcut = (e) => {
        if (Utils.cmdOrCtrlPressed(e) && e.shiftKey) {
            if (Utils.isKeyPressed(e, Constants.KeyCodes.M)) {
                e.preventDefault();
                this.props.actions.closeModal(ModalIdentifiers.QUICK_SWITCH);
                this.searchMentions(e);
            }
            if (Utils.isKeyPressed(e, Constants.KeyCodes.L)) {
                // just close the modal if it's open, but let someone else handle the shortcut
                this.props.actions.closeModal(ModalIdentifiers.QUICK_SWITCH);
            }
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
        if (this.headerOverlayRef.current) {
            this.headerOverlayRef.current.hide();
        }

        const {actions, channel} = this.props;
        const modalData = {
            modalId: ModalIdentifiers.EDIT_CHANNEL_HEADER,
            dialogType: EditChannelHeaderModal,
            dialogProps: {channel},
        };

        actions.openModal(modalData);
    }

    showChannelHeaderPopover = (headerText) => {
        const headerDescriptionRect = this.headerDescriptionRef.current.getBoundingClientRect();
        const headerPopoverTextMeasurerRect = this.headerPopoverTextMeasurerRef.current.getBoundingClientRect();
        const announcementBarSize = 32;
        if (headerPopoverTextMeasurerRect.width > headerDescriptionRect.width || headerText.match(/\n{2,}/g)) {
            this.setState({showChannelHeaderPopover: true, leftOffset: this.headerDescriptionRef.current.offsetLeft});
        }

        this.setState({topOffset: (announcementBarSize * this.props.announcementBarCount)});
    }

    setPopoverOverlayWidth = () => {
        const headerDescriptionRect = this.headerDescriptionRef.current.getBoundingClientRect();
        const ellipsisWidthAdjustment = 10;
        this.setState({popoverOverlayWidth: headerDescriptionRect.width + ellipsisWidthAdjustment});
    }

    handleFormattedTextClick = (e) => Utils.handleFormattedTextClick(e, this.props.currentRelativeTeamUrl);

    render() {
        const {
            teamId,
            currentUser,
            gmMembers,
            channel,
            channelMember,
            isMuted: channelMuted,
            isReadOnly,
            isFavorite,
            dmUser,
            rhsState,
            hasGuests,
            teammateNameDisplaySetting,
            newSideBarPreference,
        } = this.props;
        const {formatMessage} = this.props.intl;
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
                            displayname: displayUsername(dmUser, teammateNameDisplaySetting),
                        }}
                    />
                );
            } else {
                channelTitle = displayUsername(dmUser, teammateNameDisplaySetting) + ' ';
            }
            channelTitle = (
                <React.Fragment>
                    {channelTitle}
                    <GuestBadge show={Utils.isGuest(dmUser)}/>
                </React.Fragment>
            );
        }

        if (isGroup) {
            // map the displayname to the gm member users
            const membersMap = {};
            for (const user of gmMembers) {
                if (user.id === currentUser.id) {
                    continue;
                }
                const userDisplayName = displayUsername(user, this.props.teammateNameDisplaySetting);

                if (!membersMap[userDisplayName]) {
                    membersMap[userDisplayName] = []; //Create an array for cases with same display name
                }

                membersMap[userDisplayName].push(user);
            }

            const displayNames = channel.display_name.split(', ');

            channelTitle = displayNames.map((displayName, index) => {
                if (!membersMap[displayName]) {
                    return displayName;
                }

                const user = membersMap[displayName].shift();

                return (
                    <React.Fragment key={user.id}>
                        {index > 0 && ', '}
                        {displayName}
                        <GuestBadge show={Utils.isGuest(user)}/>
                    </React.Fragment>
                );
            });

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
                    popoverStyle='info'
                    popoverSize='lg'
                    style={{maxWidth: `${this.state.popoverOverlayWidth}px`, transform: `translate(${this.state.leftOffset}px, ${this.state.topOffset}px)`}}
                    placement='bottom'
                    className={classNames(['channel-header__popover',
                        {'chanel-header__popover--lhs_offset': this.props.hasMoreThanOneTeam,
                            'chanel-header__popover--new_sidebar': newSideBarPreference}])}
                >
                    <span
                        onClick={this.handleFormattedTextClick}
                    >
                        <Markdown
                            message={headerText}
                            options={this.getPopoverMarkdownOptions(channelNamesMap)}
                        />
                    </span>
                </Popover>
            );

            headerTextContainer = (
                <div
                    id='channelHeaderDescription'
                    className='channel-header__description'
                >
                    {dmHeaderIconStatus}
                    {dmHeaderTextStatus}
                    {hasGuestsText}
                    <div
                        className='header-popover-text-measurer'
                        ref={this.headerPopoverTextMeasurerRef}
                    >
                        <Markdown
                            message={headerText.replace(/\n+/g, ' ')}
                            options={this.getHeaderMarkdownOptions(channelNamesMap)}
                        /></div>
                    <span
                        className='header-description__text'
                        onClick={this.handleFormattedTextClick}
                        onMouseOver={() => this.showChannelHeaderPopover(headerText)}
                        onMouseOut={() => this.setState({showChannelHeaderPopover: false})}
                        ref={this.headerDescriptionRef}
                    >

                        <Overlay
                            show={this.state.showChannelHeaderPopover}
                            placement='bottom'
                            rootClose={true}
                            target={this.headerDescriptionRef.current}
                            ref={this.headerOverlayRef}
                            onEnter={this.setPopoverOverlayWidth}
                            onHide={() => this.setState({showChannelHeaderPopover: false})}
                        >{popoverContent}</Overlay>

                        <Markdown
                            message={headerText}
                            options={this.getHeaderMarkdownOptions(channelNamesMap)}
                        />
                    </span>
                </div>
            );
        } else {
            let editMessage;
            if (!isReadOnly && !channelIsArchived) {
                if (isDirect || isGroup) {
                    if (!isDirect || !dmUser.is_bot) {
                        editMessage = (
                            <button
                                className='header-placeholder style--none'
                                onClick={this.showEditChannelHeaderModal}
                            >
                                <FormattedMessage
                                    id='channel_header.addChannelHeader'
                                    defaultMessage='Add a channel description'
                                />
                                <FormattedMessage
                                    id='channel_header.editLink'
                                    defaultMessage='(Edit)'
                                >
                                    {(message) => <span className='button__edit ml-1'>{message}</span>}
                                </FormattedMessage>
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
                                className='header-placeholder style--none'
                                onClick={this.showEditChannelHeaderModal}
                            >
                                <FormattedMessage
                                    id='channel_header.addChannelHeader'
                                    defaultMessage='Add a channel description'
                                />
                                <FormattedMessage
                                    id='channel_header.editLink'
                                    defaultMessage='(Edit)'
                                >
                                    {(message) => <span className='button__edit ml-1'>{message}</span>}
                                </FormattedMessage>
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
            const formattedMessage = isFavorite ? {
                id: 'channelHeader.removeFromFavorites',
                defaultMessage: 'Remove from Favorites',
            } : {
                id: 'channelHeader.addToFavorites',
                defaultMessage: 'Add to Favorites',
            };

            ariaLabel = formatMessage(formattedMessage).toLowerCase();
            toggleFavoriteTooltip = (
                <Tooltip id='favoriteTooltip' >
                    <FormattedMessage
                        {...formattedMessage}
                    />
                </Tooltip>
            );

            toggleFavorite = (
                <OverlayTrigger
                    key={`isFavorite-${isFavorite}`}
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

        let pinnedIconClass = 'channel-header__icon channel-header__icon--wide';
        if (rhsState === RHSStates.PIN) {
            pinnedIconClass += ' channel-header__icon--active';
        }

        let mentionsIconClass = 'channel-header__icon';
        if (rhsState === RHSStates.MENTION) {
            mentionsIconClass += ' channel-header__icon--active';
        }

        let flaggedIconClass = 'channel-header__icon';
        if (rhsState === RHSStates.FLAG) {
            flaggedIconClass += ' channel-header__icon--active';
        }
        const pinnedIcon = (this.props.pinnedPostsCount ?
            (<React.Fragment>
                <PinIcon
                    className='icon icon--standard'
                    aria-hidden='true'
                />
                <span
                    id='channelPinnedPostCountText'
                    className='icon__text'
                >
                    {this.props.pinnedPostsCount}
                </span>
            </React.Fragment>) : (
                <PinIcon
                    className='icon icon--standard'
                    aria-hidden='true'
                />));

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
                role='banner'
                tabIndex='-1'
                data-channelid={`${channel.id}`}
                className='channel-header alt a11y__region'
                data-a11y-sort-order='8'
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
                        iconComponent={pinnedIcon}
                        ariaLabel={true}
                        buttonClass={pinnedIconClass}
                        buttonId={'channelHeaderPinButton'}
                        onClick={this.showPinnedPosts}
                        tooltipKey={'pinnedPosts'}
                    />

                    {this.state.showSearchBar ? (
                        <div
                            id='searchbarContainer'
                            className='flex-child search-bar__container'
                        >
                            <SearchBar
                                showMentionFlagBtns={false}
                                isFocus={Utils.isMobile() || (this.props.rhsOpen && Boolean(this.props.rhsState))}
                            />
                        </div>
                    ) : (
                        <HeaderIconWrapper
                            iconComponent={
                                <SearchIcon
                                    className='icon icon--standard'
                                    aria-hidden='true'
                                />
                            }
                            ariaLabel={true}
                            buttonId={'channelHeaderSearchButton'}
                            onClick={this.searchButtonClick}
                            tooltipKey={'search'}
                        />
                    )}
                    <HeaderIconWrapper
                        iconComponent={
                            <MentionsIcon
                                className='icon icon--standard'
                                aria-hidden='true'
                            />
                        }
                        ariaLabel={true}
                        buttonClass={mentionsIconClass}
                        buttonId={'channelHeaderMentionButton'}
                        onClick={this.searchMentions}
                        tooltipKey={'recentMentions'}
                    />
                    <HeaderIconWrapper
                        iconComponent={
                            <FlagIcon className='icon icon__flag'/>
                        }
                        ariaLabel={true}
                        buttonClass={flaggedIconClass}
                        buttonId={'channelHeaderFlagButton'}
                        onClick={this.getFlagged}
                        tooltipKey={'flaggedPosts'}
                    />
                    <UserGuideDropdown/>
                </div>
            </div>
        );
    }
}

export default injectIntl(ChannelHeader);
/* eslint-enable react/no-string-refs */
