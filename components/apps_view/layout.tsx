// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {CommonProps} from './common_props';

export default function AppBindingLayout(props: CommonProps) {
    if (!props.binding.bindings?.length) {
        return (
            <span>
                {'No bindings for this layout component'}
            </span>
        );
    }

    switch (props.binding.subtype) {
    case 'horizontal':
        return (
            <AppBindingLayoutHorizontal {...props}/>
        );
    }

    return (
        <span>
            {'Unsupported layout subtype: ' + props.binding.subtype}
        </span>
    );
}

export function AppBindingLayoutHorizontal(props: CommonProps) {
    return (
        <div
            className='horizontal-row'
        >
            {props.binding.bindings?.map((b) => (
                <props.viewComponent
                    key={b.location}
                    {...props}
                    binding={b}
                />
            ))}
        </div>
    );
}
