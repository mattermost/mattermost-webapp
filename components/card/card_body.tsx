// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect, useRef} from 'react';
import classNames from 'classnames';

import './card.scss';

export default function CardBody(props: {expanded?: boolean; children: React.ReactNode}) {
    const card = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | undefined>(0);

    let hasListener = false;
    const onChange = () => setHeight(card.current?.scrollHeight);

    useEffect(() => {
        if (hasListener) {
            window.removeEventListener('resize', onChange);
        } else {
            window.addEventListener('resize', onChange);
            hasListener = true;
        }
    }, []);

    useEffect(() => {
        onChange();
    }, [props.expanded]);

    return (
        <div
            ref={card}
            style={{
                height: props.expanded ? height : '',
            }}
            className={classNames('Card__body', {expanded: props.expanded})}
        >
            {props.children}
        </div>
    );
}
