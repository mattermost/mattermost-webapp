// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {HTMLAttributes, useCallback, useEffect, useMemo, useRef} from 'react';
import {useSelector} from 'react-redux';

import {getLhsSize} from 'selectors/lhs';
import {DEFAULT_LHS_WIDTH, LHS_MIN_MAX_WIDTH} from 'utils/constants';
import {isOverLimit, isResizableSize, shouldSnapWhenSizeGrown, shouldSnapWhenSizeShrunk} from '../utils';

interface Props extends HTMLAttributes<'div'> {
    children: React.ReactNode;
}

function Resizable({
    children,
    id,
    className,
}: Props) {
    const lhsRef = useRef<HTMLDivElement>(null);
    const resizeLineRef = useRef<HTMLDivElement>(null);

    const isResizeLineSelected = useRef(false);
    const previousClientX = useRef(0);

    const lhsSize = useSelector(getLhsSize);

    const minWidth = useMemo(() => LHS_MIN_MAX_WIDTH[lhsSize].min, [lhsSize]);
    const maxWidth = useMemo(() => LHS_MIN_MAX_WIDTH[lhsSize].max, [lhsSize]);

    const isLhsResizable = useMemo(() => isResizableSize(lhsSize), [lhsSize]);

    const handleDoubleClick = useCallback(() => {
        if (lhsRef.current) {
            lhsRef.current.style.width = `${DEFAULT_LHS_WIDTH}px`;
        }
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!isLhsResizable) {
            return;
        }

        previousClientX.current = e.clientX;
        isResizeLineSelected.current = true;
        document.body.style.cursor = 'col-resize';

        if (lhsRef.current) {
            lhsRef.current.classList.add('sidebar--left-dragged');
        }
    }, [isLhsResizable]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!lhsRef.current || !previousClientX.current || !resizeLineRef.current) {
            return;
        }

        if (!isResizeLineSelected.current) {
            return;
        }

        e.preventDefault();

        const prevWidth = lhsRef.current.getBoundingClientRect().width;
        const widthDiff = e.clientX - previousClientX.current;
        const newWidth = prevWidth + widthDiff;

        previousClientX.current = e.clientX;

        if (isOverLimit(newWidth, maxWidth, minWidth)) {
            return;
        }

        if (shouldSnapWhenSizeGrown(newWidth, prevWidth, maxWidth)) {
            lhsRef.current.style.width = `${maxWidth}px`;
            resizeLineRef.current.classList.add('limit-reached');
            setTimeout(() => {
                if (resizeLineRef.current) {
                    resizeLineRef.current.classList.remove('limit-reached');
                }
            }, 800);
            return;
        }

        if (shouldSnapWhenSizeShrunk(newWidth, prevWidth, minWidth)) {
            lhsRef.current.style.width = `${minWidth}px`;
            resizeLineRef.current.classList.add('limit-reached');
            setTimeout(() => {
                if (resizeLineRef.current) {
                    resizeLineRef.current.classList.remove('limit-reached');
                }
            }, 800);
            return;
        }

        lhsRef.current.style.width = `${newWidth}px`;
    }, [maxWidth, minWidth]);

    const handleMouseUp = useCallback(() => {
        isResizeLineSelected.current = false;
        document.body.style.cursor = 'auto';

        if (lhsRef.current) {
            lhsRef.current.classList.remove('sidebar--left-dragged');
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp, lhsSize]);

    useEffect(() => {
        if (!lhsRef.current) {
            return;
        }

        const lhsWidth = lhsRef.current.getBoundingClientRect().width;

        if (lhsWidth > maxWidth) {
            lhsRef.current.style.width = `${maxWidth}px`;
        }

        if (lhsWidth < minWidth) {
            lhsRef.current.style.width = `${minWidth}px`;
        }
    }, [maxWidth, minWidth]);

    return (
        <div
            id={id}
            className={className}
            ref={lhsRef}
        >
            {children}

            {isLhsResizable &&
            <div
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
                id='resizeLine'
                ref={resizeLineRef}
            />}
        </div>
    );
}

export default Resizable;
