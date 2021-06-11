// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from "react";

export type Props = {
    className?: string;
    children?: JSX.Element;
};
const PostAttachmentContainer = (props: Props) => {
    const {children, className} = props;
    return (
        <div className={`attachment attachment--${className}`}>
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
