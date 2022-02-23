// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState, useRef} from 'react';
import {Transition} from 'react-transition-group';
import AnimateHeight from 'react-animate-height';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import './auto_height_switcher.scss';

type AutoHeightProps = {
    showSlot: 1 | 2;
    duration?: number;
    shouldScrollIntoView?: boolean;
    slot1: React.ReactNode | React.ReactNode[];
    slot2: React.ReactNode | React.ReactNode[];
};

const AutoHeightSwitcher = ({showSlot, slot1, slot2, duration = 250, shouldScrollIntoView = false}: AutoHeightProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const prevShow = useRef<AutoHeightProps['showSlot']>(showSlot);
    const [animate, setAnimate] = useState<boolean>(false);
    const [height, setHeight] = useState<string | number>('auto');
    const [overflow, setOverflow] = useState<string>('visible');
    const [child, setChild] = useState(showSlot === 1 ? slot1 : slot2);

    useEffect(() => {
        if (prevShow.current === showSlot) {
            // slot that is currently in view gets updated
            setChild(showSlot === 1 ? slot1 : slot2);
        } else {
            // switch slots using height animation
            setAnimate(true);
            prevShow.current = showSlot;
        }
    }, [showSlot, slot1, slot2]);

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
                setChild(showSlot === 1 ? slot1 : slot2);
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
                    {child}
                </AnimateHeight>
            </div>
        </Transition>
    );
};

export default AutoHeightSwitcher;
