// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router-dom';

type Props = {
<<<<<<< HEAD:components/integrations/integration_option.tsx
        image: string,
        title: React.ReactNode,
        description: React.ReactNode,
        link: string,
}
export default class IntegrationOption extends React.PureComponent<Props> {


=======
    image: string;
    title: React.ReactNode;
    description: React.ReactNode;
    link: string;
}
export default class IntegrationOption extends React.PureComponent<Props> {
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/integration_option.jsx
    render() {
        const {image, title , description, link} = this.props;

        return (
            <Link
                to={link}
                className='integration-option'
            >
                <img
                    alt={'integration image'}
                    className='integration-option__image'
                    src={image}
                />
                <div className='integration-option__title'>
                    {title}
                </div>
                <div className='integration-option__description'>
                    {description}
                </div>
            </Link>
        );
    }
}
