// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {RefObject, useEffect, useRef, useState} from 'react';

import {AccordionData} from './accordion';

import './accordion.scss';

type Props = {
    data: AccordionData;
    isOpen: boolean;
    btnOnClick: () => void;
    openMultiple: boolean;
    headerClick?: <T>(ref: RefObject<HTMLLIElement>) => T | void;
}

const AccordionItem = ({
    data,
    isOpen,
    btnOnClick,
    openMultiple,
    headerClick,
}: Props): JSX.Element | null => {
    const contentRef = useRef<HTMLDivElement>(null);
    const itemRef = useRef<HTMLLIElement>(null);

    const [height, setHeight] = useState(0);

    const [open, setOpen] = React.useState(false);

    const toggle = () => {
        if (openMultiple) {
            setOpen((currentValue: boolean) => !currentValue);
        } else if (btnOnClick) {
            btnOnClick();
        }

        if (headerClick) {
            headerClick(itemRef);
        }
    };

    useEffect(() => {
        if (!contentRef?.current) {
            return;
        }
        if (isOpen || open) {
            const contentEl = contentRef.current;
            setHeight(contentEl.scrollHeight);
        } else {
            setHeight(0);
        }
    }, [isOpen, open]);

    const itemOpened = openMultiple ? open : isOpen;

    return (
        <li
            className={`accordion-item ${itemOpened ? 'active' : ''}`}
            ref={itemRef}
        >
            <div
                className='accordion-item-header'
                onClick={toggle}
                role='button'
            >
                <div className='accordion-item-header__title'>
                    {data.title}
                </div>
                {data.description && <div className='accordion-item-header__description'>
                    {data.description}
                </div>}
            </div>
            <div
                className='accordion-item-container'
                style={{height}}
            >
                <div
                    ref={contentRef}
                    className='accordion-item-container__content'
                >
                    {data.items}
                </div>
            </div>
        </li>
    );
};

export default AccordionItem;
