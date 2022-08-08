// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import Markdown from 'components/markdown';

import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import {Post} from '@mattermost/types/posts';
import {GlobalState} from 'types/store';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import useOpenCloudPurchaseModal from 'components/common/hooks/useOpenCloudPurchaseModal';

export default function OpenPricingModalPost(props: {post: Post}) {
    let allProfessional = true;

    const openPurchaseModal = useOpenCloudPurchaseModal({});
    const {formatMessage} = useIntl();

    const openPricingModal = useOpenPricingModal();
    const style = {
        display: 'flex',
        gap: '10px',
        padding: '12px',
        borderRadius: '4px',
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
    const getUserIds = (d: any) => {
        const userIds: any = [];
        d.forEach((x: any) => {
            userIds.push(x.user_id);
        });

        return userIds;
    };

    const getUserNames = (d: any) => {
        const userNames: any = [];
        getUserIds(d).forEach((id: any) => {
            const profile = useSelector((state: GlobalState) => getUser(state, id));
            userNames.push('@' + profile?.username);
        });

        return userNames;
    };

    const renderUsers = (d: any) => {
        if (d.length >= 5) {
            return `${d.length} members `;
        }

        let renderedUsers;

        const users = getUserNames(d);

        if (users.length === 1) {
            renderedUsers = users[0];
        } else {
            const lastIndex = users.length - 1;
            renderedUsers = users.slice(0, lastIndex).join(', ');
        }

        return renderedUsers;
    };

    const options = {
        atSumOfMembersMentions: true,
        atPlanMentions: true,
        markdown: false,
    };

    const mapFeatureToPlan = (feature: string) => {
        switch (feature) {
        case 'Guest Accounts':
        case 'Create Multiple Teams':
            return 'Professional plan';
        case 'Custom user groups':
            allProfessional = false;
            return 'Enterprise plan';
        default:
            return 'Professional plan';
        }
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
                            message={` - available on the ${mapFeatureToPlan(key)}`}
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
                            userIds={getUserIds(requestFeatures[key])}
                            messageMetadata={{requestedFeature: key}}
                        />
                    </li>
                </ul>);

            me.push(title, subTitle);
        }
    }

    const renderButtons = () => {
        if (allProfessional) {
            return (
                <>
                    <button
                        onClick={openPurchaseModal}
                        style={btnStyle}
                    >
                        {'Upgrade to Professional'}
                    </button>
                    <button
                        onClick={openPricingModal}
                        style={{...btnStyle, color: 'var(--button-bg)', background: 'rgba(var(--denim-button-bg-rgb), 0.08)'}}
                    >
                        {formatMessage({id: 'postypes.custom_open_pricing_modal_post_renderer.view_options', defaultMessage: 'View upgrade options'})}
                    </button>
                </>
            );
        }
        return (
            <button
                onClick={openPricingModal}
                style={{...btnStyle, border: '1px solid var(--button-bg)', color: 'var(--button-bg)', background: 'var(--sidebar-text)'}}
            >
                {formatMessage({id: 'postypes.custom_open_pricing_modal_post_renderer.view_options', defaultMessage: 'View upgrade options'})}
            </button>);
    };

    return (
        <div>
            <span>{props.post.message}</span>
            {me}
            <div style={{display: 'flex'}}>
                <div
                    style={style}
                >
                    {renderButtons()}
                </div>
            </div>
        </div>
    );
}
