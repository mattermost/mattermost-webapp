// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { PureComponent } from "react";
import { defineMessages, FormattedMessage, injectIntl } from "react-intl";

import Constants from "utils/constants";
import DelayedAction from "utils/delayed_action";
import { t } from "utils/i18n";
import { isMobileApp } from "utils/user_agent";
import { intlShape } from "utils/react_intl";

import AttachmentIcon from "components/widgets/icons/attachment_icon";
import KeyboardShortcutSequence, {
    KeyboardShortcutDescriptor,
    KEYBOARD_SHORTCUTS,
} from "components/keyboard_shortcuts/keyboard_shortcuts_sequence";
import OverlayTrigger from "components/overlay_trigger";
import Tooltip from "components/tooltip";
import styled from "styled-components";
import { ApplyHotkeyMarkdownOptions } from "utils/utils";

const OVERLAY_TIMEOUT = 500;

const customStyles = {
    left: "inherit",
    right: 0,
    bottom: "100%",
    top: "auto",
};

export const Icon = styled.button`
    display: flex;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: 4px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
    fill: rgba(var(--center-channel-color-rgb), 0.56);

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
        color: rgba(var(--center-channel-color-rgb), 0.72);
        fill: rgba(var(--center-channel-color-rgb), 0.72);
    }

    &:active,
    &--active,
    &--active:hover {
        background: rgba(var(--button-bg-rgb), 0.08);
        color: v(button-bg);
        fill: v(button-bg);
    }
`;

interface FormattingIconProps {
    type: ApplyHotkeyMarkdownOptions["markdownMode"];
    onClick?: () => void;
}

const MAP_MARKDOWN_TYPE_TO_ICON: {
    [key in FormattingIconProps["type"]]: string;
} = {
    bold: 'fa fa-bold',
    italic: 'fa fa-italic',
    link: 'fa fa-link',
    strike: 'fa fa-strikethrough',
    code: 'fa fa-code',
    heading: 'heading',
    quote: 'fa fa-quote-left',
    ul: 'fa fa-list-ul',
    ol: 'fa fa-list-ol',
};

const MAP_MARKDOWN_TYPE_TO_KEYBOARD_SHORTCUTS: {
    [key in FormattingIconProps["type"]]: KeyboardShortcutDescriptor;
} = {
    bold: KEYBOARD_SHORTCUTS.msgMarkdownBold,
    italic: KEYBOARD_SHORTCUTS.msgMarkdownItalic,
    link: KEYBOARD_SHORTCUTS.msgMarkdownLink,
    strike: KEYBOARD_SHORTCUTS.msgMarkdownStrike,
    code: KEYBOARD_SHORTCUTS.msgMarkdownCode,
    heading: KEYBOARD_SHORTCUTS.msgMarkdownHeading,
    quote: KEYBOARD_SHORTCUTS.msgMarkdownQuote,
    ul: KEYBOARD_SHORTCUTS.msgMarkdownUl,
    ol: KEYBOARD_SHORTCUTS.msgMarkdownOl,
};

const FormattingIcon: React.ComponentType<FormattingIconProps> = ({
    type,
    onClick,
}) => {
    if (isMobileApp()) {
        //do nothing
    }

    const bodyAction = (
        <div>
            <Icon
                type="button"
                id="fileUploadButton"
                // aria-label={ariaLabel}
            >
                <i className={MAP_MARKDOWN_TYPE_TO_ICON[type]}></i>
            </Icon>
        </div>
    );
    return (
        // const { formatMessage } = this.props.intl;
        // console.log(formatMessage, 'formatMessage')

        // const ariaLabel = formatMessage({
        //     id: "accessibility.button.attachment",
        //     defaultMessage: "attachment",
        // });

        <OverlayTrigger
            onClick={onClick}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement="top"
            trigger="hover"
            overlay={
                <Tooltip id="upload-tooltip">
                    <KeyboardShortcutSequence
                        shortcut={MAP_MARKDOWN_TYPE_TO_KEYBOARD_SHORTCUTS[type]}
                        hoistDescription={true}
                        isInsideTooltip={true}
                    />
                </Tooltip>
            }
        >
            <div className={"style--none"}>{bodyAction}</div>
        </OverlayTrigger>
    );
};

const wrappedComponent = injectIntl(FormattingIcon, { forwardRef: true });
wrappedComponent.displayName = "injectIntl(FormattingIcon)";
export default wrappedComponent;
