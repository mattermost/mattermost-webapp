// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';
import classNames from 'classnames';

import './index.scss';

export interface Props {
    primaryLabel: ReactNode;
    leadingElement?: ReactNode;
    secondaryLabel?: ReactNode;
    trailingElement?: ReactNode;
    subMenuDetails?: ReactNode;
    isDestructive?: boolean;
}

export function PopoverMenuItem(props: Props) {
    return (
        <div className={classNames('popover-menu-item', {destructive: props.isDestructive})}>
            {props.leadingElement && (
                <div className='leading-element'>{props.leadingElement}</div>
            )}
            <div className='label-elements'>
                <div className='primary-label'>{props.primaryLabel}</div>
                {props.secondaryLabel && (
                    <div className='secondary-label'>{props.secondaryLabel}</div>
                )}
            </div>
            {(props.subMenuDetails || props.trailingElement) && (
                <div className='trailing-elements'>
                    {props.subMenuDetails && (
                        <div className='sub-menu-detail'>{props.subMenuDetails}</div>
                    )}
                    {props.trailingElement && (
                        <div className='end-element'>{props.trailingElement}</div>
                    )}
                </div>
            )}
        </div>
    );
}
