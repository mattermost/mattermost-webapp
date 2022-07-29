// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {Channel} from '@mattermost/types/channels';
import {getIsRhsOpen, getRhsState} from 'selectors/rhs';

import {closeRightHandSide, showChannelInfo} from 'actions/views/rhs';

import {RHSStates} from 'utils/constants';
import {RhsState} from 'types/store/rhs';

import HeaderIconWrapper from './components/header_icon_wrapper';

interface Props {
    channel: Channel;
}

const ChannelInfoButton = ({channel}: Props) => {
    const dispatch = useDispatch();

    const rhsState: RhsState = useSelector(getRhsState);
    const isRhsOpen: boolean = useSelector(getIsRhsOpen);
    const isChannelInfo = rhsState === RHSStates.CHANNEL_INFO;

    const buttonActive = isRhsOpen && isChannelInfo;
    const toggleRHS = useCallback(() => {
        if (buttonActive) {
            const action = isChannelInfo ? closeRightHandSide() : showChannelInfo(channel.id);
            dispatch(action);
        } else {
            dispatch(showChannelInfo(channel.id));
        }
    }, [buttonActive, channel.id, isChannelInfo, dispatch]);

    const tooltipKey = buttonActive ? 'closeChannelInfo' : 'openChannelInfo';

    let buttonClass = 'channel-header__icon channel-header__icon--wide channel-header__icon--left';
    if (buttonActive) {
        buttonClass += ' channel-header__icon--active';
    }

    return (
        <HeaderIconWrapper
            buttonClass={buttonClass}
            buttonId='channel-info-btn'
            onClick={toggleRHS}
            iconComponent={<i className='icon icon-information-outline'/>}
            tooltipKey={tooltipKey}
        />
    );
};

export default ChannelInfoButton;
