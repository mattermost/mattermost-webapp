// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState, memo, useRef} from 'react';
import {Transition} from 'react-transition-group';
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
    const [overflow, setOverflow] = useState<string>('visible');
    const [childs, setChilds] = useState(children);

    useEffect(() => {
        setAnimate(true);
    }, [children]);

    useEffect(() => {
        if (shouldScrollIntoView) {
            const timeout = setTimeout(() => scrollIntoView(wrapperRef.current!, {
                behavior: 'smooth',
                scrollMode: 'if-needed',
                block: 'center',
            }), 200);
            return () => clearTimeout(timeout);
        }
        return () => {};
    }, [shouldScrollIntoView]);

    return (
        <Transition
            in={animate}
            timeout={0}
            onEnter={() => {
                setHeight('2000');
                setOverflow('hidden');
            }}
            onEntered={() => {
                setHeight('auto');
                setOverflow('visible');
                setAnimate(false);
                setChilds(children);
            }}
        >
            <div
                className={'AutoHeight'}
                ref={wrapperRef}
                style={{overflow}}
            >
                <AnimateHeight
                    duration={duration}
                    height={height}
                >
                    {childs}
                </AnimateHeight>
            </div>
        </Transition>
    );
};

export default memo(AutoHeight);
