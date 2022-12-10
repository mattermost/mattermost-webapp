// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react';

import {useSelector} from 'react-redux';

import Markdown from 'components/markdown';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import {AppBindingMenu} from './menu';
import {AppBindingForm} from './form';
import {AppBindingButton} from './button';
import ListBlock from './list_block';

import {CommonProps} from './common_props';
import Select from './select/select';
import AppBindingLayout from './layout';

export function AppBindingView(props: CommonProps) {
    const {binding, handleBindingClick} = props;

    const [sourceFetched, setSourceFetched] = useState(false);

    const currentChannelId = useSelector(getCurrentChannelId);
    const channelIdRef = useRef(currentChannelId);

    useEffect(() => {
        const prevChannelId = channelIdRef.current;
        channelIdRef.current = currentChannelId;

        let shouldFetchSource = Boolean(binding.source) && !sourceFetched;
        if (binding.source?.expand?.channel && prevChannelId !== currentChannelId) {
            shouldFetchSource = true;
        }

        if (!shouldFetchSource) {
            return;
        }

        setSourceFetched(true);
        handleBindingClick({...binding, submit: binding.source});
    }, [currentChannelId, binding, handleBindingClick, sourceFetched]);

    return (
        <>
            {binding.bindings?.map((b) => (
                <div key={b.location}>
                    <AppBindingBaseView
                        {...props}
                        binding={b}
                    />
                </div>
            ))}
        </>
    );
}

export function AppBindingBaseView(props: CommonProps) {
    const subviewProps = {
        ...props,
        viewComponent: AppBindingBaseView,
    };

    switch (props.binding.type) {
    case 'view':
        return <AppBindingView {...subviewProps}/>;
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
                <Markdown message={props.binding.label}/>
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
