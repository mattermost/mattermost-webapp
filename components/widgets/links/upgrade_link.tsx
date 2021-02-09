// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';
export interface UpgradeLinkProps {
    handleClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const UpgradeLink: React.FC<UpgradeLinkProps> = (props: UpgradeLinkProps) => {
    return (
        <button
            className='upgradeLink'
            onClick={(e) => props.handleClick(e)}
        >
            <FormattedMessage
                id='upgradeLink.warn.upgrade_now'
                defaultMessage='Upgrade now'
            />
        </button>
    );
};

export default UpgradeLink;
