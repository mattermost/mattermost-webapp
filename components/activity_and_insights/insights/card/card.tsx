// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';
import classnames from 'classnames';
import {useIntl} from 'react-intl';

import Icon from '@mattermost/compass-components/foundations/icon/Icon';

import Card from 'components/card/card';
import CardHeader from 'components/card/card_header';
import CardBody from 'components/card/card_body';
import {CardSize, CardSizes} from '../insights';

import './card.scss';

type Props = {
    class: string;
    children: React.ReactNode;
    title: string;
    subTitle?: string;
    size: CardSize;
}

const InsightsCard = (props: Props) => {
    const {formatMessage} = useIntl();

    return (
        <Card 
            expanded={true}
            className={classnames('insights-card', props.class, {
                large: props.size === CardSizes.large,
                small: props.size === CardSizes.small,
            })}
        >
            <CardHeader>
                <div className='title-and-subtitle'>
                    <div className='text-top'>
                        <h2>
                            {formatMessage({
                                id: 'insights.topChannels.title',
                                defaultMessage: 'Top Channels',
                            })}
                        </h2>
                    </div>
                    <div className='text-bottom'>
                        {formatMessage({
                            id: 'insights.topChannels.subTitle',
                            defaultMessage: 'Most active channels for the team',
                        })}
                    </div>
                </div>
                <span className='icon'>
                    <Icon
                        size={16}
                        glyph={'chevron-right'}
                    />
                </span>
            </CardHeader>
            <div
                className='Card__body expanded'
            >
                {props.children}
            </div>
        </Card>
    );
};

export default memo(InsightsCard);
