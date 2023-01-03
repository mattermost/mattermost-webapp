// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {getLhsSize} from 'selectors/lhs';
import LocalStorageStore from 'stores/local_storage_store';
import {DEFAULT_LHS_WIDTH, LHS_MIN_MAX_WIDTH} from 'utils/constants';
import {isOverLimit, isResizableSize, requestAnimationFrameForMouseMove, shouldSnapWhenSizeGrown, shouldSnapWhenSizeShrunk} from '../utils';

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

    const [isResizeLineSelected, setIsResizeLineSelected] = useState(false);
    const previousClientX = useRef(0);

    const lhsSize = useSelector(getLhsSize);
    const userId = useSelector(getCurrentUserId);

    const minWidth = useMemo(() => LHS_MIN_MAX_WIDTH[lhsSize].min, [lhsSize]);
    const maxWidth = useMemo(() => LHS_MIN_MAX_WIDTH[lhsSize].max, [lhsSize]);

    const isLhsResizable = useMemo(() => isResizableSize(lhsSize), [lhsSize]);

    const handleDoubleClick = useCallback(() => {
        if (lhsRef.current) {
            lhsRef.current.style.width = `${DEFAULT_LHS_WIDTH}px`;
        }

        LocalStorageStore.setLhsWidth(userId, DEFAULT_LHS_WIDTH);
    }, [userId]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!isLhsResizable) {
            return;
        }

        previousClientX.current = e.clientX;
        setIsResizeLineSelected(true);
        document.body.style.cursor = 'col-resize';

        if (lhsRef.current) {
            lhsRef.current.classList.add('sidebar--left-dragged');
        }
    }, [isLhsResizable]);

    const handleMouseMove = useCallback(requestAnimationFrameForMouseMove((e: MouseEvent) => {
        if (!lhsRef.current || !previousClientX.current || !resizeLineRef.current) {
            return;
        }

        if (!isResizeLineSelected) {
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
            LocalStorageStore.setLhsWidth(userId, maxWidth);
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
            LocalStorageStore.setLhsWidth(userId, minWidth);
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
        LocalStorageStore.setLhsWidth(userId, newWidth);
    }), [isResizeLineSelected, maxWidth, minWidth, userId]);

    const handleMouseUp = useCallback(() => {
        setIsResizeLineSelected(false);
        document.body.style.cursor = 'auto';

        if (lhsRef.current) {
            lhsRef.current.classList.remove('sidebar--left-dragged');
        }
    }, []);

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
    }, [handleMouseMove, handleMouseUp, isResizeLineSelected, lhsSize]);

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

    useEffect(() => {
        if (!lhsRef.current) {
            return;
        }

        const savedLhsWidth = LocalStorageStore.getLhsWidth(userId);

        if (!savedLhsWidth) {
            return;
        }
        lhsRef.current.style.width = `${savedLhsWidth}px`;
    }, [userId]);

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
