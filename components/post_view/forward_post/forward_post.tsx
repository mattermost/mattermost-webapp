// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {useIntl} from 'react-intl';

import {Post} from '@mattermost/types/posts';
import {ModalData} from 'types/actions';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import ForwardPostModal from 'components/forward_post_modal';
import Constants, {ModalIdentifiers} from 'utils/constants';

type Props = {
    post: Post;
    isPostForwardingEnabled: boolean;
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
    };
}

const ForwardPost = ({post, actions, isPostForwardingEnabled}: Props) => {
    const {formatMessage} = useIntl();

    const openForwardPostModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        actions.openModal({
            modalId: ModalIdentifiers.FORWARD_POST_MODAL,
            dialogType: ForwardPostModal,
            dialogProps: {post},
        });
    };

    return isPostForwardingEnabled ? (
        <OverlayTrigger
            key={'forwardtooltipkey'}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='top'
            overlay={
                <Tooltip
                    id='forwardTooltip'
                    className='hidden-xs'
                >
                    {formatMessage({
                        id: 'forward_post_button.tooltip',
                        defaultMessage: 'Forward Message',
                    })}
                </Tooltip>
            }
        >
            <button
                id={`forwardIcon_${post.id}`}
                aria-label={formatMessage({id: 'forward_post_button.tooltip', defaultMessage: 'Forward Message'}).toLowerCase()}
                className='post-menu__item'
                onClick={openForwardPostModal}
            >
                <i className='icon icon-arrow-right-bold-outline'/>
            </button>
        </OverlayTrigger>
    ) : null;
};

export default memo(ForwardPost);
