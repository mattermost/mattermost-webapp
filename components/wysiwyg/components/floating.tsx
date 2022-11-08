// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {PropsWithChildren, useLayoutEffect} from 'react';
import {Editor, isNodeSelection, posToDOMRect} from '@tiptap/core';
import {useFloating, autoUpdate, offset, flip} from '@floating-ui/react-dom';

type FloatingProps = {
    editor: Editor;
}

const Floating = ({editor, children}: PropsWithChildren<FloatingProps>) => {
    const {x, y, strategy, reference, floating} = useFloating({
        strategy: 'fixed',
        whileElementsMounted: autoUpdate,
        placement: 'top',
        middleware: [
            offset({mainAxis: 8}),
            flip({
                padding: 8,
                boundary: editor.options.element,
                fallbackPlacements: [
                    'bottom',
                    'top-start',
                    'bottom-start',
                    'top-end',
                    'bottom-end',
                ],
            }),
        ],
    });

    useLayoutEffect(() => {
        const {ranges} = editor.state.selection;
        const from = Math.min(...ranges.map((range) => range.$from.pos));
        const to = Math.max(...ranges.map((range) => range.$to.pos));

        reference({
            getBoundingClientRect() {
                if (isNodeSelection(editor.state.selection)) {
                    const node = editor.view.nodeDOM(from) as HTMLElement;

                    if (node) {
                        return node.getBoundingClientRect();
                    }
                }

                return posToDOMRect(editor.view, from, to);
            },
        });
    }, [reference, editor]);

    if (!open) {
        return null;
    }

    return (
        <div
            ref={floating}
            style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
            }}
        >
            {children}
        </div>
    );
};

export default Floating;
