// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {OverlayTrigger as BaseOverlayTrigger, OverlayTriggerProps} from 'react-bootstrap';
import {IntlContext, IntlShape} from 'react-intl';

type Props = OverlayTriggerProps;

export default class OverlayTrigger extends React.PureComponent<Props> {
    static defaultProps = {
        defaultOverlayShown: false,
        trigger: ['hover', 'focus']
    }

    render() {
        const {overlay, ...props} = this.props;

        // The overlay is rendered outside of the regular React context, and our version react-bootstrap can't forward
        // that context itself, so we have to manually forward the react-intl context to this component's child.
        const OverlayWrapper = ({intl, ...otherProps}: {intl: IntlShape}) => (
            <IntlContext.Provider value={intl}>
                {React.cloneElement(overlay, otherProps)}
            </IntlContext.Provider>
        );

        return (
            <IntlContext.Consumer>
                {(intl): React.ReactNode => (
                    <BaseOverlayTrigger
                        {...props}
                        overlay={<OverlayWrapper intl={intl}/>}
                    />
                )}
            </IntlContext.Consumer>
        );
    }
}
