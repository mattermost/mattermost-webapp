// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {CSSTransition} from 'react-transition-group';
import {times} from 'lodash';
import {offset, useFloating} from '@floating-ui/react-dom';
import {TableLargeIcon} from '@mattermost/compass-icons/components';
import type {Editor} from '@tiptap/react';

import {KEYBOARD_SHORTCUTS} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';

import ToolbarControl, {FloatingContainer} from '../toolbar_controls';
import type {ToolDefinition} from '../toolbar_controls';

import {useGetLatest} from '../toolbar_hooks';

// is this needed?
export type TableControl =
    | 'addTable'
    | 'deleteTable'
    | 'addColBefore'
    | 'addColAfter'
    | 'deleteCol'
    | 'addRowAfter'
    | 'addRowBefore'
    | 'deleteRow';

export const makeTableControlDefinitions = (editor: Editor): Array<ToolDefinition<'table', TableControl>> => ([
    {
        mode: 'table',
        type: 'deleteTable',
        icon: TableLargeIcon,
        show: editor.can().deleteTable(),
        action: () => editor.chain().focus().deleteTable().run(),
        ariaLabelDescriptor: {id: 'shortcuts.msgs.markdown.table.delete', defaultMessage: 'delete table'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownTableDelete,
    },
    {
        mode: 'table',
        type: 'addColBefore',
        icon: TableLargeIcon,
        show: editor.can().addColumnBefore(),
        action: () => editor.chain().focus().addColumnBefore().run(),
        ariaLabelDescriptor: {id: 'shortcuts.msgs.markdown.table.column.add.after', defaultMessage: 'add column to the left'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownColAddBefore,
    },
    {
        mode: 'table',
        type: 'addColAfter',
        icon: TableLargeIcon,
        show: editor.can().addColumnAfter(),
        action: () => editor.chain().focus().addColumnAfter().run(),
        ariaLabelDescriptor: {id: 'shortcuts.msgs.markdown.table.column.add.before', defaultMessage: 'add column to the right'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownColAddAfter,
    },
    {
        mode: 'table',
        type: 'deleteCol',
        icon: TableLargeIcon,
        show: editor.can().deleteColumn(),
        action: () => editor.chain().focus().deleteColumn().run(),
        ariaLabelDescriptor: {id: 'shortcuts.msgs.markdown.table.column.delete', defaultMessage: 'delete column'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownColDelete,
    },
    {
        mode: 'table',
        type: 'addRowBefore',
        icon: TableLargeIcon,
        show: editor.can().addRowBefore(),
        action: () => editor.chain().focus().addRowBefore().run(),
        ariaLabelDescriptor: {id: 'shortcuts.msgs.markdown.table.row.add.after', defaultMessage: 'add row above'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownRowAddBefore,
    },
    {
        mode: 'table',
        type: 'addRowAfter',
        icon: TableLargeIcon,
        show: editor.can().addRowAfter(),
        action: () => editor.chain().focus().addRowAfter().run(),
        ariaLabelDescriptor: {id: 'shortcuts.msgs.markdown.table.row.add.before', defaultMessage: 'add row below'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownRowAddAfter,
    },
    {
        mode: 'table',
        type: 'deleteRow',
        icon: TableLargeIcon,
        show: editor.can().deleteRow(),
        action: () => editor.chain().focus().deleteRow().run(),
        ariaLabelDescriptor: {id: 'shortcuts.msgs.markdown.table.row.delete', defaultMessage: 'delete row'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownRowDelete,
    },
]);

const TableControlsContainer = styled(FloatingContainer)`
    flex-direction: row;
`;

const MatrixWrapper = styled.div`
    display: grid;
    grid-gap: 4px;
    grid-template-columns: repeat(5, min-content);
    padding: 0 8px;
`;

type MatrixBoxProps = {
    selected: boolean;
}

const MatrixBox = memo(styled.div<MatrixBoxProps>`
    width: 18px;
    height: 18px;
    background: ${({selected}) => (selected ? 'rgba(var(--button-bg-rgb), 0.24)' : 'transparent')};
    border: 2px solid rgba(var(--center-channel-color-rgb), 0.52);
    border-radius: 4px;
`);

type MatrixSelection = {
    cols: number;
    rows: number;
}

type SelectionMatrixProps = {
    onSelect: ({cols, rows}: MatrixSelection) => void;
}

const SelectionMatrix = ({onSelect}: SelectionMatrixProps) => {
    const [selection, setSelection] = useState<MatrixSelection>({rows: 0, cols: 0});

    return (
        <MatrixWrapper>
            {times(4, (row) => (
                <React.Fragment key={`row_${row}`}>
                    {times(5, (col) => {
                        const actualRow = row + 1;
                        const actualCol = col + 1;
                        return (
                            <MatrixBox
                                key={`row_${row}-col_${col}`}
                                selected={actualCol <= selection.cols && actualRow <= selection.rows}
                                onMouseOver={() => setSelection({cols: actualCol, rows: actualRow})}
                                onClick={() => onSelect(selection)}
                            />
                        );
                    })}
                </React.Fragment>
            ))}
        </MatrixWrapper>
    );
};

type TableControlProps = {
    editor: Editor;
}

const TableControls = ({editor}: TableControlProps) => {
    const [showTableControls, setShowTableControls] = useState(false);

    const tableControls = makeTableControlDefinitions(editor);
    const tableModeIsActive = editor.isActive('table');

    // TODO@michel: move this to its own component (e.g. `Popover`)
    const {x, y, reference, floating, strategy, update, refs: {reference: buttonRef, floating: floatingRef}} = useFloating<HTMLButtonElement>({
        placement: 'top',
        middleware: [offset({mainAxis: 4})],
    });

    // this little helper hook always returns the latest refs and does not mess with the floatingUI placement calculation
    const getLatest = useGetLatest({
        showTableControls,
        buttonRef,
        floatingRef,
    });

    const toggleTableControls = useCallback((event?) => {
        event?.preventDefault();
        setShowTableControls(!showTableControls);
    }, [showTableControls]);

    const tableControlsContainerStyles: React.CSSProperties = {
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
    };

    useEffect(() => {
        const handleClickOutside: EventListener = (event) => {
            event.stopPropagation();
            const {floatingRef, buttonRef} = getLatest();
            const target = event.composedPath?.()?.[0] || event.target;
            if (target instanceof Node) {
                if (
                    floatingRef !== null &&
                    buttonRef !== null &&
                    !floatingRef.current?.contains(target) &&
                    !buttonRef.current?.contains(target)
                ) {
                    setShowTableControls(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [getLatest]);

    const overlayContent = tableModeIsActive ? tableControls.map((control) => (
        <ToolbarControl
            key={`${control.type}_${control.mode}`}
            mode={control.type}
            Icon={control.icon}
            onClick={control.action}
            shortcutDescriptor={control.shortcutDescriptor}
            ariaLabelDescriptor={control.ariaLabelDescriptor}
        />
    )) : (
        <SelectionMatrix
            onSelect={(selection) => {
                editor.chain().focus().insertTable({...selection, withHeaderRow: false}).run();
                setShowTableControls(false);
            }}
        />
    );

    useEffect(() => {
        update?.();
    }, [showTableControls, update]);

    return (
        <>
            <ToolbarControl
                mode={'table'}
                Icon={TableLargeIcon}
                onClick={toggleTableControls}
                isActive={showTableControls}
                shortcutDescriptor={showTableControls ? KEYBOARD_SHORTCUTS.msgMarkdownTableControls : KEYBOARD_SHORTCUTS.msgMarkdownTableAdd}
                ariaLabelDescriptor={showTableControls ? {id: 'shortcuts.msgs.markdown.table.controls', defaultMessage: 'show table controls'} : {id: 'shortcuts.msgs.markdown.table.add', defaultMessage: 'add table'}}
                ref={reference}
            />
            <CSSTransition
                timeout={250}
                classNames='scale'
                in={showTableControls}
            >
                <TableControlsContainer
                    ref={floating}
                    style={tableControlsContainerStyles}
                >
                    {overlayContent}
                </TableControlsContainer>
            </CSSTransition>
        </>
    );
};

export default TableControls;
