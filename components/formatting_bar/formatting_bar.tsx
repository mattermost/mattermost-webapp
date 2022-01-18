import { Instance } from "@popperjs/core";
import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ApplyHotkeyMarkdownOptions } from "utils/apply_markdown.utils";
import ShowFormat from "components/show_format";
import { usePopper } from "react-popper";
import {FormattingIcon, Icon } from "./formatting_icon";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";

const FormattingBarContainer = styled.div`
    display: flex;
    max-height: 0;
    transform-origin: top;
    overflow: hidden;
    transition: max-height 0.25s ease;
    background: rgba(61, 60, 64, 0.04);
    height: 48px;
    align-items: center;
    padding-left: 4px;

    &.isOpen {
        max-height: 100px;
        display: flex;
        align-items: center;
    }

    &.isRenderedInCommentSection {
        // responsive formatting bar
    }

    & .control {
        margin: 0 4px;

        &.heading,
        &.code,
        &.ol {
            margin-right: 5px;
            position: relative;

            &:after {
                content: "";
                position: absolute;
                top: 0;
                bottom: 0;
                margin: auto 0;
                right: -5px;
                width: 1px;
                height: 24px;
                background: rgba(61, 60, 64, 0.16);
            }
        }
    }
`;

const HiddenControlsContainer = styled.div`
        
        & > div {
            padding: 5px;
            box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.12);
            border-radius: 4px;
            border: 1px solid rgba(61, 60, 64, 0.16);
            background: #fff;
            
            transition: transform 0.25s ease, opacity 0.25s ease;
            transform: scale(0);
            display: flex;

            &.scale-enter {
                transform: scale(0);
                opacity: 0;
            }
        
            &.scale-enter-active {
                transform: scale(1);
                opacity: 1;
            }
        
            &.scale-enter-done {
                transform: scale(1);
                opacity: 1;
            }
        
            &.scale-exit {
                transform: scale(1);
                opacity: 1;
            }
        
            &.scale-exit-active {
                transform: scale(0);
                opacity: 0;
            }
        
            &.scale-exit-done {
                transform: scale(0);
                opacity: 0;
            }
    }

    
`;

interface FormattingBarProps {
    isOpen: boolean;
    applyMarkdown: (options: ApplyHotkeyMarkdownOptions) => void;
    textBox: HTMLInputElement;
    value: string;
    isRenderedInCommentSection?: boolean;
}

interface Control {
    markdownMode: ApplyHotkeyMarkdownOptions["markdownMode"];
    icon: React.ReactNode;
}

const useFormattingBarControls = (
    isRenderedInCommentSection: boolean
): {
    controls: Control[];
    hiddenControls: Control[];
} => {
    const allControls: Control[] = [
        {
            markdownMode: "bold",
            icon: <FormattingIcon type="bold" />,
        },
        {
            markdownMode: "italic",
            icon: <FormattingIcon type="italic" />,
        },
        {
            markdownMode: "strike",
            icon: <FormattingIcon type="strike" />,
        },
        {
            markdownMode: "heading",
            icon: <FormattingIcon type="heading" />,
        },
        {
            markdownMode: "link",
            icon: <FormattingIcon type="link" />,
        },
        {
            markdownMode: "code",
            icon: <FormattingIcon type="code" />,
        },
        {
            markdownMode: "quote",
            icon: <FormattingIcon type="quote" />,
        },
        {
            markdownMode: "ul",
            icon: <FormattingIcon type="ul" />,
        },
        {
            markdownMode: "ol",
            icon: <FormattingIcon type="ol" />,
        },
    ];

    const controlsLength = isRenderedInCommentSection ? 3 : allControls.length;

    const controls = allControls.slice(0, controlsLength);
    const hiddenControls = allControls.slice(controlsLength);

    return {
        controls,
        hiddenControls,
    };
};

const useUpdateOnVisibilityChange = (
    update: Instance["update"] | null,
    isVisible: boolean
) => {
    const updateComponent = async () => {
        if (!update) {
            return;
        }
        await update();
    };

    useEffect(() => {
        if (!isVisible) {
            return;
        }
        updateComponent();
    }, [isVisible]);
};

export const FormattingBar: React.ComponentType<FormattingBarProps> = ({
    isOpen,
    applyMarkdown,
    textBox,
    value,
    isRenderedInCommentSection,
}) => {
    const [isHiddenControlsVisible, setIsHiddenControlsVisible] =
        useState(false);
    const popperRef = React.useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const { controls, hiddenControls } = useFormattingBarControls(
        Boolean(isRenderedInCommentSection)
    );

    useEffect(() => {
        if (!isOpen) {
            setIsHiddenControlsVisible(false)
        }
    }, [isOpen])

    const {
        styles: { popper },
        attributes,
        update,
    } = usePopper(triggerRef.current, popperRef.current, {
        placement: "top",
        // modifiers: [
        //     {
        //         name: 'offset',
        //         options: {
        //             offset,
        //         },
        //     },
        // ],
    });
    useUpdateOnVisibilityChange(update, isHiddenControlsVisible);

    return (
        <FormattingBarContainer
            className={classNames({
                isOpen,
                isRenderedInCommentSection,
            })}
        >
            {controls.map(({ markdownMode, icon }) => {
                return (
                    <div
                        className={classNames("control", {
                            [markdownMode]: markdownMode,
                        })}
                        onClick={() => {
                            const selectionStart = textBox.selectionStart;
                            const selectionEnd = textBox.selectionEnd;
                            if (selectionStart===null || selectionEnd===null) {
                                return
                            }
                            
                            applyMarkdown({
                                markdownMode,
                                selectionStart,
                                selectionEnd,
                                value,
                            });
                        }}
                    >
                        {icon}
                    </div>
                );
            })}

            {isRenderedInCommentSection && (
                <Icon
                    ref={triggerRef}
                    onClick={(event) => {
                        event.preventDefault();
                        setIsHiddenControlsVisible((isVisible) => !isVisible);
                    }}
                >
                    <i className="fa fa-ellipsis-h" />
                </Icon>
            )}

            <HiddenControlsContainer
                ref={popperRef}
                style={popper}
                {...attributes.popper}
            >
                <CSSTransition
                    timeout={250}
                    classNames="scale"
                    unmountOnExit
                    in={isHiddenControlsVisible}
                >
                    <div>
                        {hiddenControls.map(({ markdownMode, icon }) => {
                            return (
                                <div
                                    className="control"
                                    onClick={() => {
                                        const selectionStart =
                                            textBox.selectionStart;
                                        const selectionEnd =
                                            textBox.selectionEnd;
                                            if (selectionStart===null || selectionEnd===null) {
                                                return
                                            }
                                        applyMarkdown({
                                            markdownMode,
                                            selectionStart,
                                            selectionEnd,
                                            value,
                                        });
                                    }}
                                >
                                    {icon}
                                </div>
                            );
                        })}
                        {isRenderedInCommentSection && <Question />}
                    </div>
                </CSSTransition>
            </HiddenControlsContainer>

            {!isRenderedInCommentSection && <Question />}
        </FormattingBarContainer>
    );
};

const Question = () => {
    return (
        <div className="control" onClick={(event) => {event.preventDefault();}}>
            <Icon>
                <i className="fa fa-question" />
            </Icon>
        </div>
    );
};
