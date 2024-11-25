import { cloneObject, isObject, isString } from "./helpers";
import { PubSub } from "./pub-sub";

/**
 * Represents the overall state of the store. 
 * It is an object where keys are slice names and values are the 
 * corresponding slice states.
 * 
 * @example
 * ```
 * {
 *   user: { name: 'Alice', age: 30 }, 
 *   products: [{ id: 1, name: 'Laptop' }, { id: 2, name: 'Mouse' }]
 * }
 * ```
 */
export interface StoreState {
    [sliceName: string]: any;
}

/**
 * Represents the state of a single slice within the store.
 * It is a flexible object that can hold any type of data relevant to the slice.
 *
 * @example
 * ```
 * // A slice for user data
 * { 
 *   name: 'Bob', 
 *   email: 'bob@email.com', 
 *   isLoggedIn: true 
 * }
 * ```
 */
export interface Slice {
    [key: string]: any;
}

/**
 * Properties for creating a new slice within the store.
 *
 * @template T - The type of the slice's state.
 * @property {string} [name] - The unique name of the slice. This is used to access the slice later.
 * @property {T} [initialState] - The initial state of the slice.
 *
 * @example
 * ```typescript
 * const userSlice = store.createSlice({
 *   name: 'user',
 *   initialState: { name: 'John Doe', email: 'johndoe@example.com' }
 * });
 * ```
 */
export interface CreateSliceProps<T> {
    name: string;
    initialState?: T;
}

/**
 * Properties for setting the state of a slice or the entire store.
 *
 * @template T - The type of the new state value.
 * @property {string} [slice] - The name of the slice to update. If omitted, the entire store state is updated.
 * @property {T} value - The new state value to set.
 *
 * @example
 * ```typescript
 * // Set the state of the 'user' slice:
 * store.setState({ slice: 'user', value: { name: 'Jane' } });
 * 
 * // Set the entire store state:
 * store.setState({ value: { user: { name: 'Jane' }, products: [] } });
 * ```
 */
export interface SetStateProps<T> {
    slice?: string;
    value: T;
}

/**
 * Properties for initializing a new store instance.
 *
 * @property {string} [storeName] - An optional name for the store. Useful for debugging purposes.
 * @property {StoreState} [initialState] - The initial state of the store, containing all slices and their initial values.
 *
 * @example
 * ```typescript
 * const store = new Store({
 *   storeName: 'myStore',
 *   initialState: {
 *     user: { name: 'Alice', age: 30 },
 *     products: [{ id: 1, name: 'Laptop' }]
 *   }
 * });
 * ```
 */
export interface StoreProps {
    storeName?: string,
    initialState: StoreState;
}


/**
 * A simple state management store with support for creating slices and subscribing to changes.
 *
 * @template T - The type of the overall store state ( default is an empty JSON object { } ).
 */
export class Store<T extends StoreState> {
    private _storeName: string;
    private _internalState: StoreState;
    private _pubSub: PubSub;

    /**
     * Creates a new store instance
     *
     * @param {StoreProps} props - The properties for initializing the store.
     */
    constructor(props: StoreProps = { storeName: "appState", initialState: {} }) {
        const { storeName, initialState } = props
        if (!isObject(initialState)) {
            throw new Error('initial state must be an object');
        }
        this._storeName = storeName ?? "appState";
        this._internalState = cloneObject(initialState);
        this._pubSub = new PubSub()
        this.loadStateFromLocalStorage();
    }

    private saveStateToLocalStorage() {
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                const stateToSave = JSON.stringify(this.state);
                localStorage.setItem(this._storeName, stateToSave);
            } catch (error: any) {
                console.error('Error saving state to local storage:', error);
                throw new Error(error)
            }
        }
    }

    private loadStateFromLocalStorage() {
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                const savedState = localStorage.getItem(this._storeName);
                if (savedState) {
                    this._internalState = JSON.parse(savedState);
                }
            } catch (error) {
                console.error('Error loading state from local storage:', error);
                console.info('Setting state to default value...');
                this._internalState = {}
                console.info('Default value set: {}');
            }
        }
    }

    /**
     * The current state of the store.
     *
     * @type {T}
     */
    get state(): T {
        return cloneObject(this._internalState) as T;
    }

    // set state(value: SetStateProps<T>) {
    //     return;
    // }

    /**
     * Sets the state of a specific slice, or the general application store state.
     *
     * @param {SetStateProps<Partial<T>>} props - The properties to set.
     * @returns {StoreState} The current state of the store.
     */
    setState(props: SetStateProps<T>): StoreState {
        const { slice, value } = props;

        if (!slice && !isObject(value)) {
            throw new Error('non-slice value must be an object');
        }

        if (slice) {
            // Update a specific slice
            const currentState = cloneObject(this._internalState)[slice];
            const nextState = Object.assign(
                cloneObject(currentState),
                cloneObject(value)
            );
            this._internalState[slice] = nextState;
        } else {
            // Update the entire state
            this._internalState = { ...this._internalState, ...value };
        }
        this._pubSub.publish(this.state, this.state);
        this.saveStateToLocalStorage();
        return this.state;
    }

    /**
     * Creates a new slice in the store
     *
     * @template S - The type of the slice's state
     * @param {CreateSliceProps<S>} slice - The properties to set.
     * @returns {Store<StoreState & { [K in keyof S]: S[K] }>} The store instance, with the new slice added.
     */
    createSlice<T extends Slice>(slice: CreateSliceProps<T>): Store<StoreState & { [K in keyof T]: T[K] }> {
        const { name, initialState } = slice

        if (!isString(name)) {
            throw new Error('name must be a string');
        }
        this._internalState[name] = initialState ?? {};
        this._pubSub.publish(this.state, this.state)
        this.saveStateToLocalStorage();
        return this.state as any;
    }

    private subscribe(callback: CallbackListItem, config: CallbackListItem) {
        return this._pubSub.subscribe(callback, config)
    }

}