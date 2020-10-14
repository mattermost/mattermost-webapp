// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {DraggableProvidedDragHandleProps} from 'react-beautiful-dnd';

import {wrapEmojis} from 'utils/emoji_utils';

type Props = {
    children?: React.ReactNode;
    displayName: string;
    dragHandleProps?: DraggableProvidedDragHandleProps;
    isDragging?: boolean;
    isDraggingOver?: boolean;
}

export const SidebarCategoryHeader = React.forwardRef((props: Props, ref?: React.Ref<HTMLDivElement>) => {
    return (
        <div className='SidebarChannelGroupHeader'>
            <div
                ref={ref}
                className={classNames('SidebarChannelGroupHeader_groupButton', {
                    dragging: props.isDragging,
                })}
                aria-label={props.displayName}
            >
                <div {...props.dragHandleProps}>
                    {wrapEmojis(props.displayName)}
                </div>
            </div>
            {props.children}
        </div>
    );
});
SidebarCategoryHeader.defaultProps = {
    isDragging: false,
    isDraggingOver: false,
};
SidebarCategoryHeader.displayName = 'SidebarCategoryHeader';

type PropsCollapsible = Props & {
    isCollapsed: boolean,
    isCollapsible: boolean,
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export const SidebarCategoryHeaderCollapsible = React.forwardRef((props: PropsCollapsible, ref?: React.Ref<HTMLButtonElement>) => {
    return (
        <div className='SidebarChannelGroupHeader'>
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
                <div {...props.dragHandleProps}>
                    {wrapEmojis(props.displayName)}
                </div>
            </button>
            {props.children}
        </div>
    );
});
SidebarCategoryHeaderCollapsible.defaultProps = {
    isCollapsible: true,
    isDragging: false,
    isDraggingOver: false,
};
SidebarCategoryHeaderCollapsible.displayName = 'SidebarCategoryHeaderCollapsible';
