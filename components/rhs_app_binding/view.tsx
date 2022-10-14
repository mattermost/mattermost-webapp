// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Markdown from 'components/markdown';

import {AppBindingMenu} from './menu';
import {AppBindingForm} from './form';
import {AppBindingButton} from './button';
import ListBlock from './list_block';

import {CommonProps} from './common_props';

export function AppBindingView(props: CommonProps) {
    const subviews = props.binding.bindings?.map((b, i) => {
        const subviewProps = {
            ...props,
            key: i,
            binding: b,
            viewComponent: AppBindingView,
        };

        switch (b.type) {
        case 'view':
            return <AppBindingView {...subviewProps}/>;
        case 'menu':
            return <AppBindingMenu {...subviewProps}/>;
        case 'form':
            return <AppBindingForm {...subviewProps}/>;
        case 'button':
            return <AppBindingButton {...subviewProps}/>;
        case 'list_block':
            return <ListBlock {...subviewProps}/>;
        case 'divider':
            return (
                <div style={styles.containerSpacing}>
                    <Markdown message='-----'/>
                </div>
            );
        case 'markdown':
            return (
                <div style={styles.containerSpacing}>
                    <Markdown message={b.label}/>
                </div>
            );
        }

        return <p key={b.location || b.label}>{'Unsupported binding type: ' + b.type}</p>;
    });

    return (
        <div>
            {subviews}
        </div>
    );
}

const styles = {
    containerSpacing: {
        paddingLeft: '20px',
        paddingRight: '20px',
    },
};
