// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

type Props = {
    children: React.ReactNode;
    expanded?: boolean;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    buttonText?: React.ReactNode;
    onClick?: () => void;
};

const CardHeader: React.FC<Props> = (props: Props) => {
    return (
        <div className={classNames('Card__header', {expanded: props.expanded})}>
            {
                props.title && props.subtitle ?
                    <>
                        <div>
                            <div className='text-top'>
                                {props.title}
                            </div>
                            <div className='text-bottom'>
                                {props.subtitle}
                            </div>
                        </div>
                        {
                            props.buttonText && props.onClick ?
                                <button
                                    className='button primary'
                                    onClick={props.onClick}
                                >
                                    {props.buttonText}
                                </button> :
                                ''
                        }
                    
                    </> : 
                    <>
                        {props.children}
                        {props.expanded && <hr className='Card__hr'/>}
                    </>
            }
            
        </div>
    );
};

export default CardHeader;
