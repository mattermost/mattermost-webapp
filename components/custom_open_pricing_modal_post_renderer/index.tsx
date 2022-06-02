// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import {Post} from '@mattermost/types/posts';

export default function CustomOpenPricingModalPostRenderer(props: {post: Post}) {
    const openPricingModal = useOpenPricingModal();
    const style = {
        padding: '12px',
        borderRadius: '0 4px 4px 0',
        border: '1px solid rgba(var(--center-channel-text-rgb), 0.16)',
        borderLeft: '5px solid var(--denim-sidebar-active-border)',
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
            <div
                style={style}
            >
                <button
                    onClick={openPricingModal}
                    style={btnStyle}
                >
                    {'View upgrade options'}
                </button>
            </div>
        </div>
    );
}
