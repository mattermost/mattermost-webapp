// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import glyphMap, {ProductChannelsIcon} from '@mattermost/compass-icons/components';
import React from 'react';
import styled from 'styled-components';

import {useCurrentProduct} from 'utils/products';

import {Typography} from '@mattermost/compass-ui';

const ProductBrandingContainer = styled.div`
    display: flex;
    align-items: center;

    > * + * {
        margin-left: 8px;
    }
`;

const ProductBranding = (): JSX.Element => {
    const currentProduct = useCurrentProduct();

    const Icon = currentProduct?.switcherIcon ? glyphMap[currentProduct.switcherIcon] : ProductChannelsIcon;

    return (
        <ProductBrandingContainer tabIndex={0}>
            <Icon size={20}/>
            <Typography
                variant={'h200'}
                margin={0}
            >
                {currentProduct ? currentProduct.switcherText : 'Channels'}
            </Typography>
        </ProductBrandingContainer>
    );
};

export default ProductBranding;
