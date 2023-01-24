// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {offset, useFloating} from '@floating-ui/react-dom';
import {DotsVerticalIcon} from '@mattermost/compass-icons/components';
import classNames from 'classnames';
import {debounce} from 'lodash';
import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import {CSSTransition} from 'react-transition-group';
import styled from 'styled-components';
import {Editor} from '@tiptap/react';

import {useGetLatest} from 'components/advanced_text_editor/formatting_bar/hooks';
import {Formatters} from 'components/wysiwyg/wysiwyg';

import BlockModeControls from './controls/block-controls';
import HeadingControls from './controls/heading-controls';
import LeafModeControls from './controls/leaf-controls';
import {PriorityControls} from './controls/priority-controls';
import TableControls from './controls/table-controls';
import ToolbarControl from './toolbar_controls';

/** eslint-disable no-confusing-arrow */

const useResponsiveToolBar = (ref: React.RefObject<HTMLDivElement>): boolean => {
    const [wideMode, setWideMode] = useState<boolean>(true);
    const handleResize = debounce(() => {
        if (ref.current?.clientWidth === undefined) {
            return;
        }

        setWideMode(ref.current.clientWidth > 640);
    }, 10);

    useLayoutEffect(() => {
        if (!ref.current) {
            return () => {};
        }

        let sizeObserver: ResizeObserver | null = new ResizeObserver(handleResize);

        sizeObserver.observe(ref.current);

        return () => {
            sizeObserver!.disconnect();
            sizeObserver = null;
        };
    }, [handleResize, ref]);

    return wideMode;
};

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

const HiddenControlsContainer = styled.div`
    padding: 5px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    background: var(--center-channel-bg);
    z-index: -1;

    transition: transform 250ms ease, opacity 250ms ease;
    transform: scale(0);
    opacity: 0;
    display: flex;
    align-items: center;

    &.scale-enter {
        transform: scale(0);
        opacity: 0;
        z-index: 20;
    }

    &.scale-enter-active {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-enter-done {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-exit {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-exit-active {
        transform: scale(0);
        opacity: 0;
        z-index: 20;
    }

    &.scale-exit-done {
        transform: scale(0);
        opacity: 0;
        z-index: -1;
    }
`;

interface ToolbarProps {

    /**
     * the editor create from the tiptap package
     */
    editor: Editor;

    /**
     * controls shown aligned to the very right of the toolbar
     * (built for adding in send buttons, etc.)
     */
    rightControls?: React.ReactNode | React.ReactNodeArray;
}

const Toolbar = (props: ToolbarProps): JSX.Element => {
    const {
        rightControls,
        editor,
    } = props;
    const formattingBarRef = useRef<HTMLDivElement>(null);
    const leftToolSectionRef = useRef<HTMLDivElement>(null);

    const isWide = useResponsiveToolBar(formattingBarRef);
    const [showHiddenControls, setShowHiddenControls] = useState(false);

    const {formatMessage} = useIntl();
    const HiddenControlsButtonAriaLabel = formatMessage({id: 'accessibility.button.hidden_controls_button', defaultMessage: 'show hidden formatting options'});

    const {x, y, reference, floating, strategy, update, refs: {reference: buttonRef, floating: floatingRef}} = useFloating<HTMLButtonElement>({
        placement: 'top',
        middleware: [offset({mainAxis: 4})],
    });

    // this little helper hook always returns the latest refs and does not mess with the popper placement calculation
    const getLatest = useGetLatest({
        showHiddenControls,
        buttonRef,
        floatingRef,
    });

    useEffect(() => {
        const handleClickOutside: EventListener = (event) => {
            const {floatingRef, buttonRef} = getLatest();
            const target = event.composedPath?.()?.[0] || event.target;
            if (target instanceof Node) {
                if (
                    floatingRef !== null &&
                    buttonRef !== null &&
                    !floatingRef.current?.contains(target) &&
                    !buttonRef.current?.contains(target)
                ) {
                    setShowHiddenControls(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [getLatest, setShowHiddenControls]);

    useEffect(() => {
        update?.();
    }, [isWide, update, showHiddenControls]);

    const {disableFormatting, enablePriority} = editor.storage.core;

    const toggleHiddenControls = useCallback((event?) => {
        event?.preventDefault();
        event?.stopPropagation();
        setShowHiddenControls(!showHiddenControls);
    }, [showHiddenControls]);

    const hiddenControlsContainerStyles: React.CSSProperties = {
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
    };

    return (
        <ToolbarContainer ref={formattingBarRef}>
            <ToolSection ref={leftToolSectionRef}>
                <HeadingControls
                    editor={editor}
                    useIcon={!isWide}
                />
                {isWide && <Separator/>}
                <LeafModeControls editor={editor}/>
                {isWide ? (
                    <>
                        <Separator/>
                        <BlockModeControls editor={editor}/>
                        {disableFormatting?.includes(Formatters.table) ? null : <TableControls editor={editor}/>}
                        {enablePriority && (
                            <>
                                <Separator/>
                                <PriorityControls editor={editor}/>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <ToolbarControl
                            ref={reference}
                            aria-label={HiddenControlsButtonAriaLabel}
                            mode={'showHiddenControls'}
                            Icon={DotsVerticalIcon}
                            onClick={toggleHiddenControls}
                            className={classNames({active: showHiddenControls})}
                        />

                        <CSSTransition
                            timeout={250}
                            classNames='scale'
                            in={showHiddenControls}
                        >
                            <HiddenControlsContainer
                                ref={floating}
                                style={hiddenControlsContainerStyles}
                            >
                                <BlockModeControls editor={editor}/>
                                {disableFormatting?.includes(Formatters.table) ? null : <TableControls editor={editor}/>}
                                {enablePriority && (
                                    <>
                                        <Separator/>
                                        <PriorityControls editor={editor}/>
                                    </>
                                )}
                            </HiddenControlsContainer>
                        </CSSTransition>
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
