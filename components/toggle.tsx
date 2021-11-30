// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    onToggle: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    toggled?: boolean;
    disabled?: boolean;
    onText?: React.ReactNode;
    offText?: React.ReactNode;
    id?: string;
    overrideTestId?: boolean;
}

const Toggle: React.FC<Props> = (props: Props) => {
    const {onToggle, toggled, disabled, onText, offText, id, overrideTestId} = props;
    let dataTestId = `${id}-button`;
    if (overrideTestId) {
        dataTestId = id || '';
    }
    return (
        <button
            data-testid={dataTestId}
            id={id}
            type='button'
            onClick={onToggle}
            className={`btn btn-lg btn-toggle ${toggled ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
            aria-pressed={toggled ? 'true' : 'false'}
            disabled={disabled}
        >
            <div className='handle'/>
            {text(toggled, onText, offText)}
        </button>
    );
};

function text(toggled?: boolean, onText?: React.ReactNode, offText?: React.ReactNode): React.ReactNode | null {
    if ((toggled && !onText) || (!toggled && !offText)) {
        return null;
    }
    return (<div className={`bg-text ${toggled ? 'on' : 'off'}`}>{toggled ? onText : offText}</div>);
}

export default Toggle;
