// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {DraggableProvidedDragHandleProps} from 'react-beautiful-dnd';

import {wrapEmojis} from 'utils/emoji_utils';
import * as UserAgent from 'utils/user_agent';

type StaticProps = {
    children?: React.ReactNode;
    displayName: string;
}

export const SidebarCategoryHeaderStatic = React.forwardRef((props: StaticProps, ref?: React.Ref<HTMLDivElement>) => {
    return (
        <div
            className={classNames('SidebarChannelGroupHeader SidebarChannelGroupHeader--static', {
                'SidebarChannelGroupHeader--sticky': supportsStickyHeaders(),
            })}
        >
            <div
                ref={ref}
                className='SidebarChannelGroupHeader_groupButton'
            >
                <div className='SidebarChannelGroupHeader_text'>
                    {wrapEmojis(props.displayName)}
                </div>
                {props.children}
            </div>
        </div>
    );
});
SidebarCategoryHeaderStatic.displayName = 'SidebarCategoryHeaderStatic';

type Props = StaticProps & {
    dragHandleProps?: DraggableProvidedDragHandleProps
    isCollapsed: boolean,
    isCollapsible: boolean,
    isDragging?: boolean;
    isDraggingOver?: boolean;
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export const SidebarCategoryHeader = React.forwardRef((props: Props, ref?: React.Ref<HTMLButtonElement>) => {
    return (
        <div
            className={classNames('SidebarChannelGroupHeader', {
                'SidebarChannelGroupHeader--sticky': supportsStickyHeaders(),
            })}
        >
            <button
                ref={ref}
                className={classNames('SidebarChannelGroupHeader_groupButton', {
                    dragging: props.isDragging,
                })}
                aria-label={props.displayName}
                onClick={props.onClick}
            >
                <i
                    className={classNames('icon icon-chevron-down', {
                        'icon-rotate-minus-90': props.isCollapsed,
                        'hide-arrow': !props.isCollapsible,
                    })}
                />
                <div
                    className='SidebarChannelGroupHeader_text'
                    {...props.dragHandleProps}
                >
                    {wrapEmojis(props.displayName)}
                </div>
                {props.children}
            </button>
        </div>
    );
});
SidebarCategoryHeader.defaultProps = {
    isCollapsible: true,
    isDragging: false,
    isDraggingOver: false,
};
SidebarCategoryHeader.displayName = 'SidebarCategoryHeader';

function supportsStickyHeaders() {
    return !UserAgent.isFirefox() && !UserAgent.isSafari();
}
