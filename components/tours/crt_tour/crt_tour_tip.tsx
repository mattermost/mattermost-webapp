// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {ChannelsTourTip, ChannelsTourTipProps} from 'components/tours';

import {useCrtTourManager} from './crt_tour_manager';

const CRTTourTip = (props: Omit<ChannelsTourTipProps, 'manager'>) => {
    return (
        <ChannelsTourTip
            {...props}
            manager={useCrtTourManager}
        />
    );
};

export default CRTTourTip;
