// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import IconButton from '@mattermost/compass-components/components/icon-button';
import ThemeProvider, {darkTheme} from '@mattermost/compass-components/utilities/theme';
import Flex from '@mattermost/compass-components/utilities/layout/Flex';
import Spacing from '@mattermost/compass-components/utilities/spacing';
import {
    RHSStates
} from 'utils/constants';

const theme = {
    ...darkTheme,
    background: {
        ...darkTheme.background,
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

const HEADER_ICON = 'channel-header__icon';
const HEADER_ICON_ACTIVE = 'channel-header__icon--active';

class GlobalIconsWrapper extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

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

    getSaved = (e: React.MouseEvent<HTMLButtonElement>) => {
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

    render() {
        const {
            rhsOpen,
            rhsState,
        } = this.props;

        return (
            <ThemeProvider theme={theme}>
                <Flex
                    row
                    alignment={'center'}
                >
                    <IconButton icon={'at'} className={classNames({[HEADER_ICON_ACTIVE]: rhsState === RHSStates.MENTION})} onClick={this.mentionButtonClick}/>
                    <IconButton icon={'bookmark-outline'} className={classNames({[HEADER_ICON_ACTIVE]: rhsState === RHSStates.FLAG})} onClick={this.getSaved}/>
                    <IconButton icon={'settings-outline'} onClick={() => {}}/>
                </Flex>
            </ThemeProvider>
        );
    }
}

export default GlobalIconsWrapper;
