// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useRef, useEffect, useState, MutableRefObject, useCallback} from 'react';

export function useDragAndDrop(props: any) {
    const ref: MutableRefObject<any> = useRef();

    const [value, setValue] = useState('');

    const handleDragIn = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setValue('dragenter');
        if (props.handleDragEnterCb && typeof props.handleDragEnterCb === 'function') {
            props.handleDragEnterCb();
        }
    }, []);

    const handleDragOut = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setValue('dragout');
        if (props.handleDragOutCb && typeof props.handleDragOutCb === 'function') {
            props.handleDragOutCb();
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setValue('dragover');
        if (props.handleDragOverCb && typeof props.handleDragOverCb === 'function') {
            props.handleDragOverCb();
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setValue('drop');
        if (props.handleDropCb && typeof props.handleDropCb === 'function') {
            props.handleDropCb(e);
        }
    }, []);

    useEffect(() => {
        const node = ref.current;
        if (node) {
            node.addEventListener('dragenter', handleDragIn);
            node.addEventListener('dragleave', handleDragOut);
            node.addEventListener('dragover', handleDragOver);
            node.addEventListener('drop', handleDrop);
        }
        return () => {
            node.removeEventListener('dragenter', handleDragIn);
            node.removeEventListener('dragleave', handleDragOut);
            node.removeEventListener('dragover', handleDragOver);
            node.removeEventListener('drop', handleDrop);
        };
    }, []);

    return [ref, value];
}
