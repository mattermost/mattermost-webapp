// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';

const QuickUse = styled.button`
    position: absolute;
    top: 16px;
    right: 16px;

    text-align: center;
    padding: 4px 10px;
    border: 0px;

    background: var(--denim-button-bg);
    border-radius: 4px;
    font-weight: 600;

    font-size: 11px;
    line-height: 16px;
    color: var(--button-color);
`;

interface UseCaseProps {
    className?: string;
    name: string;
    illustration: string;
    channelsCount: number;
    boardsCount: number;
    playbooksCount: number;

    onQuickUse: () => void;
    onSelectTemplate: () => void;
}

const UseCase = (props: UseCaseProps) => {
    const {formatMessage, formatList} = useIntl();

    const details = useMemo(() => {
        const detailBuilder: string[] = [];
        if (props.channelsCount) {
            detailBuilder.push(formatMessage({
                id: 'worktemplates.menu.usecase_channels_count',
                defaultMessage: '{channelsCount, plural, =1 {# channel} other {# channels}}',
            }, {channelsCount: props.channelsCount}));
        }

        if (props.boardsCount) {
            detailBuilder.push(formatMessage({
                id: 'worktemplates.menu.usecase_boards_count',
                defaultMessage: '{boardsCount, plural, =1 {# board} other {# boards}}',
            }, {boardsCount: props.boardsCount}));
        }

        if (props.playbooksCount) {
            detailBuilder.push(formatMessage({
                id: 'worktemplates.menu.usecase_playbooks_count',
                defaultMessage: '{playbooksCount, plural, =1 {# playbook} other {# playbooks}}',
            }, {playbooksCount: props.playbooksCount}));
        }

        return formatList(detailBuilder, {style: 'narrow'});
    }, [props.channelsCount, props.boardsCount, props.playbooksCount]);

    const selectTemplate = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();

        props.onSelectTemplate();
    };

    const quickUse = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();

        props.onQuickUse();
    };

    return (
        <div
            className={props.className}
            onClick={selectTemplate}
        >
            <div className='illustration'>
                <QuickUse onClick={quickUse}>{formatMessage({id: 'worktemplates.menu.quick_use', defaultMessage: 'Quick use'})}</QuickUse>
                <img src={props.illustration}/>
            </div>
            <div className='name'>
                {props.name}
                <p className='details'>
                    {details}
                </p>
            </div>
        </div>
    );
};

const StyledUseCaseMenuItem = styled(UseCase)`
    display: flex;
    flex-direction: column;
    width: 220px;
    height: 185px;
    border: 1px solid rgba(var(--center-channel-text-rgb), 0.16);
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 16px;

    ${QuickUse} {
        display: none;
    }

    .illustration {
        height: 129px;
        background: rgba(73, 146, 243, 0.2);
        border-radius: 8px 8px 0px 0px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        position: relative;

        img {
            width: 204px;
            height: 123px;
        }
    }

    .name {
        padding: 18px 12px;
        width: 220px;
        height: 54px;
        font-weight: 600;
        font-size: 12px;
        line-height: 16px;
        color: var(--center-channel-color);

        .details {
            display: none;
            font-weight: 400;
            font-size: 11px;
            line-height: 16px;
            letter-spacing: 0.02em;
            color: rgba(var(--center-channel-color), 0.72);
        }
    }

    &:hover {
        box-shadow: var(--elevation-2);
        ${QuickUse} {
            display: inline-block;
        }

        .name {
            padding-top: 10px;
            .details {
                display: block;
            }
        }
    }
`;

export default StyledUseCaseMenuItem;

