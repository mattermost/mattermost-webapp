// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {BaseEditor} from 'slate';
import {ReactEditor} from 'slate-react';
import {HistoryEditor} from 'slate-history';

type HeadingType = 'h1' | 'h2'| 'h3' | 'h4' | 'h5' | 'h6';
type ParagraphType = 'p' | 'blockquote';
type ElementAlign = 'left' | 'center' | 'right' | 'justify';

export type ParagraphElement = {
    type: ParagraphType;
    align?: ElementAlign;
    children: CustomText[];
}

export type HeadingElement = {
    type: HeadingType;
    align?: ElementAlign;
    children: CustomText[];
}

export type FormattedText = {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
}

export type CustomText = FormattedText

export type CustomElement = ParagraphElement | HeadingElement

export type CustomDescendant = CustomElement | CustomText;

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor

declare module 'slate' {
    interface CustomTypes {
        Editor: CustomEditor;
        Element: CustomElement;
        Text: CustomText;
        Descendant: CustomDescendant;
    }
}
