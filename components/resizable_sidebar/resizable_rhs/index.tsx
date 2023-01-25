// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {HTMLAttributes, useCallback, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {getRhsSize} from 'selectors/rhs';
import LocalStorageStore from 'stores/local_storage_store';
import {RHS_MIN_MAX_WIDTH, SidebarSize} from 'utils/constants';
import {isResizableSize, preventAnimation, resetStyle, restoreAnimation, setWidth, shouldRhsOverlapChannelView} from '../utils';
import Resizable from '../resizable';

interface Props extends HTMLAttributes<'div'> {
    children: React.ReactNode;
}

function ResizableRhs({
    role,
    children,
    id,
    className,
}: Props, ref: React.Ref<HTMLDivElement>) {
    const forwardRef = ref as React.RefObject<HTMLDivElement>;

    const rhsSize = useSelector(getRhsSize);
    const userId = useSelector(getCurrentUserId);

    const minWidth = useMemo(() => RHS_MIN_MAX_WIDTH[rhsSize].min, [rhsSize]);
    const maxWidth = useMemo(() => RHS_MIN_MAX_WIDTH[rhsSize].max, [rhsSize]);
    const defaultWidth = useMemo(() => RHS_MIN_MAX_WIDTH[rhsSize].default, [rhsSize]);

    const isRhsResizable = useMemo(() => isResizableSize(rhsSize), [rhsSize]);
    const shouldRhsOverlap = useMemo(() => shouldRhsOverlapChannelView(rhsSize), [rhsSize]);

    const handleInit = useCallback((width: number) => {
        const forwardRefElement = forwardRef.current;

        if (!forwardRefElement) {
            return;
        }
        if (!shouldRhsOverlap) {
            setWidth(forwardRefElement, width);
        } else if (shouldRhsOverlap) {
            setWidth(forwardRefElement, minWidth);
        }

        preventAnimation(forwardRefElement);

        requestAnimationFrame(() => {
            if (forwardRefElement) {
                restoreAnimation(forwardRefElement);
            }
        });
    }, [forwardRef, minWidth, rhsSize, shouldRhsOverlap]);

    const handleLimitChange = useCallback(() => {
        const forwardRefElement = forwardRef.current;

        if (!forwardRefElement) {
            return;
        }

        if (rhsSize === SidebarSize.MEDIUM) {
            setWidth(forwardRefElement, minWidth);
            return;
        }

        if (rhsSize === SidebarSize.SMALL) {
            resetStyle(forwardRefElement);
            return;
        }

        setWidth(forwardRefElement, defaultWidth);
    }, [defaultWidth, forwardRef, minWidth, rhsSize]);

    const handleResize = useCallback((width: number) => {
        const forwardRefElement = forwardRef.current;

        LocalStorageStore.setRhsWidth(userId, width);

        if (!forwardRefElement) {
            return;
        }

        if (!shouldRhsOverlap) {
            setWidth(forwardRefElement, width);
        }
    }, [forwardRef, shouldRhsOverlap, userId]);

    const handleResizeStart = useCallback(() => {
        const forwardRefElement = forwardRef.current;

        if (forwardRefElement) {
            preventAnimation(forwardRefElement);
        }
    }, [forwardRef]);

    const handleResizeEnd = useCallback(() => {
        const forwardRefElement = forwardRef.current;
        if (forwardRefElement) {
            restoreAnimation(forwardRefElement);
        }
    }, [forwardRef]);

    const handleLineDoubleClick = useCallback(() => {
        const forwardRefElement = forwardRef.current;

        if (!shouldRhsOverlap && forwardRefElement) {
            setWidth(forwardRefElement, defaultWidth);
            preventAnimation(forwardRefElement);

            requestAnimationFrame(() => {
                if (forwardRefElement) {
                    restoreAnimation(forwardRefElement);
                }
            });
        }
    }, [defaultWidth, forwardRef, shouldRhsOverlap]);

    return (
        <Resizable
            id={id}
            className={className}
            role={role}
            maxWidth={maxWidth}
            minWidth={minWidth}
            defaultWidth={defaultWidth}
            initialWidth={Number(LocalStorageStore.getRhsWidth(userId))}
            enabled={{
                left: false,
                right: isRhsResizable,
            }}
            onInit={handleInit}
            onLimitChange={handleLimitChange}
            onResize={handleResize}
            onResizeStart={handleResizeStart}
            onResizeEnd={handleResizeEnd}
            onLineDoubleClick={handleLineDoubleClick}
        >

            {children}
        </Resizable>
    );
}

export default React.forwardRef(ResizableRhs);
