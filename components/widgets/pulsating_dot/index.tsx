// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import './pulsating_dot.scss';

type Props = {
    targetRef?: React.RefObject<HTMLImageElement>;
    className?: string;
    onClick?: () => void;
}

export class PulsatingDot extends React.PureComponent<Props> {
    public render() {
        let effectiveClassName = 'pulsating_dot';
        if (this.props.onClick) {
            effectiveClassName += ' pulsating_dot-clickable';
        }
        if (this.props.className) {
            effectiveClassName = effectiveClassName + ' ' + this.props.className;
        }

        return (
            <span
                className={effectiveClassName}
                onClick={this.props.onClick}
                ref={this.props.targetRef}
            />
        );
    }
}

export default PulsatingDot;
