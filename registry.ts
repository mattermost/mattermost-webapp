const components = {};

export const getComponent = (name: string) => {
    console.log('the components', components);
    return components[name];
}

export const setComponent = (name: string, component: any) => {
    if (components[name]) {
        return false;
    }

    components[name] = component;
    return true;
}