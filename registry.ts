const modules: Record<string, unknown> = {};

export const getModule = (name: string) => {
    return modules[name];
}

export const setModule = (name: string, component: unknown) => {
    if (modules[name]) {
        return false;
    }

    modules[name] = component;
    return true;
}