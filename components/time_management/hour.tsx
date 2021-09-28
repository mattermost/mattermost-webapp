// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';

import {PixelPerMinute} from 'utils/time_management/constants';

const HourRow = styled.div`
    display: flex;
    flex-direction: row;
    flex: 1;
    min-height: ${PixelPerMinute * 60}px;
    max-height: ${PixelPerMinute * 60}px;
    width: 100%;
`;

const HourTime = styled.div`
    flex: 1;
    max-width: 65px;
    margin-top: -11px;
`;

const HourContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
`;

const HalfHourSlot = styled.div`
    border-top: 1px solid rgba(61, 60, 64, 0.16);;
    flex: 1;
`;

type Props = {
    date: Date;
}

const Hour = (props: Props) => {
    const {date} = props;

    return (
        <HourRow>
            <HourTime>
                {moment(date).format('h:00a')}
            </HourTime>
            <HourContent>
                <HalfHourSlot/>
                <HalfHourSlot/>
            </HourContent>
        </HourRow>
    );
};

export default Hour;
