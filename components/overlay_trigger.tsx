// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {OverlayTrigger as BaseOverlayTrigger, OverlayTriggerProps} from 'react-bootstrap';
import {IntlContext, IntlShape} from 'react-intl';

export {BaseOverlayTrigger};

type Props = OverlayTriggerProps;

const OverlayTrigger = React.forwardRef((props: Props, ref?: React.Ref<BaseOverlayTrigger>) => {
    const {overlay, ...otherProps} = props;

    // The overlay is rendered outside of the regular React context, and our version react-bootstrap can't forward
    // that context itself, so we have to manually forward the react-intl context to this component's child.
    const OverlayWrapper = ({intl, ...overlayProps}: {intl: IntlShape}) => (
        <IntlContext.Provider value={intl}>
            {React.cloneElement(overlay, overlayProps)}
        </IntlContext.Provider>
    );

    return (
        <IntlContext.Consumer>
            {(intl): React.ReactNode => (
                <BaseOverlayTrigger
                    {...otherProps}
                    ref={ref}
                    overlay={
                        <OverlayWrapper
                            {...overlay.props}
                            intl={intl}
                        />
                    }
                />
            )}
        </IntlContext.Consumer>
    );
});

OverlayTrigger.defaultProps = {
    defaultOverlayShown: false,
    trigger: ['hover', 'focus']
};
OverlayTrigger.displayName = 'OverlayTrigger';

export default OverlayTrigger;
