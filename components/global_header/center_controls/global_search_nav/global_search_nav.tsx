// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import Flex from '@mattermost/compass-components/utilities/layout/Flex';

import {closeRightHandSide, showMentions} from 'actions/views/rhs';
import Search from 'components/search';
import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import {getIsMobileView} from 'selectors/views/browser';

import {
    Constants,
    RHSStates,
} from 'utils/constants';
import * as Utils from 'utils/utils';

const GlobalSearchNav = (): JSX.Element => {
    const dispatch = useDispatch();
    const rhsState = useSelector(getRhsState);
    const isRhsOpen = useSelector(getIsRhsOpen);
    const isMobileView = useSelector(getIsMobileView);

    useEffect(() => {
        document.addEventListener('keydown', handleShortcut);
        return () => {
            document.removeEventListener('keydown', handleShortcut);
        };
    }, []);

    const searchMentions = () => {
        if (rhsState === RHSStates.MENTION) {
            dispatch(closeRightHandSide());
        } else {
            dispatch(showMentions());
        }
    };

    const handleShortcut = (e: KeyboardEvent) => {
        if (Utils.cmdOrCtrlPressed(e) && e.shiftKey) {
            if (Utils.isKeyPressed(e, Constants.KeyCodes.M)) {
                e.preventDefault();
                searchMentions();
            }
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
                isFocus={isMobileView || (isRhsOpen && Boolean(rhsState))}
                enableFindShortcut={true}
            />
        </Flex>
    );
};

export default GlobalSearchNav;
