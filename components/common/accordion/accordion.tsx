// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {RefObject} from 'react';

import AccordionItem from './accordion_item';
import './accordion.scss';

export type AccordionDataType = {
    title: string;
    description: string;
    items: React.ReactNode[];
};

type Props = {
    items: AccordionDataType[];
    openMultiple?: boolean;
    onHeaderClick?: <T>(ref: RefObject<HTMLLIElement>) => T | void;
};

const Accordion = ({
    items,
    openMultiple,
    onHeaderClick,
}: Props): JSX.Element | null => {
    const [currentIndex, setCurrentIndex] = React.useState(-1);
    const onButtonClick = (index: number) => {
        setCurrentIndex((currentValue: number) => (currentValue === index ? -1 : index));
    };

    return (
        <ul className='Accordion'>
            {items.map((item, index) => (
                <AccordionItem
                    key={index.toString()}
                    data={item}
                    isOpen={index === currentIndex}
                    onButtonClick={() => onButtonClick(index)}
                    openMultiple={Boolean(openMultiple)}
                    onHeaderClick={onHeaderClick}
                />
            ))}
        </ul>
    );
};

export default Accordion;
