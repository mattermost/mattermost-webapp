// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {getRhsSize} from 'selectors/rhs';
import LocalStorageStore from 'stores/local_storage_store';
import {RHS_MIN_MAX_WIDTH} from 'utils/constants';
import {isOverLimit, isResizableSize, requestAnimationFrameForMouseMove, shouldRhsOverlapChannelView, shouldSnapWhenSizeGrown, shouldSnapWhenSizeShrunk} from '../utils';

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

    const [isResizeLineSelected, setIsResizeLineSelected] = useState(false);
    const previousClientX = useRef(0);

    const rhsSize = useSelector(getRhsSize);
    const userId = useSelector(getCurrentUserId);

    const minWidth = useMemo(() => RHS_MIN_MAX_WIDTH[rhsSize].min, [rhsSize]);
    const maxWidth = useMemo(() => RHS_MIN_MAX_WIDTH[rhsSize].max, [rhsSize]);
    const defaultWidth = useMemo(() => RHS_MIN_MAX_WIDTH[rhsSize].default, [rhsSize]);

    const isRhsResizable = useMemo(() => isResizableSize(rhsSize), [rhsSize]);
    const shouldRhsOverlap = useMemo(() => shouldRhsOverlapChannelView(rhsSize), [rhsSize]);

    const handleDoubleClick = useCallback(() => {
        if (rhsRef.current) {
            rhsRef.current.style.width = `${defaultWidth}px`;
            rhsRef.current.classList.add('sidebar--right-double-clicked');

            setTimeout(() => {
                if (rhsRef.current) {
                    rhsRef.current.classList.remove('sidebar--right-double-clicked');
                }
            });
        }

        if (!shouldRhsOverlap && forwardRef.current) {
            forwardRef.current.style.width = `${defaultWidth}px`;
            forwardRef.current.classList.add('sidebar--right-double-clicked');

            setTimeout(() => {
                if (forwardRef.current) {
                    forwardRef.current.classList.remove('sidebar--right-double-clicked');
                }
            });
        }

        LocalStorageStore.setRhsWidth(userId, defaultWidth);
    }, [defaultWidth, forwardRef, shouldRhsOverlap, userId]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!isRhsResizable) {
            return;
        }

        previousClientX.current = e.clientX;
        setIsResizeLineSelected(true);
        document.body.style.cursor = 'col-resize';

        if (rhsRef.current && forwardRef.current) {
            rhsRef.current.classList.add('sidebar--right-dragged');
            forwardRef.current.classList.add('sidebar--right-dragged');
        }
    }, [forwardRef, isRhsResizable]);

    const handleMouseMove = useCallback(requestAnimationFrameForMouseMove((e: MouseEvent) => {
        if (!rhsRef.current || !forwardRef.current || !previousClientX.current || !resizeLineRef.current) {
            return;
        }

        if (!isResizeLineSelected) {
            return;
        }

        e.preventDefault();

        const prevWidth = rhsRef.current?.getBoundingClientRect().width ?? 0;
        const widthDiff = previousClientX.current - e.clientX;
        const newWidth = prevWidth + widthDiff;

        previousClientX.current = e.clientX;

        if (resizeLineRef.current.classList.contains('snapped')) {
            return;
        }

        if (isOverLimit(newWidth, maxWidth, minWidth)) {
            return;
        }

        if (shouldSnapWhenSizeGrown(newWidth, prevWidth, defaultWidth) || shouldSnapWhenSizeShrunk(newWidth, prevWidth, defaultWidth)) {
            LocalStorageStore.setRhsWidth(userId, defaultWidth);
            rhsRef.current.style.width = `${defaultWidth}px`;
            if (!shouldRhsOverlap) {
                forwardRef.current.style.width = `${defaultWidth}px`;
            }

            resizeLineRef.current.classList.add('snapped');
            setTimeout(() => {
                if (resizeLineRef.current) {
                    resizeLineRef.current.classList.remove('snapped');
                }
            }, 500);

            return;
        }

        if (!shouldRhsOverlap) {
            forwardRef.current.style.width = `${newWidth}px`;
        }
        LocalStorageStore.setRhsWidth(userId, newWidth);
        rhsRef.current.style.width = `${newWidth}px`;
    }), [forwardRef, maxWidth, minWidth, defaultWidth, shouldRhsOverlap, isResizeLineSelected, userId]);

    const handleMouseUp = useCallback(() => {
        setIsResizeLineSelected(false);
        document.body.style.cursor = 'auto';

        if (!rhsRef.current || !forwardRef.current) {
            return;
        }

        rhsRef.current.classList.remove('sidebar--right-dragged');
        forwardRef.current.classList.remove('sidebar--right-dragged');
    }, [forwardRef]);

    useEffect(() => {
        if (!isResizeLineSelected) {
            return () => {};
        }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp, isResizeLineSelected]);

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

    useEffect(() => {
        if (!rhsRef.current || !forwardRef.current) {
            return;
        }

        const savedRhsWidth = LocalStorageStore.getRhsWidth(userId);

        if (!savedRhsWidth) {
            return;
        }

        if (!shouldRhsOverlap) {
            forwardRef.current.style.width = `${savedRhsWidth}px`;
        }
        rhsRef.current.style.width = `${savedRhsWidth}px`;
    }, [forwardRef, shouldRhsOverlap, userId]);

    return (
        <div
            id={id}
            className={className}
            role={role}
            ref={rhsRef}
        >
            {children}

            {isRhsResizable &&
            <div

                id='resizeRHSLine'
                ref={resizeLineRef}
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
            />}
        </div>
    );
}

export default React.forwardRef(Resizable);
