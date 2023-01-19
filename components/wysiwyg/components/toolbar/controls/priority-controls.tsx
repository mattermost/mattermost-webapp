// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';
import classNames from 'classnames';
import {Editor} from '@tiptap/react';
import {AlertCircleOutlineIcon} from '@mattermost/compass-icons/components';

import Constants from 'utils/constants';

import {IconContainer} from 'components/advanced_text_editor/formatting_bar/formatting_icon';
import KeyboardShortcutSequence, {KEYBOARD_SHORTCUTS} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';
import OverlayTrigger from 'components/overlay_trigger';
import PostPriorityPickerOverlay from 'components/post_priority/post_priority_picker_overlay';
import Tooltip from 'components/tooltip';

import {PostPriorityMetadata} from '@mattermost/types/posts';

/**
 * moved this into the toolbar since having it outside the wysiwyg lead to constant rerenderings due to the parents
 * state being changed whenever the picker got toggled. This can potentially be made pluggable (ideally as its own
 * component that manages the toggle state itself) again once we have a better parent component (create_post)
 */
export const PriorityControls = ({editor}: {editor: Editor}) => {
    const [showPriorityPicker, setShowPriorityPicker] = useState(false);
    const priorityPickerRef = useRef<HTMLButtonElement>(null);

    const getPostPriorityPickerRef = () => priorityPickerRef.current;
    const togglePostPriorityPicker = () => setShowPriorityPicker(!showPriorityPicker);
    const hidePriorityPicker = () => setShowPriorityPicker(false);

    const handlePriorityApply = (priority: PostPriorityMetadata) => {
        const metadata = (priority?.priority || priority?.requested_ack) ? {
            ...priority,
            priority: priority.priority || '',
            requested_ack: priority.requested_ack,
        } : {};

        /**
         * leveraging prosemirror's meta API to set a meta on a transaction (in this case the actual transaction is
         * empty and only used for transmitting the metadata to the wysiwyg component where the state for it is beding
         * handled). This pattern can potentially be used for other metadata as well.
         */
        editor.commands.setMeta('priority', metadata);
    };

    return (
        <React.Fragment key='PostPriorityPicker'>
            <PostPriorityPickerOverlay
                settings={editor.storage.metadata?.priority}
                show={showPriorityPicker}
                target={getPostPriorityPickerRef}
                onApply={handlePriorityApply}
                onHide={hidePriorityPicker}
                defaultHorizontalPosition='left'
            />
            <OverlayTrigger
                placement='top'
                delayShow={Constants.OVERLAY_TIME_DELAY}
                trigger={Constants.OVERLAY_DEFAULT_TRIGGER}
                overlay={(
                    <Tooltip id='post-priority-picker-tooltip'>
                        <KeyboardShortcutSequence
                            shortcut={KEYBOARD_SHORTCUTS.msgPostPriority}
                            hoistDescription={true}
                            isInsideTooltip={true}
                        />
                    </Tooltip>
                )}
            >
                <IconContainer
                    ref={priorityPickerRef}
                    className={classNames({control: true, active: showPriorityPicker})}
                    type='button'
                    onClick={togglePostPriorityPicker}
                >
                    <AlertCircleOutlineIcon
                        size={18}
                        color='currentColor'
                    />
                </IconContainer>
            </OverlayTrigger>
        </React.Fragment>
    );
};
