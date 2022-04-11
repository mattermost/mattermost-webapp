// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';
import classNames from 'classnames';

import Icon from '@mattermost/compass-components/foundations/icon/Icon';

import Card from 'components/card/card';
import CardHeader from 'components/card/card_header';
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
    return (
        <Card
            className={classNames('insights-card expanded', props.class, {
                large: props.size === CardSizes.large,
                medium: props.size === CardSizes.medium,
                small: props.size === CardSizes.small,
            })}
        >
            <CardHeader>
                <div className='title-and-subtitle'>
                    <div className='text-top'>
                        <h2>
                            {props.title}
                        </h2>
                    </div>
                    <div className='text-bottom'>
                        {props.subTitle}
                    </div>
                </div>
                <button className='icon'>
                    <Icon
                        size={16}
                        glyph={'chevron-right'}
                    />
                </button>
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
