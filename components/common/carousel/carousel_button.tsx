// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {useIntl} from 'react-intl';

import './carousel.scss';

type Props = {
    direction: string;
    moveSlide: () => void;
    disabled?: boolean;
}

enum Destination {
    NEXT = 'next',
    PREV = 'prev',
}
const CarouselButton: React.FC<Props> = ({direction, moveSlide, disabled}: Props): JSX.Element | null => {
    const {formatMessage} = useIntl();

    const handleMoveSlide = () => {
        if (disabled) {
            return;
        }
        moveSlide();
    };

    const text = direction === Destination.NEXT ?
        formatMessage({id: 'carousel.nextButton', defaultMessage: 'Next'}) :
        formatMessage({id: 'carousel.PreviousButton', defaultMessage: 'Previous'});

    const disabledClass = disabled ? ' disabled' : '';
    return (
        <a
            onClick={handleMoveSlide}
            className={`${direction === Destination.NEXT ? ' next next-btn' : ' prev previous-btn'}` + disabledClass}
        >
            {direction === Destination.PREV ? <i className='icon-arrow-back-ios'/> : null}
            {text}
            {direction === Destination.NEXT ? <i className='icon-arrow-forward-ios'/> : null}
        </a>
    );
};

export default CarouselButton;
