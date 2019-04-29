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
import FlagIcon from 'components/svg/flag_icon';
import MentionsIcon from 'components/svg/mentions_icon';
import PinIcon from 'components/svg/pin_icon';
import SearchIcon from 'components/svg/search_icon';
import ArchiveIcon from 'components/svg/archive_icon';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import QuickSwitchModal from 'components/quick_switch_modal';
import {ChannelHeaderDropdown} from 'components/channel_header_dropdown';
import MenuWrapper from 'components/widgets/menu/menu_wrapper.jsx';

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
        dmBot: PropTypes.object,
        isFavorite: PropTypes.bool,
        isReadOnly: PropTypes.bool,
        isMuted: PropTypes.bool,
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
            loadBot: PropTypes.func.isRequired,
        }).isRequired,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    constructor(props) {
        super(props);

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
        if (this.props.dmUser && this.props.dmUser.is_bot) {
            this.props.actions.loadBot(this.props.dmUser.id);
        }
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
        const dmUser = this.props.dmUser;
        const prevDmUser = prevProps.dmUser || {};
        if (dmUser && dmUser.id !== prevDmUser.id && dmUser.is_bot) {
            this.props.actions.loadBot(dmUser.id);
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
            dmBot,
            rhsState,
        } = this.props;
        const {formatMessage} = this.context.intl;

        const channelIsArchived = channel.delete_at !== 0;
        if (Utils.isEmptyObject(channel) ||
            Utils.isEmptyObject(channelMember) ||
            Utils.isEmptyObject(currentUser) ||
            (!dmUser && channel.type === Constants.DM_CHANNEL) ||
            (dmUser && dmUser.is_bot && !dmBot)
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
        const headerText = (isDirect && dmUser.is_bot) ? dmBot.description : channel.header;
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
                    {editMessage}
                </div>
            );
        }

        let toggleFavoriteTooltip;
        let toggleFavorite = null;
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
            <MenuWrapper>
                <div
                    id='channelHeaderDropdownButton'
                    className='channel-header__top'
                >
                    {toggleFavorite}
                    <strong
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
                        aria-label={formatMessage({id: 'generic_icons.dropdown', defaultMessage: 'Dropdown Icon'})}
                    />
                </div>
                <ChannelHeaderDropdown/>
            </MenuWrapper>
        );
        if (isDirect && dmUser.is_bot) {
            title = (
                <div
                    id='channelHeaderDropdownButton'
                    className='channel-header__top'
                >
                    {toggleFavorite}
                    <strong
                        id='channelHeaderTitle'
                        className='heading'
                    >
                        <span>
                            {archivedIcon}
                            {channelTitle}
                        </span>
                    </strong>
                    <div>
                        <div className='bot-indicator bot-indicator__popoverlist'>
                            <FormattedMessage
                                id='post_info.bot'
                                defaultMessage='BOT'
                            />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div
                id='channel-header'
                data-channelid={`${channel.id}`}
                className='channel-header alt'
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
                                <h2>
                                    {title}
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
