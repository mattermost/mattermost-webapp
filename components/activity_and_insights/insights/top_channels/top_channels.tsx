// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import {useIntl} from 'react-intl';

import Card from 'components/card/card';
import CardHeader from 'components/card/card_header';
import CardBody from 'components/card/card_body';

import './../../activity_and_insights.scss';

const TopChannels = () => {
    const {formatMessage} = useIntl();

    return (
        <>
            <Card expanded={true}>
                <CardHeader>
                    {formatMessage({
                        id: 'insights.topChannels',
                        defaultMessage: 'Top Channels',
                    })}
                </CardHeader>
                <CardBody>
                    <></>
                </CardBody>
            </Card>
        </>
    );
};

export default memo(TopChannels);
