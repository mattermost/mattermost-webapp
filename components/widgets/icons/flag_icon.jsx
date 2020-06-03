// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class FlagIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <FormattedMessage
                    id='generic_icons.flag'
                    defaultMessage='Flag Icon'
                >
                    {(ariaLabel) => (
                        <svg class="bi bi-star" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.523-3.356c.329-.314.158-.888-.283-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767l-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288l1.847-3.658 1.846 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.564.564 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z"/>
</svg>
                    )}
                </FormattedMessage>
            </span>
        );
    }
}

// Flag was replaced with star , hardcoded code taken from ///// https://icons.getbootstrap.com/icons/star/  ///// 


/*<svg
                            width='14px'
                            height='16px'
                            viewBox='0 0 15 17'
                            role='img'
                            aria-label={ariaLabel}
                        >
                            <path d='M7.36 2.59999L7.72 4.39999H12.4V9.79999H9.34L8.98 7.99999H2.5V2.59999H7.36ZM8.8 0.799987H0.7V16.1H2.5V9.79999H7.54L7.9 11.6H14.2V2.59999H9.16L8.8 0.799987Z'/>
                        </svg>*/
