// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ThemeProvider, {lightTheme} from '@mattermost/compass-components/utilities/theme';
import Flex from '@mattermost/compass-components/utilities/layout/Flex';
import Search from 'components/search';
import QuickSwitchModal from 'components/quick_switch_modal';
import {
    Constants,
    ModalIdentifiers,
    RHSStates,
} from 'utils/constants';

import * as Utils from 'utils/utils';

import UserGuideDropdown from '../user_guide_dropdown';

const SEARCH_BAR_MINIMUM_WINDOW_SIZE = 1140;

const theme = {
    ...lightTheme,
    background: {
        ...lightTheme.background,
        shape: 'var(--sidebar-teambar-bg)',
    },
};

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

class GlobalSearchNav extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {showSearchBar: GlobalSearchNav.getShowSearchBar(props)};
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
        return {showSearchBar: GlobalSearchNav.getShowSearchBar(nextProps)};
    }

    static getShowSearchBar(props: Props) {
        return !Utils.isMobile() && (Utils.windowWidth() > SEARCH_BAR_MINIMUM_WINDOW_SIZE || props.rhsOpen);
    }

    handleResize = () => {
        this.setState({showSearchBar: GlobalSearchNav.getShowSearchBar(this.props)});
    };

    mentionButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        this.searchMentions();
    }

    searchMentions = () => {
        const {rhsState, actions: {closeRightHandSide, showMentions}} = this.props;

        if (rhsState === RHSStates.MENTION) {
            closeRightHandSide();
        } else {
            showMentions();
        }
    };

    getFlagged = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (this.props.rhsState === RHSStates.FLAG) {
            this.props.actions.closeRightHandSide();
        } else {
            this.props.actions.showFlaggedPosts();
        }
    };

    searchButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        this.props.actions.openRHSSearch();
    };

    handleShortcut = (e: KeyboardEvent) => {
        const {actions: {closeModal}} = this.props;

        if (Utils.cmdOrCtrlPressed(e) && e.shiftKey) {
            if (Utils.isKeyPressed(e, Constants.KeyCodes.M)) {
                e.preventDefault();
                closeModal(ModalIdentifiers.QUICK_SWITCH);
                this.searchMentions();
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
            <ThemeProvider theme={theme}>
                <Flex row width={450} flex={1} alignment='center'>
                <Search
                    isFocus={Utils.isMobile() || (rhsOpen && Boolean(rhsState))}
                    hideSearchBar={!this.state.showSearchBar}
                    enableFindShortcut={true}
                />
                <UserGuideDropdown/>
                </Flex>
            </ThemeProvider>
        );
    }
}

export default GlobalSearchNav;
