// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {RefObject, useEffect, useRef} from 'react';

import {AccordionDataType} from './accordion';

import './accordion.scss';

type Props = {
    data: AccordionDataType;
    isOpen: boolean;
    onButtonClick: () => void;
    openMultiple: boolean;
    onHeaderClick?: <T>(ref: RefObject<HTMLLIElement>) => T | void;
}

const AccordionItem = ({
    data,
    isOpen,
    onButtonClick,
    openMultiple,
    onHeaderClick,
}: Props): JSX.Element | null => {
    const contentRef = useRef<HTMLDivElement>(null);
    const itemRef = useRef<HTMLLIElement>(null);

    const [height, setHeight] = React.useState(0);

    const [open, setOpen] = React.useState(false);

    const toggle = () => {
        if (openMultiple) {
            setOpen((currentValue: boolean) => !currentValue);
        } else if (onButtonClick) {
            onButtonClick();
        }

        if (onHeaderClick) {
            onHeaderClick(itemRef);
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
                {data.icon && <div className='accordion-item-header__icon'>
                    {data.icon}
                </div>}
                <div className='accordion-item-header__body'>
                    <div className='accordion-item-header__body__title'>
                        {data.title}
                    </div>
                    {data.description && <div className='accordion-item-header__body__description'>
                        {data.description}
                    </div>}
                </div>
                <div className='accordion-item-header__chevron'>
                    <i className='icon-chevron-down'/>
                </div>
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
