// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect, useRef, useState} from 'react';

import './accordion.scss';

type Props = {
    title: string;
    content: string;
    btnOnClick: () => void;
    isOpen: boolean;
};

const AccordionItem: React.FC<Props> = ({
    title,
    content,
    isOpen,
    btnOnClick,
}: Props): JSX.Element | null => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (isOpen) {
            const contentEl = contentRef?.current;
            setHeight(contentEl.scrollHeight);
        } else {
            setHeight(0);
        }
    }, [isOpen]);

    return (
        <li className={`accordion-item ${isOpen ? 'active' : ''}`}>
            <h2 className='accordion-item-title'>
                <button
                    className='accordion-item-btn'
                    onClick={btnOnClick}
                >
                    {title}
                </button>
            </h2>
            <div
                className='accordion-item-container'
                style={{height}}
            >
                <div
                    ref={contentRef}
                    className='accordion-item-content'
                >
                    {content}
                </div>
            </div>
        </li>
    );
};

export default AccordionItem;
