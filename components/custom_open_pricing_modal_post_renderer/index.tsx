// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import {Post} from '@mattermost/types/posts';

export default function OpenPricingModalPost(props: {post: Post}) {
    const {formatMessage} = useIntl();

    const openPricingModal = useOpenPricingModal();
    const style = {
        padding: '12px',
        borderRadius: '0 4px 4px 0',
        border: '1px solid rgba(var(--center-channel-text-rgb), 0.16)',
        width: 'max-content',
        margin: '10px 0',
    };

    const btnStyle = {
        background: 'var(--button-bg)',
        color: 'var(--button-color)',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 20px',
        fontWeight: 600,
    };

    return (
        <div>
            <span>{props.post.message}</span>
            <div style={{display: 'flex'}}>
                <div
                    style={{
                        height: 'inherit',
                        width: '5px',
                        backgroundColor: 'var(--denim-sidebar-active-border)',
                        margin: '10px 0',
                    }}
                />
                <div
                    style={style}
                >
                    <button
                        onClick={() => openPricingModal({trackingLocation: 'notify_admin_message_view_upgrade_options'})}
                        style={btnStyle}
                    >
                        {formatMessage({id: 'postypes.custom_open_pricing_modal_post_renderer.view_options', defaultMessage: 'View upgrade options'})}
                    </button>
                </div>
            </div>
        </div>
    );
}
