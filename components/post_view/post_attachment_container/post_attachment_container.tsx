// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useHistory} from 'react-router-dom';

export type Props = {
    className?: string;
    children?: JSX.Element;
    preventClickAction?: boolean;
    link: string;
};

const PostAttachmentContainer = (props: Props) => {
    const {children, className, link, preventClickAction} = props;
    const history = useHistory();
    const handleOnClick = useCallback(
        (e) => {
            const {tagName} = e.target;
            e.stopPropagation();
            const elements = ['A', 'IMG', 'BUTTON', 'I'];

            if (
                !elements.includes(tagName) &&
                e.target.getAttribute('role') !== 'button' &&
                e.target.className !== `attachment attachment--${className}`
            ) {
                const classNames = [
                    'icon icon-menu-down',
                    'icon icon-menu-right',
                    'post-image',
                    'file-icon',
                ];

                if (
                    !classNames.some((className) =>
                        e.target.className.includes(className),
                    ) &&
                    e.target.id !== 'image-name-text'
                ) {
                    history.push(link);
                }
            }
        },
        [history, preventClickAction],
    );

    return (
        <div
            className={`attachment attachment--${className}`}
            role={preventClickAction ? undefined : 'button'}
            onClick={preventClickAction ? undefined : handleOnClick}
        >
            <div
                className={`attachment__content attachment__content--${className}`}
            >
                <div
                    className={`clearfix attachment__container attachment__container--${className}`}
                >
                    <div
                        className={`attachment__body__wrap attachment__body__wrap--${className}`}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostAttachmentContainer;
