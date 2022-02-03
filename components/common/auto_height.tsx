// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState, memo, useRef} from 'react';
import {CSSTransition} from 'react-transition-group';
import AnimateHeight from 'react-animate-height';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import './auto_height.scss';

type AutoHeightProps = {
    duration?: number;
    shouldScrollIntoView?: boolean;
    children: React.ReactNode | React.ReactNode[];
};

const AutoHeight = ({children, duration = 250, shouldScrollIntoView = false}: AutoHeightProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [animate, setAnimate] = useState<boolean>(false);
    const [height, setHeight] = useState<string>('auto');
    const [childs, setChilds] = useState(children);

    useEffect(() => {
        setAnimate(true);
        if (shouldScrollIntoView && wrapperRef.current !== null) {
            const timeout = setTimeout(() => scrollIntoView(wrapperRef.current!, {
                behavior: 'smooth',
                scrollMode: 'if-needed',
                block: 'center',
                inline: 'center',
                skipOverflowHiddenElements: true,
            }), duration || 0);
            return () => clearTimeout(timeout);
        }
        return () => {};
    }, [children]);

    return (
        <CSSTransition
            in={animate}
            timeout={0}
            onEnter={() => setHeight('10000')}
            onEntered={() => {
                setHeight('auto');
                setAnimate(false);
                setChilds(children);
            }}
        >
            {() => (
                <div
                    className={'AutoHeight'}
                    ref={wrapperRef}
                >
                    <AnimateHeight
                        duration={duration}
                        delay={150}
                        height={height}
                    >
                        {childs}
                    </AnimateHeight>
                </div>
            )}
        </CSSTransition>
    );
};

export default memo(AutoHeight);
