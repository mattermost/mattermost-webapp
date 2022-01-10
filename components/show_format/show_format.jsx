// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import { defineMessages, FormattedMessage, injectIntl } from "react-intl";

import Constants from "utils/constants";
import DelayedAction from "utils/delayed_action";
import { t } from "utils/i18n";
import { isMobileApp } from "utils/user_agent";
import { intlShape } from "utils/react_intl";

import AttachmentIcon from "components/widgets/icons/attachment_icon";
import KeyboardShortcutSequence, {
    KEYBOARD_SHORTCUTS,
} from "components/keyboard_shortcuts/keyboard_shortcuts_sequence";
import OverlayTrigger from "components/overlay_trigger";
import Tooltip from "components/tooltip";

const holders = defineMessages({
    limited: {
        id: t("file_upload.limited"),
        defaultMessage:
            "Uploads limited to {count, number} files maximum. Please use additional posts for more files.",
    },
    filesAbove: {
        id: t("file_upload.filesAbove"),
        defaultMessage:
            "Files above {max}MB could not be uploaded: {filenames}",
    },
    fileAbove: {
        id: t("file_upload.fileAbove"),
        defaultMessage: "File above {max}MB could not be uploaded: {filename}",
    },
    zeroBytesFiles: {
        id: t("file_upload.zeroBytesFiles"),
        defaultMessage: "You are uploading empty files: {filenames}",
    },
    zeroBytesFile: {
        id: t("file_upload.zeroBytesFile"),
        defaultMessage: "You are uploading an empty file: {filename}",
    },
    pasted: {
        id: t("file_upload.pasted"),
        defaultMessage: "Image Pasted at ",
    },
    uploadFile: {
        id: t("file_upload.upload_files"),
        defaultMessage: "Upload files",
    },
});

const OVERLAY_TIMEOUT = 500;

const customStyles = {
    left: "inherit",
    right: 0,
    bottom: "100%",
    top: "auto",
};

export class ShowFormat extends PureComponent {
    static propTypes = {
        channelId: PropTypes.string.isRequired,

        rootId: PropTypes.string,

        intl: intlShape.isRequired,

        locale: PropTypes.string.isRequired,

        onClick: PropTypes.func,

        actions: PropTypes.shape({}).isRequired,
    };

    static defaultProps = {
        pluginFileUploadMethods: [],
        pluginFilesWillUploadHooks: [],
    };

    constructor(props) {
        super(props);
        this.state = {
            requests: {},
            menuOpen: false,
        };
        this.fileInput = React.createRef();
    }

    componentDidMount() {}

    componentWillUnmount() {}

    handleChange = (e) => {};

    simulateInputClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.fileInput.current.click();
    };

    render() {
        const { formatMessage } = this.props.intl;
        if (isMobileApp()) {
            //do nothing
        }

        const ariaLabel = formatMessage({
            id: "accessibility.button.attachment",
            defaultMessage: "attachment",
        });

        const bodyAction = (
            <div>
                <button
                    type="button"
                    id="fileUploadButton"
                    aria-label={ariaLabel}
                    className="style--none post-action icon icon--attachment"
                >
                    <AttachmentIcon className="d-flex" />
                </button>
                <input
                    id="fileUploadInput"
                    tabIndex="-1"
                    aria-label={formatMessage(holders.uploadFile)}
                    ref={this.fileInput}
                    type="file"
                />
            </div>
        );

        return (
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement="top"
                trigger="hover"
                overlay={
                    <Tooltip id="upload-tooltip">
                        <KeyboardShortcutSequence
                            shortcut={KEYBOARD_SHORTCUTS.filesUpload}
                            hoistDescription={true}
                            isInsideTooltip={true}
                        />
                    </Tooltip>
                }
            >
                <div className={"style--none"}>{bodyAction}</div>
            </OverlayTrigger>
        );
    }
}

const wrappedComponent = injectIntl(ShowFormat, { forwardRef: true });
wrappedComponent.displayName = "injectIntl(ShowFormat)";
export default wrappedComponent;
