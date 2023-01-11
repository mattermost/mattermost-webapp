// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import styled from 'styled-components';

export const WysiwygContainer = styled.div`
    margin: 0 24px 24px;
    border: 2px solid rgba(var(--center-channel-color-rgb), 0.16);
    border-radius: 4px;

    &:focus-within {
        border: 2px solid rgba(var(--center-channel-color-rgb), 0.32);
    }

    transition: border 250ms ease-in-out;
`;

/**
 * TODO: Currently this holds a lot of overwrites for existing classes.
 *       During the coming iterations we should create new classes (or React components)
 *       to handle these stlyes in the correct way.
 */
export const EditorContainer = styled.div`
    display: block;
    align-items: center;
    padding: 14px 16px 0 16px;
    max-height: 45vh;
    overflow: auto;

    &::-webkit-scrollbar {
        width: 8px; /* Mostly for vertical scrollbars */
        height: 8px; /* Mostly for horizontal scrollbars */
    }

    &::-webkit-scrollbar-thumb { /* Foreground */
        background: rgba(var(--center-channel-color-rgb), 0.2);
    }

    &::-webkit-scrollbar-track { /* Background */
        width: 12px;
        background: transparent;
    }

    .markdown__table {
        position: relative;

        p:last-child {
            margin-bottom: 0;
        }

        &.ProseMirror-selectednode th,
        &.ProseMirror-selectednode td,
        th.selectedCell,
        td.selectedCell {
            position: relative;
            background: rgba(var(--button-bg-rgb), 0.08);
            border: 1px solid rgba(var(--button-bg-rgb), 0.32);
        }

        th,
        td {
            // this is to fix a bug with the cursor being hidden in empty cells
            min-width: 28px;
        }
    }

    .ProseMirror-gapcursor:after {
        border-color: rgb(var(--center-channel-color));
    }

    h1, h2, h3 {
        font-family: Metropolis, sans-serif;
    }

    h1, h2, h3, h4, h5, h6 {
        margin: 10px 0;
        font-weight: 600;
        line-height: 1.5;
    }

    h1 {
        font-size: 28px;
    }

    h2 {
        font-size: 25px;
    }

    h3 {
        font-size: 22px;
    }

    h4 {
        font-size: 19px;
    }

    h5 {
        font-size: 15px;
    }

    h6 {
        font-size: 14px;
    }

    p {
        margin: 0.5em 0 0;
        font-weight: 400;
        font-size: 13.5px;
    }

    h1, h2, h3, h4, h5, h6, p {
        &:first-child {
            margin-top: 0;
        }
    }

    p.is-editor-empty:first-child::before {
        color: rgba(var(--center-channel-color-rgb), 0.56);
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
    }

    .AdvancedTextEditor__priority {
        padding: 0 0 12px;
    }

    .file-preview__container {
        padding-left: 0;
    }
`;
