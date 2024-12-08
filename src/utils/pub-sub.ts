import { isEqual, isObject } from "./helpers";

export class PubSub {

    private _callbackList: CallbackListItem[];

    constructor(callbackList: CallbackListItem[] = []) {
        this._callbackList = callbackList;
    }

    publish(currentState: Object, nextState: Object) {
        if (!isObject(currentState)) {
            throw new Error('currentState should be and object');
        }
        if (!isObject(nextState)) {
            throw new Error('nextState should be and object');
        }
        this._callbackList.forEach(item => {
            const currentValue = item.config(currentState);
            const nextValue = item.config(nextState);
            if (!isEqual(currentValue, nextValue)) {
                item.callback(nextValue);
            }
        });
    }

    subscribe(callback: CallbackListItem, config: CallbackListItem) {
        if (typeof callback !== 'function') {
            throw new Error('callback should be a function');
        }
        if (typeof config !== 'function') {
            throw new Error('config should be a function');
        }
        this._callbackList = [
            ...this._callbackList,
            { callback, config }
        ];
        // Return an unsubscribe function
        return () => {
            this._callbackList = this._callbackList.filter(item => item.callback !== callback);
        };
    }
}