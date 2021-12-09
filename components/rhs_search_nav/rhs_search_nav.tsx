// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import Search from 'components/search';
import FlagIcon from 'components/widgets/icons/flag_icon';
import MentionsIcon from 'components/widgets/icons/mentions_icon';
import {
    Constants,
    RHSStates,
} from 'utils/constants';

import * as Utils from 'utils/utils';

import HeaderIconWrapper from 'components/channel_header/components/header_icon_wrapper';

import UserGuideDropdown from './components/user_guide_dropdown';

const SEARCH_BAR_MINIMUM_WINDOW_SIZE = 1140;

type Props = {
    rhsState: typeof RHSStates[keyof typeof RHSStates] | null;
    rhsOpen: boolean;
    actions: {
        showFlaggedPosts: () => void;
        showMentions: () => void;
        openRHSSearch: () => void;
        closeRightHandSide: () => void;
    };
};

type State = {
    windowWidth: number;
};

const HEADER_ICON = 'channel-header__icon';
const HEADER_ICON_ACTIVE = 'channel-header__icon--active';

class RHSSearchNav extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {windowWidth: window.innerWidth};
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleShortcut);
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleShortcut);
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize = () => {
        this.setState({windowWidth: window.innerWidth});
    };

    shouldShowSearchBar = () => {
        const isMobile = this.state.windowWidth <= Constants.MOBILE_SCREEN_WIDTH;
        return !isMobile && (this.state.windowWidth > SEARCH_BAR_MINIMUM_WINDOW_SIZE || this.props.rhsOpen);
    }

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
        if (Utils.cmdOrCtrlPressed(e) && e.shiftKey) {
            if (Utils.isKeyPressed(e, Constants.KeyCodes.M)) {
                e.preventDefault();
                this.searchMentions();
            }
        }
    };

    render() {
        const {
            rhsOpen,
            rhsState,
        } = this.props;

        return (
            <>
                <Search
                    isFocus={Utils.isMobile() || (rhsOpen && Boolean(rhsState))}
                    hideSearchBar={!this.shouldShowSearchBar()}
                    enableFindShortcut={true}
                />
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
                    onClick={this.mentionButtonClick}
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
