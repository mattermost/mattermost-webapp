// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Editor} from '@tiptap/react';
import {FormattedMessage} from 'react-intl';

import {CheckCircleOutlineIcon} from '@mattermost/compass-icons/components';

import Constants from 'utils/constants';
import OverlayTrigger from 'components/overlay_trigger';
import PriorityLabel from 'components/post_priority/post_priority_label';
import Tooltip from 'components/tooltip';

import {PostPriorityMetadata} from '@mattermost/types/posts';

type Props = {
    editor: Editor;
    priority?: PostPriorityMetadata;
}

export const PriorityLabels = React.memo(({editor, priority}: Props) => {
    const hasPrioritySet = priority?.priority || priority?.requested_ack;
    const {enablePriority} = editor.storage.core;

    if (!enablePriority || !hasPrioritySet) {
        return null;
    }

    const handleRemovePriority = () => editor.commands.setMeta('priority', null);

    return (
        <div className='AdvancedTextEditor__priority'>
            {priority?.priority && (
                <PriorityLabel
                    size='xs'
                    priority={priority?.priority}
                />
            )}
            {priority?.requested_ack && (
                <div className='AdvancedTextEditor__priority-ack'>
                    <OverlayTrigger
                        placement='top'
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        trigger={Constants.OVERLAY_DEFAULT_TRIGGER}
                        overlay={(
                            <Tooltip
                                id='post-priority-picker-ack-tooltip'
                                className='AdvancedTextEditor__priority-ack-tooltip'
                            >
                                <FormattedMessage
                                    id={'post_priority.request_acknowledgement.tooltip'}
                                    defaultMessage={'Acknowledgement will be requested'}
                                />
                            </Tooltip>
                        )}
                    >
                        <CheckCircleOutlineIcon size={14}/>
                    </OverlayTrigger>
                    {!priority?.priority && (
                        <FormattedMessage
                            id={'post_priority.request_acknowledgement'}
                            defaultMessage={'Request acknowledgement'}
                        />
                    )}
                </div>
            )}
            <OverlayTrigger
                placement='top'
                delayShow={Constants.OVERLAY_TIME_DELAY}
                trigger={Constants.OVERLAY_DEFAULT_TRIGGER}
                overlay={(
                    <Tooltip id='post-priority-picker-tooltip'>
                        <FormattedMessage
                            id={'post_priority.remove'}
                            defaultMessage={'Remove {priority}'}
                            values={{priority: priority?.priority}}
                        />
                    </Tooltip>
                )}
            >
                <button
                    type='button'
                    className='close'
                    onClick={handleRemovePriority}
                >
                    <span aria-hidden='true'>{'×'}</span>
                    <span className='sr-only'>
                        <FormattedMessage
                            id={'post_priority.remove'}
                            defaultMessage={'Remove {priority}'}
                            values={{priority: priority?.priority}}
                        />
                    </span>
                </button>
            </OverlayTrigger>
        </div>
    );
});
