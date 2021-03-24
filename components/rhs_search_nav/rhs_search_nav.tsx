// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import Search from 'components/search';
import FlagIcon from 'components/widgets/icons/flag_icon';
import MentionsIcon from 'components/widgets/icons/mentions_icon';
import SearchIcon from 'components/widgets/icons/search_icon';
import QuickSwitchModal from 'components/quick_switch_modal';
import {
    Constants,
    ModalIdentifiers,
    RHSStates,
} from 'utils/constants';

import * as Utils from 'utils/utils';

import HeaderIconWrapper from 'components/channel_header/components/header_icon_wrapper';

import UserGuideDropdown from './components/user_guide_dropdown';

const SEARCH_BAR_MINIMUM_WINDOW_SIZE = 1140;

type Props = {
    rhsState: typeof RHSStates[keyof typeof RHSStates] | null;
    rhsOpen: boolean;
    isQuickSwitcherOpen?: boolean;
    actions: {
        showFlaggedPosts: () => void;
        showMentions: () => void;
        openRHSSearch: () => void;
        closeRightHandSide: () => void;
        openModal: (modalData: {modalId: string; dialogType: any; dialogProps?: any}) => void;
        closeModal: (modalId: string) => void;
    };
};

type State = {
    showSearchBar: boolean;
};

const HEADER_ICON = 'channel-header__icon';
const HEADER_ICON_ACTIVE = 'channel-header__icon--active';

class RHSSearchNav extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {showSearchBar: RHSSearchNav.getShowSearchBar(props)};
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleShortcut);
        document.addEventListener('keydown', this.handleQuickSwitchKeyPress);
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleShortcut);
        document.removeEventListener('keydown', this.handleQuickSwitchKeyPress);
        window.removeEventListener('resize', this.handleResize);
    }

    static getDerivedStateFromProps(nextProps: Props) {
        return {showSearchBar: RHSSearchNav.getShowSearchBar(nextProps)};
    }

    static getShowSearchBar(props: Props) {
        return !Utils.isMobile() && (Utils.windowWidth() > SEARCH_BAR_MINIMUM_WINDOW_SIZE || props.rhsOpen);
    }

    handleResize = () => {
        this.setState({showSearchBar: RHSSearchNav.getShowSearchBar(this.props)});
    };

    searchMentions = (e: KeyboardEvent) => {
        e.preventDefault();
        const {rhsState, actions: {closeRightHandSide, showMentions}} = this.props;

        if (rhsState === RHSStates.MENTION) {
            closeRightHandSide();
        } else {
            showMentions();
        }
    };

    getFlagged = (e: MouseEvent) => {
        e.preventDefault();
        if (this.props.rhsState === RHSStates.FLAG) {
            this.props.actions.closeRightHandSide();
        } else {
            this.props.actions.showFlaggedPosts();
        }
    };

    searchButtonClick = (e: MouseEvent) => {
        e.preventDefault();

        this.props.actions.openRHSSearch();
    };

    handleShortcut = (e: KeyboardEvent) => {
        const {actions: {closeModal}} = this.props;

        if (Utils.cmdOrCtrlPressed(e) && e.shiftKey) {
            if (Utils.isKeyPressed(e, Constants.KeyCodes.M)) {
                e.preventDefault();
                closeModal(ModalIdentifiers.QUICK_SWITCH);
                this.searchMentions(e);
            }
            if (Utils.isKeyPressed(e, Constants.KeyCodes.L)) {
                // just close the modal if it's open, but let someone else handle the shortcut
                closeModal(ModalIdentifiers.QUICK_SWITCH);
            }
        }
    };

    handleQuickSwitchKeyPress = (e: KeyboardEvent) => {
        if (Utils.cmdOrCtrlPressed(e) && !e.shiftKey && Utils.isKeyPressed(e, Constants.KeyCodes.K)) {
            if (!e.altKey) {
                e.preventDefault();
                this.toggleQuickSwitchModal();
            }
        }
    }

    toggleQuickSwitchModal = () => {
        const {isQuickSwitcherOpen, actions: {openModal, closeModal}} = this.props;

        if (isQuickSwitcherOpen) {
            closeModal(ModalIdentifiers.QUICK_SWITCH);
        } else {
            openModal({
                modalId: ModalIdentifiers.QUICK_SWITCH,
                dialogType: QuickSwitchModal,
            });
        }
    }

    render() {
        const {
            rhsOpen,
            rhsState,
        } = this.props;

        return (
            <>
                {this.state.showSearchBar ? (
                    <div
                        id='searchbarContainer'
                        className='flex-child search-bar__container'
                    >
                        <Search
                            isFocus={Utils.isMobile() || (rhsOpen && Boolean(rhsState))}
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
                    buttonClass={classNames(HEADER_ICON, {[HEADER_ICON_ACTIVE]: rhsState === RHSStates.MENTION})}
                    buttonId={'channelHeaderMentionButton'}
                    onClick={this.searchMentions}
                    tooltipKey={'recentMentions'}
                />
                <HeaderIconWrapper
                    iconComponent={
                        <FlagIcon className='icon icon__flag'/>
                    }
                    ariaLabel={true}
                    buttonClass={classNames(HEADER_ICON, {[HEADER_ICON_ACTIVE]: rhsState === RHSStates.FLAG})}
                    buttonId={'channelHeaderFlagButton'}
                    onClick={this.getFlagged}
                    tooltipKey={'flaggedPosts'}
                />
                <UserGuideDropdown/>
            </>
        );
    }
}

export default RHSSearchNav;
