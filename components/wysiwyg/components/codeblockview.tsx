// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import classNames from 'classnames';
import styled from 'styled-components';
import {CSSTransition} from 'react-transition-group';
import {offset, useFloating, size} from '@floating-ui/react-dom';
import {ChevronDownIcon} from '@mattermost/compass-icons/components';
import {NodeViewContent, NodeViewWrapper} from '@tiptap/react';
import {NodeViewProps} from '@tiptap/core/src/types';

import {DropdownContainer} from '../toolbar/toolbar_controls';
import {useGetLatest} from '../toolbar/toolbar_hooks';

import 'highlight.js/styles/stackoverflow-light.css';

const StyledCodeBlock = styled(NodeViewWrapper)`
    position: relative;

    ${DropdownContainer} {
        position: absolute;
        right: 8px;
        top: 8px;
        border-radius: 4px;
        border: none;
        user-select: none;
    }

    pre {
        display: flex;

        .hljs {
            flex: 1;
            white-space: pre !important;
            overflow-x: auto;

            &--line-numbers {
                flex: 0;
                text-align: right;
                white-space: pre;
                min-width: max-content;
                user-select: none;
                padding: 1em;
                background-color: rgba(var(--center-channel-bg-rgb), 0.08);
            }
        }
    }
`;

const Menu = styled.div`
    padding: 8px 0;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    background: var(--center-channel-bg);
    z-index: -1;

    transition: transform 250ms ease, opacity 250ms ease;
    transform: scale(0);
    opacity: 0;
    display: flex;
    flex-direction: column;

    overflow-y: auto;

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

const Option = styled.button`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 20px;
    min-width: 230px;
    background: transparent;
    border: none;
    appearance: none;

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
    }
`;

export default ({node, updateAttributes, extension}: NodeViewProps) => {
    const {attrs: {language}, textContent} = node;
    const {options: {defaultLanguage}} = extension;

    const [showLanguageSelect, setShowLanguageSelect] = useState(false);

    const lines = [...Array(textContent.split('\n').length).keys()].map((i) => i + 1).join('\n');

    const {x, y, reference, floating, strategy, update, refs: {reference: buttonRef, floating: floatingRef}} = useFloating<HTMLButtonElement>({
        placement: 'top-end',
        middleware: [
            offset({mainAxis: 4}),
            size({
                apply({availableHeight}) {
                    if (floatingRef.current) {
                        Object.assign(floatingRef.current.style, {
                            maxHeight: `${availableHeight}px`,
                        });
                    }
                },
                padding: 5,
            }),
        ],
    });

    // this little helper hook always returns the latest refs and does not mess with the floatingUI placement calculation
    const getLatest = useGetLatest({
        showLanguageSelect,
        buttonRef,
        floatingRef,
    });

    useEffect(() => {
        update?.();
    }, [update]);

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
                    setShowLanguageSelect(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [getLatest]);

    const toggleHeadingControls = useCallback((event?) => {
        event?.preventDefault();
        setShowLanguageSelect(!showLanguageSelect);
    }, [showLanguageSelect]);

    const floatingContainerStyles: React.CSSProperties = {
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
    };

    const languages = extension.options.lowlight.listLanguages();

    return (
        <StyledCodeBlock>
            <DropdownContainer
                id={'HiddenControlsButton' + location}
                ref={reference}
                className={classNames({active: showLanguageSelect})}
                onClick={toggleHeadingControls}
            >
                {language || defaultLanguage}
                <ChevronDownIcon
                    color={'currentColor'}
                    size={18}
                />
            </DropdownContainer>
            <CSSTransition
                timeout={250}
                classNames='scale'
                in={showLanguageSelect}
            >
                <Menu
                    ref={floating}
                    style={floatingContainerStyles}
                >
                    {languages.map((lang: string) => (
                        <Option
                            key={lang}
                            onClick={(event) => {
                                event.preventDefault();
                                updateAttributes({language: lang});
                            }}
                        >
                            {lang}
                        </Option>
                    ))}
                </Menu>
            </CSSTransition>
            <pre>
                <div className={'hljs hljs--line-numbers'}>{lines}</div>
                <NodeViewContent
                    as='code'
                    className={'hljs'}
                />
            </pre>
        </StyledCodeBlock>
    );
};
