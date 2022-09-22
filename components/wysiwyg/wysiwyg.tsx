// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useCallback, useMemo} from 'react';
import isHotkey from 'is-hotkey';
import {
    Editor,
    Transforms,
    createEditor,
    Element as SlateElement,
    CustomTypes,
} from 'slate';
import {Editable, withReact, useSlate, Slate, RenderElementProps, RenderLeafProps} from 'slate-react';
import {withHistory} from 'slate-history';

import {Button, Icon, Toolbar} from './wysiwyg_components';

const HOTKEYS: Record<string, string> = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+`': 'code',
};

const LIST_TYPES = ['ol', 'ul'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

const RichTextExample = () => {
    const renderElement = useCallback((props) => <Element {...props}/>, []);
    const renderLeaf = useCallback((props) => <Leaf {...props}/>, []);
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);

    return (
        <Slate
            editor={editor}
            value={initialValue}
        >
            <Toolbar>
                <MarkButton
                    format='bold'
                    icon='format_bold'
                />
                <MarkButton
                    format='italic'
                    icon='format_italic'
                />
                <MarkButton
                    format='underline'
                    icon='format_underlined'
                />
                <MarkButton
                    format='code'
                    icon='code'
                />
                <BlockButton
                    format='h1'
                    icon='looks_one'
                />
                <BlockButton
                    format='h2'
                    icon='looks_two'
                />
                <BlockButton
                    format='blockquote'
                    icon='format_quote'
                />
                <BlockButton
                    format='ol'
                    icon='format_list_numbered'
                />
                <BlockButton
                    format='ul'
                    icon='format_list_bulleted'
                />
                <BlockButton
                    format='left'
                    icon='format_align_left'
                />
                <BlockButton
                    format='center'
                    icon='format_align_center'
                />
                <BlockButton
                    format='right'
                    icon='format_align_right'
                />
                <BlockButton
                    format='justify'
                    icon='format_align_justify'
                />
            </Toolbar>
            <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                placeholder='Enter some rich text…'
                spellCheck={true}
                autoFocus={true}
                onKeyDown={(event) => {
                    for (const hotkey in HOTKEYS) {
                        if (isHotkey(hotkey, event)) {
                            event.preventDefault();
                            const mark = HOTKEYS[hotkey];
                            toggleMark(editor, mark);
                        }
                    }
                }}
            />
        </Slate>
    );
};

const toggleBlock = (editor: CustomTypes['Editor'], format) => {
    const isActive = isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type',
    );
    const isList = LIST_TYPES.includes(format);

    Transforms.unwrapNodes(editor, {
        match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            LIST_TYPES.includes(n.type) &&
            !TEXT_ALIGN_TYPES.includes(format),
        split: true,
    });
    let newProperties: Partial<SlateElement>;
    if (TEXT_ALIGN_TYPES.includes(format)) {
        newProperties = {
            align: isActive ? undefined : format,
        };
    } else {
        newProperties = {
            type: isActive ? 'p' : isList ? 'li' : format,
        };
    }
    Transforms.setNodes<SlateElement>(editor, newProperties);

    if (!isActive && isList) {
        const block = {type: format, children: []};
        Transforms.wrapNodes(editor, block);
    }
};

const toggleMark = (editor: CustomTypes['Editor'], format) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
};

const isBlockActive = (editor: CustomTypes['Editor'], format, blockType = 'type') => {
    const {selection} = editor;
    if (!selection) {
        return false;
    }

    const [match] = Array.from(
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: (n) =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n[blockType] === format,
        }),
    );

    return Boolean(match);
};

const isMarkActive = (editor: CustomTypes['Editor'], format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
};

const Element = ({attributes, children, element}: RenderElementProps) => {
    const style = {textAlign: element.align ?? 'left'};
    const Tag = element.type || 'p';
    return (
        <Tag
            style={style}
            {...attributes}
        >
            {children}
        </Tag>
    );
};

const Leaf = ({attributes, children, leaf}: RenderLeafProps) => {
    let alteredChildren = children;
    if (leaf.bold) {
        alteredChildren = <strong>{children}</strong>;
    }

    if (leaf.code) {
        alteredChildren = <code>{children}</code>;
    }

    if (leaf.italic) {
        alteredChildren = <em>{children}</em>;
    }

    if (leaf.underline) {
        alteredChildren = <u>{children}</u>;
    }

    return <span {...attributes}>{alteredChildren}</span>;
};

const BlockButton = ({format, icon}) => {
    const editor = useSlate();
    return (
        <Button
            active={isBlockActive(
                editor,
                format,
            )}
            onMouseDown={(event) => {
                event.preventDefault();
                toggleBlock(editor, format);
            }}
        >
            <Icon>{icon}</Icon>
        </Button>
    );
};

const MarkButton = ({format, icon}) => {
    const editor = useSlate();
    return (
        <Button
            active={isMarkActive(editor, format)}
            onMouseDown={(event) => {
                event.preventDefault();
                toggleMark(editor, format);
            }}
        >
            <Icon>{icon}</Icon>
        </Button>
    );
};

const initialValue: Array<CustomTypes['Descendant']> = [
    {
        type: 'p',
        children: [
            {text: 'This is editable '},
            {text: 'rich', bold: true},
            {text: ' text, '},
            {text: 'much', italic: true},
            {text: ' better than a '},
            {text: '<textarea>', code: true},
            {text: '!'},
        ],
    },
    {
        type: 'p',
        children: [
            {
                text:
                    "Since it's rich text, you can do things like turn a selection of text ",
            },
            {text: 'bold', bold: true},
            {
                text:
                    ', or add a semantically rendered block quote in the middle of the page, like this:',
            },
        ],
    },
    {
        type: 'blockquote',
        children: [{text: 'A wise quote.'}],
    },
    {
        type: 'p',
        align: 'center',
        children: [{text: 'Try it out for yourself!'}],
    },
];

export default RichTextExample;
