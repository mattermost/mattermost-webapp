// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {RefObject, useState} from 'react';

import AccordionItem from './accordion_item';
import './accordion.scss';

export type AccordionItemType = {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    items: React.ReactNode[];
};

type AccordionProps = {
    accordionItemsData: AccordionItemType[];
    expandMultiple?: boolean;
    onHeaderClick?: <T>(ref: RefObject<HTMLLIElement>) => T | void;
};

const Accordion = ({
    accordionItemsData,
    expandMultiple,
    onHeaderClick,
}: AccordionProps): JSX.Element | null => {
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [currentIndexes, setCurrentIndexes] = useState<number[]>([]);
    const singleExpanded = (index: number) => {
        setCurrentIndex((currentValue: number) => (currentValue === index ? -1 : index));
    };
    const multipleExpanded = (index: number) => {
        if (currentIndexes.includes(index)) {
            const newIndexes = currentIndexes.filter((_index: number) => {
                return index !== _index;
            });
            setCurrentIndexes(newIndexes);
        } else {
            setCurrentIndexes([...currentIndexes, index]);
        }
    };

    const onButtonClick = expandMultiple ? multipleExpanded : singleExpanded;

    return (
        <ul className='Accordion'>
            {accordionItemsData.map((accordionItem, index) => {
                const isExpanded = Boolean((expandMultiple ? (currentIndexes.includes(index)) : (index === currentIndex)));
                return (
                    <AccordionItem
                        key={index.toString()}
                        data={accordionItem}
                        isExpanded={isExpanded}
                        onButtonClick={() => onButtonClick(index)}
                        onHeaderClick={onHeaderClick}
                    />
                );
            })}
        </ul>
    );
};

export default Accordion;
