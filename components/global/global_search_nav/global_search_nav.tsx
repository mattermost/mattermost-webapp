// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import Flex from '@mattermost/compass-components/utilities/layout/Flex';

import {closeRightHandSide, showMentions} from 'actions/views/rhs';
import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import {GlobalState} from 'types/store';
import {RhsState} from 'types/store/rhs';
import {
    Constants,
    RHSStates,
} from 'utils/constants';
import * as Utils from 'utils/utils';
import Search from 'components/search';

const GlobalSearchNav: React.FC = (): JSX.Element => {
    const dispatch = useDispatch();
    const rhsState = useSelector<GlobalState, RhsState>((state: GlobalState) => getRhsState(state));
    const isRhsOpen = useSelector<GlobalState, boolean>((state: GlobalState) => getIsRhsOpen(state));

    useEffect((): () => void => {
        document.addEventListener('keydown', handleShortcut);
        return () => {
            document.removeEventListener('keydown', handleShortcut);
        };
    }, []);

    const searchMentions = (): void => {
        dispatch(rhsState === RHSStates.MENTION ? closeRightHandSide() : showMentions());
    };

    const handleShortcut = (e: KeyboardEvent): void => {
        if (Utils.cmdOrCtrlPressed(e) && e.shiftKey && Utils.isKeyPressed(e, Constants.KeyCodes.M)) {
            e.preventDefault();
            searchMentions();
        }
    };

    return (
        <Flex
            row={true}
            width={432}
            flex={1}
            alignment='center'
        >
            <Search
                isFocus={Utils.isMobile() || (isRhsOpen && Boolean(rhsState))}
                enableFindShortcut={true}
            />
        </Flex>
    );
};

export default GlobalSearchNav;
