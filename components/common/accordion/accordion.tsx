// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {RefObject} from 'react';

import AccordionItem from './accordion_item';
import './accordion.scss';

export type AccordionData = {
    title: string;
    description: string;
    items: React.ReactNode;
};

type Props = {
    items: AccordionData[];
    openMultiple?: boolean;
    headerClick?: <T>(ref: RefObject<HTMLLIElement>) => T | void;
};

const Accordion = ({
    items,
    openMultiple,
    headerClick,
}: Props): JSX.Element | null => {
    const [currentIdx, setCurrentIdx] = React.useState(-1);
    const btnOnClick = (idx: number) => {
        setCurrentIdx((currentValue: number) => (currentValue === idx ? -1 : idx));
    };

    return (
        <ul className='Accordion'>
            {items.map((item, idx) => (
                <AccordionItem
                    key={idx.toString()}
                    data={item}
                    isOpen={idx === currentIdx}
                    btnOnClick={() => btnOnClick(idx)}
                    openMultiple={Boolean(openMultiple)}
                    headerClick={headerClick}
                />
            ))}
        </ul>
    );
};

export default Accordion;
