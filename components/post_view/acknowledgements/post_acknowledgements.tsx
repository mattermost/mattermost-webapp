// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';
import {useDispatch} from 'react-redux';
import {
    FloatingFocusManager,
    autoUpdate,
    flip,
    offset,
    safePolygon,
    shift,
    useFloating,
    useHover,
    useId,
    useInteractions,
    useRole,
} from '@floating-ui/react-dom-interactions';

import {CheckCircleOutlineIcon} from '@mattermost/compass-icons/components';

import {acknowledgePost, unacknowledgePost} from 'mattermost-redux/actions/posts';

import {Post, PostAcknowledgement} from '@mattermost/types/posts';
import {UserProfile} from '@mattermost/types/users';

import PostAcknowledgementsUserPopover from './post_acknowledgements_users_popover';

import './post_acknowledgements.scss';

type Props = {
    currentUserId: UserProfile['id'];
    hasReactions: boolean;
    list?: Array<{user: UserProfile; acknowledgedAt: PostAcknowledgement['acknowledged_at']}>;
    postId: Post['id'];
}

function moreThan5minAgo(time: number) {
    const now = new Date().getTime();
    return now - time > 5 * 60 * 1000;
}

function PostAcknowledgements({
    currentUserId,
    hasReactions,
    list,
    postId,
}: Props) {
    let acknowledgedAt = 0;
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);

    if (list && list.length) {
        const ack = list.find((ack) => ack.user.id === currentUserId);
        if (ack) {
            acknowledgedAt = ack.acknowledgedAt;
        }
    }

    const {x, y, reference, floating, strategy, context} = useFloating({
        open,
        onOpenChange: setOpen,
        placement: 'top-start',
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(5),
            flip({
                fallbackPlacements: ['bottom-start', 'right'],
                padding: 12,
            }),
            shift({
                padding: 12,
            }),
        ],
    });

    const headingId = useId();

    const {getReferenceProps, getFloatingProps} = useInteractions([
        useHover(context, {
            enabled: list && list.length > 0,
            mouseOnly: true,
            delay: {
                open: 300,
                close: 0,
            },
            handleClose: safePolygon({
                blockPointerEvents: false,
                restMs: 100,
            }),
        }),
        useRole(context),
    ]);

    const handleClick = () => {
        if (acknowledgedAt) {
            dispatch(unacknowledgePost(postId));
        } else {
            dispatch(acknowledgePost(postId));
        }
    };

    const button = (
        <>
            <button
                ref={reference}
                onClick={handleClick}
                className={classNames({
                    AcknowledgementButton: true,
                    'AcknowledgementButton--acked': Boolean(acknowledgedAt),
                    'AcknowledgementButton--disabled': Boolean(acknowledgedAt) && moreThan5minAgo(acknowledgedAt),
                    'AcknowledgementButton--default': !list || list.length === 0,
                })}
                {...getReferenceProps()}
            >
                <CheckCircleOutlineIcon size={16}/>
                {(list && list.length > 0) ? list!.length : (
                    <FormattedMessage
                        id={'post_priority.button.acknowledge'}
                        defaultMessage={'Acknowledge'}
                    />
                )}
            </button>
            {hasReactions && <div className='AcknowledgementButton__divider'/>}
        </>
    );

    if (!list || !list.length) {
        return button;
    }

    return (
        <>
            {button}
            {open && (
                <FloatingFocusManager
                    context={context}
                    modal={false}
                >
                    <div
                        ref={floating}
                        style={{
                            position: strategy,
                            top: y ?? 0,
                            left: x ?? 0,
                            width: 248,
                            zIndex: 999,
                        }}
                        aria-labelledby={headingId}
                        {...getFloatingProps()}
                    >
                        <PostAcknowledgementsUserPopover
                            currentUserId={currentUserId}
                            list={list}
                        />
                    </div>
                </FloatingFocusManager>
            )}
        </>
    );
}

export default memo(PostAcknowledgements);
