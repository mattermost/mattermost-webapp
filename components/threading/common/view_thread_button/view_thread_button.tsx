// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ButtonHTMLAttributes, ReactNode} from 'react';
import classNames from 'classnames';

import './view_thread_button.scss';

type Props = {
    prepend?: ReactNode;
}

type Attrs = Exclude<ButtonHTMLAttributes<HTMLButtonElement>, Props>

function ViewThreadButton({
    prepend,
    children,
    ...attrs
}: Props & Attrs) {
    return (
        <button
            {...attrs}
            className={classNames('ViewThreadButton', attrs.className)}
        >
            {prepend && (
                <span className='ViewThreadButton_prepended'>
                    {prepend}
                </span>
            )}
            <span className='ViewThreadButton_label'>
                {children}
            </span>
        </button>
    );
}

export default memo(ViewThreadButton);
