// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import Icon from '@mattermost/compass-components/foundations/icon';
import Heading from '@mattermost/compass-components/components/heading';

import {useProducts, useCurrentProductId} from '../hooks';

type Props = {
    onClick: React.MouseEventHandler<HTMLDivElement>;
}

const ProductBrandingContainer = styled.div`
    display: flex;
    align-items: center;

    > * + * {
        margin-left: 8px;
    }
`;

const ProductBranding: React.FC<Props> = ({onClick}: Props): JSX.Element | null => {
    const products = useProducts();
    const currentProductID = useCurrentProductId(products);
    const currentProduct = products?.find((product) => product.id === currentProductID);

    return (
        <ProductBrandingContainer onClick={onClick}>
            <Icon
                size={20}
                glyph={currentProduct && typeof currentProduct.switcherIcon === 'string' ? currentProduct.switcherIcon : 'product-channels'}
            />
            <Heading
                element='h1'
                size={200}
                margin='none'
            >
                {currentProduct ? currentProduct.switcherText : 'Channels'}
            </Heading>
        </ProductBrandingContainer>
    );
};

export default ProductBranding;
