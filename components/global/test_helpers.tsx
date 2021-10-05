import {ProductComponent} from 'types/store/plugins';

type TestProductComponent = Omit<ProductComponent, 'switcherIcon'> & {
    switcherIcon: string;
}

export function makeProduct(name: string): TestProductComponent {
    return {
        id: name,
        pluginId: '',
        switcherIcon: `product-${name.toLowerCase()}`,
        switcherText: name,
        baseURL: '',
        switcherLinkURL: '',
        mainComponent: null,
        headerCentreComponent: null,
        headerRightComponent: null,
    };
}
