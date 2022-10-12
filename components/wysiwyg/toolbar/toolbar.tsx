// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef} from 'react';
import styled from 'styled-components';
import type {Editor} from '@tiptap/react';

import BlockModeControls from './controls/block-controls';
import HeadingControls from './controls/heading-controls';
import LeafModeControls from './controls/leaf-controls';
import TableControls from './controls/table-controls';

/** eslint-disable no-confusing-arrow */

const Separator = styled.div`
    display: block;
    position: relative;
    width: 1px;
    height: 24px;
    background: rgba(var(--center-channel-color-rgb), 0.32);
`;

const ToolbarContainer = styled.div`
    display: flex;
    position: relative;
    height: 48px;
    padding: 0 8px;
    justify-content: space-between;
    background: transparent;
    transform-origin: top;
    transition: max-height 0.25s ease;
`;

const ToolSection = styled.div`
    display: flex;
    align-items: center;
    flex: 0;
    gap: 4px;
`;

interface ToolbarProps {

    /**
     * the editor create from the tiptap package
     */
    editor: Editor;

    /**
     * controls that enhance the message,
     * e.g: message priority picker
     */
    additionalControls?: React.ReactNode | React.ReactNode[];

    /**
     * controls shown aligned to the very right of the toolbar
     * (built for adding in send buttons, etc.)
     */
    rightControls?: React.ReactNode | React.ReactNodeArray;
}

const Toolbar = (props: ToolbarProps): JSX.Element => {
    const {
        additionalControls,
        rightControls,
        editor,
    } = props;
    const formattingBarRef = useRef<HTMLDivElement>(null);

    return (
        <ToolbarContainer ref={formattingBarRef}>
            <ToolSection>
                <HeadingControls editor={editor}/>
                <Separator/>
                <LeafModeControls editor={editor}/>
                <Separator/>
                <BlockModeControls editor={editor}/>
                <Separator/>
                <TableControls editor={editor}/>
                {additionalControls && (
                    <>
                        <Separator/>
                        {additionalControls}
                    </>
                )}
            </ToolSection>
            <ToolSection>
                {rightControls}
            </ToolSection>
        </ToolbarContainer>
    );
};

export default Toolbar;
