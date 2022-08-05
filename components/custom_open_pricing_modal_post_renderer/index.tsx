// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import Markdown from 'components/markdown';

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

    const postProps = props.post.props;
    const requestFeatures = postProps.requested_features;

    const me = [];
    const getUsers = (d: any) => {
        const userIds: any = [];
        d.forEach((x: any) => {
            userIds.push(x.user_id);
        });

        return userIds;
    };
    const renderUsers = (d: any) => {
        if (d.length >= 5) {
            return `${d.length} members `;
        }

        const users = getUsers(d);
        const lastIndex = users.length - 1;
        return users.slice(0, lastIndex).join(', ');
    };

    const options = {
        atSumOfMembersMentions: true,
        atPlanMentions: true,
        markdown: false,
    };

    if (requestFeatures) {
        for (const key of Object.keys(requestFeatures)) {
            const title = (
                <div>
                    <span>
                        <b>
                            {`${key}`}
                        </b>
                    </span>
                    <span>
                        <Markdown
                            message=' - available on the Professional plan'
                            options={options}
                        />
                    </span>
                </div>);
            const subTitle = (
                <ul>
                    <li>
                        <Markdown
                            message={`${renderUsers(requestFeatures[key])} requested access to this feature`}
                            options={options}
                            userIds={getUsers(requestFeatures[key])}
                        />
                    </li>
                </ul>);

            me.push(title, subTitle);
        }
    }

    return (
        <div>
            <span>{props.post.message}</span>
            {me}
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
                        onClick={openPricingModal}
                        style={btnStyle}
                    >
                        {formatMessage({id: 'postypes.custom_open_pricing_modal_post_renderer.view_options', defaultMessage: 'View upgrade options'})}
                    </button>
                </div>
            </div>
        </div>
    );
}
