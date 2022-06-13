// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import styled from 'styled-components';

import {Channel} from '@mattermost/types/channels';
import {getIsRhsOpen} from 'selectors/rhs';

import {closeRightHandSide, showChannelInfo} from 'actions/views/rhs';

import HeaderIconWrapper from './components/header_icon_wrapper';

interface Props {
    channel: Channel;
}

const Icon = styled.i`
    font-size:18px;
    line-height:18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
`;

const ChannelInfoButton = ({channel}: Props) => {
    const dispatch = useDispatch();

    const isRhsOpen: boolean = useSelector(getIsRhsOpen);
    const rhsOpenOnChannelInfo = isRhsOpen;

    const toggleRHS = useCallback(() => {
        if (isRhsOpen) {
            dispatch(closeRightHandSide());
        } else {
            dispatch(showChannelInfo(channel.id));
        }
    }, [isRhsOpen, channel.id, dispatch]);

    const tooltipKey = rhsOpenOnChannelInfo ? 'closeChannelInfo' : 'openChannelInfo';

    let buttonClass = 'channel-header__icon';
    if (rhsOpenOnChannelInfo) {
        buttonClass += ' channel-header__icon--active-inverted';
    }

    return (
        <HeaderIconWrapper
            buttonClass={buttonClass}
            buttonId='channel-info-btn'
            onClick={toggleRHS}
            iconComponent={<Icon className='icon-information-outline'/>}
            tooltipKey={tooltipKey}
        />
    );
};

export default ChannelInfoButton;
