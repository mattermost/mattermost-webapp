// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {HTMLAttributes, useCallback, useEffect, useMemo, useRef} from 'react';
import {useSelector} from 'react-redux';

import {getRhsSize} from 'selectors/rhs';
import {RHS_MIN_MAX_WIDTH} from 'utils/constants';
import {isOverLimit, isResizableSize, shouldRhsOverlapChannelView, shouldSnapWhenSizeGrown, shouldSnapWhenSizeShrunk} from '../utils';

interface Props extends HTMLAttributes<'div'> {
    children: React.ReactNode;
}

function Resizable({
    role,
    children,
    id,
    className,
}: Props, ref: React.Ref<HTMLDivElement>) {
    const forwardRef = ref as React.RefObject<HTMLDivElement>;
    const rhsRef = useRef<HTMLDivElement>(null);
    const resizeLineRef = useRef<HTMLDivElement>(null);

    const isResizeLineDragging = useRef(false);
    const previousClientX = useRef(0);

    const rhsSize = useSelector(getRhsSize);

    const minWidth = useMemo(() => RHS_MIN_MAX_WIDTH[rhsSize].min, [rhsSize]);
    const maxWidth = useMemo(() => RHS_MIN_MAX_WIDTH[rhsSize].max, [rhsSize]);
    const defaultWidth = useMemo(() => RHS_MIN_MAX_WIDTH[rhsSize].default, [rhsSize]);

    const isRhsResizable = useMemo(() => isResizableSize(rhsSize), [rhsSize]);
    const shouldRhsOverlap = useMemo(() => shouldRhsOverlapChannelView(rhsSize), [rhsSize]);

    const handleDoubleClick = useCallback(() => {
        if (rhsRef.current) {
            rhsRef.current.style.width = `${defaultWidth}px`;
        }

        if (!shouldRhsOverlap && forwardRef.current) {
            forwardRef.current.style.width = `${defaultWidth}px`;
        }
    }, [defaultWidth, forwardRef, shouldRhsOverlap]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!isRhsResizable) {
            return;
        }

        previousClientX.current = e.clientX;
        isResizeLineDragging.current = true;
        document.body.style.cursor = 'col-resize';

        if (rhsRef.current && forwardRef.current) {
            rhsRef.current.classList.add('sidebar--right-dragged');
            forwardRef.current.classList.add('sidebar--right-dragged');
        }
    }, [forwardRef, isRhsResizable]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!rhsRef.current || !forwardRef.current || !previousClientX.current || !resizeLineRef.current) {
            return;
        }

        if (!isResizeLineDragging.current) {
            return;
        }

        e.preventDefault();

        const prevWidth = rhsRef.current?.getBoundingClientRect().width ?? 0;
        const widthDiff = previousClientX.current - e.clientX;
        const newWidth = prevWidth + widthDiff;

        previousClientX.current = e.clientX;

        if (isOverLimit(newWidth, maxWidth, minWidth)) {
            return;
        }

        if (shouldSnapWhenSizeGrown(newWidth, prevWidth, maxWidth)) {
            rhsRef.current.style.width = `${maxWidth}px`;
            if (!shouldRhsOverlap) {
                forwardRef.current.style.width = `${maxWidth}px`;
            }

            resizeLineRef.current.classList.add('limit-reached');
            setTimeout(() => {
                if (resizeLineRef.current) {
                    resizeLineRef.current.classList.remove('limit-reached');
                }
            }, 800);

            return;
        }

        if (shouldSnapWhenSizeShrunk(newWidth, prevWidth, minWidth)) {
            rhsRef.current.style.width = `${minWidth}px`;
            if (!shouldRhsOverlap) {
                forwardRef.current.style.width = `${minWidth}px`;
            }

            resizeLineRef.current.classList.add('limit-reached');
            setTimeout(() => {
                if (resizeLineRef.current) {
                    resizeLineRef.current.classList.remove('limit-reached');
                }
            }, 800);

            return;
        }

        if (!shouldRhsOverlap) {
            forwardRef.current.style.width = `${newWidth}px`;
        }
        rhsRef.current.style.width = `${newWidth}px`;
    }, [forwardRef, maxWidth, minWidth, shouldRhsOverlap]);

    const handleMouseUp = useCallback(() => {
        isResizeLineDragging.current = false;
        document.body.style.cursor = 'auto';

        if (!rhsRef.current || !forwardRef.current) {
            return;
        }

        rhsRef.current.classList.remove('sidebar--right-dragged');
        forwardRef.current.classList.remove('sidebar--right-dragged');
    }, [forwardRef]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    useEffect(() => {
        if (!rhsRef.current || !forwardRef.current) {
            return;
        }

        const rhsWidth = rhsRef.current.getBoundingClientRect().width;

        if (rhsWidth > maxWidth) {
            rhsRef.current.style.width = `${maxWidth}px`;
            forwardRef.current.style.width = `${maxWidth}px`;
        }

        if (rhsWidth < minWidth) {
            rhsRef.current.style.width = `${minWidth}px`;
            forwardRef.current.style.width = `${minWidth}px`;
        }
    }, [forwardRef, maxWidth, minWidth]);

    return (
        <div
            id={id}
            className={className}
            role={role}
            ref={rhsRef}
        >
            {children}

            <div

                id='resizeRHSLine'
                ref={resizeLineRef}
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
            />
        </div>
    );
}

export default React.forwardRef(Resizable);
