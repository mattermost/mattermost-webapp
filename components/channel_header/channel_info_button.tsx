// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useDispatch, useSelector} from 'react-redux';

import InfoIcon from 'components/widgets/icons/info_icon';
import {Channel} from 'mattermost-redux/types/channels';
import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import {RHSStates} from 'utils/constants';
import {RhsState} from 'types/store/rhs';
import {closeRightHandSide, showChannelInfo} from 'actions/views/rhs';

import HeaderIconWrapper from './components/header_icon_wrapper';

interface Props {
    channel: Channel;
}

const ChannelInfoButton: React.FC<Props> = (props: Props) => {
    const {channel} = props;

    const dispatch = useDispatch();

    const isRhsOpen: boolean = useSelector(getIsRhsOpen);
    const rhsState: RhsState = useSelector(getRhsState);

    const toggleRHS = () => {
        if (rhsState === RHSStates.CHANNEL_INFO) {
            dispatch(closeRightHandSide());
        } else {
            dispatch(showChannelInfo(channel.id));
        }
    };

    return (
        <HeaderIconWrapper
            buttonId='channel-info-btn'
            onClick={toggleRHS}
            iconComponent={<InfoIcon/>}
            tooltipKey='test'
            isRhsOpen={isRhsOpen}
        />
    );
};

export default ChannelInfoButton;
