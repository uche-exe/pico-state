export const cloneObject = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
}

export const isObject = (val: Object) => {
    return val !== null && typeof val === 'object' && Array.isArray(val) === false;
}

export const isString = (val: string) => {
    return val !== null && typeof val === 'string';
}

export const isEqual = (a: Object, b: Object) => {
    return JSON.stringify(a) === JSON.stringify(b);
}