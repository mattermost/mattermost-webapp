// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import { NavbarElementProps } from 'react-day-picker';

interface CustomNavbarProps extends NavbarElementProps {
    ifSearchDateSuggestion: boolean;
}

const Navbar: React.FC<Partial<CustomNavbarProps>> = (navbarProps: Partial<CustomNavbarProps>) => {
    const {
        onPreviousClick,
        onNextClick,
        className,
        ifSearchDateSuggestion,
    } = navbarProps;
    const styleLeft: React.CSSProperties = {
        float: 'left',
        fontSize: 18,
    };
    const styleRight: React.CSSProperties = {
        float: 'right',
        fontSize: 18,
    };

    return (
        <div className={className}>
            <button
                className='style--none'
                style={styleLeft}
                onClick={(e) => {
                    e.preventDefault();
                    if (onPreviousClick) {
                        onPreviousClick();
                    }
                }}
            >
                <i
                    className='fa fa-angle-left'
                    aria-hidden='true'
                    style={ifSearchDateSuggestion ? {marginLeft:48} : {}}
                />
            </button>
            <button
                className='style--none'
                style={styleRight}
                onClick={(e) => {
                    e.preventDefault();
                    if (onNextClick) {
                        onNextClick();
                    }
                }}
            >
                <i
                    className='fa fa-angle-right'
                    aria-hidden='true'
                    style={ifSearchDateSuggestion ? {marginRight:48}: {}}
                />
            </button>
        </div>
    );
};

export default Navbar;
