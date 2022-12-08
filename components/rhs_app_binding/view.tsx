// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Markdown from 'components/markdown';

import {AppBindingMenu} from './menu';
import {AppBindingForm} from './form';
import {AppBindingButton} from './button';
import ListBlock from './list_block';

import {CommonProps} from './common_props';
import Select from './select';
import AppBindingLayout from './layout';

export function AppBindingView(props: CommonProps) {
    const subviewProps = {
        ...props,
        viewComponent: AppBindingView,
    };

    switch (props.binding.type) {
    case 'view': {
        return (
            <>
                {props.binding.bindings?.map((b) => (
                    <div key={b.location}>
                        <AppBindingView
                            {...subviewProps}
                            binding={b}
                        />
                    </div>
                ))}
            </>
        );
    }
    case 'layout':
        return <AppBindingLayout {...subviewProps}/>;
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
            <div
                style={styles.containerSpacing}
            >
                <hr/>
            </div>
        );
    case 'markdown':
        return (
            <div
                style={styles.containerSpacing}
            >
                <Markdown message={b.label}/>
            </div>
        );
    case 'select':
        return (
            <div
                style={styles.containerSpacing}
            >
                <Select {...subviewProps}/>
            </div>
        );
    }

    return <p>{'Unsupported binding type: ' + props.binding.type}</p>;
}

const styles = {
    containerSpacing: {
        paddingLeft: '20px',
        paddingRight: '20px',
    },
};
