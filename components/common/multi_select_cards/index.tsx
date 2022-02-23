// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Constants from 'utils/constants';

import MultiSelectCard, {Props as CardProps} from './multi_select_card';
import './index.scss';

type Props = {
    next?: () => void;
    cards: CardProps[];
    size?: 'regular' | 'small';
}

export default function MultiSelectCards(props: Props) {
    const size = props.size || 'regular';
    const onNext = (e: React.KeyboardEvent) => {
        if (e.key !== Constants.KeyCodes.ENTER[0]) {
            return;
        }
        if (!props.next) {
            return;
        }

        props.next();
    };

    return (
        <div
            onKeyUp={onNext}
            className='MultiSelectCards'
        >
            {props.cards.map((card) => (
                <MultiSelectCard
                    size={size}
                    key={card.id}
                    {...card}
                />
            ))}
        </div>
    );
}
