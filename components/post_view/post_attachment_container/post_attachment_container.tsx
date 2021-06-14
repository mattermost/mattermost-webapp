// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { useCallback } from "react";
import {useHistory} from "react-router-dom";

export type Props = {
    className?: string;
    children?: JSX.Element;
    link: string;
};
const PostAttachmentContainer = (props: Props) => {
    const {children, className, link} = props;
    const history = useHistory();
    const handleOnClick = useCallback(() => {
        history.push(link);
    }, [history]);
    return (
        <div 
            className={`attachment attachment--${className}`}
            onClick={handleOnClick}
        >
            <div className={`attachment__content attachment__content--${className}`}>
                <div className={`clearfix attachment__container attachment__container--${className}`}>
                    <div className={`attachment__body__wrap attachment__body__wrap--${className}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostAttachmentContainer;
