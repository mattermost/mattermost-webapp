// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import Toggle from 'components/toggle';

export default class LineSwitch extends React.PureComponent {
    static propTypes = {
        title: PropTypes.node.isRequired,
        last: PropTypes.bool,
        toggled: PropTypes.bool.isRequired,
        disabled: PropTypes.bool,
        singleLine: PropTypes.bool,
        subTitle: PropTypes.node.isRequired,
        onToggle: PropTypes.func.isRequired,
        children: PropTypes.node,
        offText: PropTypes.node,
        onText: PropTypes.node,
        id: PropTypes.string,
    };

    render() {
        const {title, subTitle, singleLine, toggled, onToggle, children, offText, onText, disabled, last, id} = this.props;
        return (<div>
            <div className='line-switch d-flex flex-sm-column flex-md-row align-items-sm-start align-items-center justify-content-md-between'>
                <label className='line-switch__label'>{title}</label>
                <div
                    data-testid={id}
                    className='line-switch__toggle'
                >
                    <Toggle
                        id={id}
                        disabled={disabled}
                        onToggle={onToggle}
                        toggled={toggled}
                        onText={onText}
                        offText={offText}
                    />
                </div>
            </div>
            <div className='row'>
                <div className='col-sm-10'>
                    <div className={`help-text-small help-text-no-padding ${singleLine ? 'help-text-single-line' : ''}`}>{subTitle}</div>
                </div>
            </div>
            {children}
            {!last && <div className='section-separator'><hr className='separator__hr'/></div>}
        </div>);
    }
}
