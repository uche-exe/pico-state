# Statey: Tiny State, Big Impact

Statey is a lightweight state management library designed for JavaScript and TypeScript projects. It offers a simple, intuitive API for managing your application state with minimal overhead. Whether you're building a small single-page application or a more complex project, Statey provides the essential tools to keep your state organized and predictable.

## Table of Contents

- [Key Features](#key-features)
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [1. Import Statey](#1-import-statey)
  - [2. Create a Store](#2-create-a-store)
  - [3. Create Slices](#3-create-slices)
  - [4. Access and Update State](#4-access-and-update-state)
- [API Documentation](#api-documentation)
  - [`Store` Class](#store-class)
    - [`constructor(props?: StoreProps)`](#constructorprops-storeprops)
    - [`state: T` (getter)](#state-t-getter)
    - [`setState(props: SetStateProps<Partial<T>>): Promise<StoreState>`](#setstateprops-setstatepropspartialt-promisestorstate) 
    - [`createSlice<S extends Slice>(props: CreateSliceProps<S>): Store<StoreState & { [K in keyof S]: S[K] }>`](#createsliceprops-createslicepropss-storestorestate--k-in-keyof-s-ssk)
- [LocalStorage Persistence](#localstorage-persistence)
- [Examples](#examples)
- [Contributing](#contributing)

## Key Features

- **Lightweight:** With zero dependencies and a tiny footprint, Statey adds minimal overhead to your project.
- **Simplicity:** An easy-to-learn API makes state management a breeze, even for beginners.
- **Slices:** Organize your state into logical slices for better maintainability and separation of concerns.
- **Type Safety:** Built with TypeScript from the ground up, Statey provides strong typing and improved code quality.
- **LocalStorage Persistence:** Persist your application state to `localStorage` (browser only) for seamless user experiences.
- **State Replacement:** Replace existing state values entirely with new values.
- **Asynchronous State Updates:** Update state asynchronously to handle operations like fetching data and prevent UI blocking.
<!-- * **Pub/Sub:**  A built-in publish-subscribe mechanism allows components to react to state changes efficiently. -->

## Installation

```bash
npm install @uche-exe/statey
```

## Getting Started

### 1. Import Statey:

```typescript
import { Store } from "@uche-exe/statey";
```

### 2. Create a Store:

Initialize a new store instance with your application's initial state (**initial logical Slices**):

```typescript
const store = new Store({
  initialState: {
    count: 0,
    user: { name: "Alice", loggedIn: false },
    products: [],
  },
});
```

### 3. Create Slices:

The application state is divided into logical slices (by default) for better organization. You can add new slices at any time:

```typescript
// "cart" Slice
const { cart } = store.createSlice({ name: "cart", initialState: [] });

console.log(store.state.cart); // []

// "misc" Slice
store.createSlice({ name: "misc" });
```

### 4. Access and Update State:

Use the `state` getter to access the current state and `setState` to update it:

```typescript
// Get the current count
console.log(store.state.count); // 0

const updateCount = async () => {
  // Update the "count" Slice asynchronously
  await store.setState({ slice: "count", value: 1 });
};

const updateUser = async () => {
  // Update the "user" Slice
  await store.setState({
    slice: "user",
    value: {
      ...store.state.user,
      loggedIn: true,
    },
  });
};

const updateStoreState = async () => {
  // Update the entire state
  await store.setState({
    value: {
      count: 2,
      user: { name: "Bob", loggedIn: true },
      products: [{ id: 1, name: "Laptop" }],
    },
  });
};
```

## API Documentation

### `Store` Class

- #### `constructor(props?: StoreProps)`:

  Creates a new `Store` instance.

  - `props`:
    - `storeName?`: An optional name for the store, useful for debugging. Defaults to "`appState`".
    - `initialState`: The initial state of the store, as a plain JavaScript object. Defaults to an empty object `{}`.
    - `replace?`: When set to "`true`", and a store with the specified "storeName" already exists, it will replace the existing store's state with the new "`initialState`" provided. Defaults to "`false`".

- #### `state: T` (**_getter_**):

  Returns the current state of the store. The type `T` is inferred from the `initialState` provided to the constructor.

- #### `setState(props: SetStateProps<Partial<T>>): Promise<StoreState>`:

  Asynchronously updates the state of a specific slice or the entire store.

  - `props`:
    - `slice?`: The name of the slice to update. If omitted, the entire store state is updated.
    - `value`: The new state value. This can be a partial update (`Partial<T>`) for the `slice` or the entire state.
    - `replace?`: If set to "**true**" without specifying a `slice`, it will replace the entire store's state with the new value. Defaults to "**false**".

- #### `createSlice<S extends Slice>(props: CreateSliceProps<S>): Store<StoreState & { [K in keyof S]: S[K] }>`:

  Creates a new slice within the store.

  - `props`:

    - `name`: The unique name of the slice (used to access it later).
    - `initialState?`: The initial state for this slice.

  - **Returns**: The `Store` instance, with the new `slice` added to the state.

<!-- subscribe(callback: (state: T) => void, config?: (state: T) => void): () => void:

Subscribes a callback function to be executed whenever the store's state changes.

callback: The function to be called with the updated state.
config: (Currently unused) Future support for configuration options.
Returns: A function that can be called to unsubscribe the callback. -->

## LocalStorage Persistence

**_Statey_** provides optional persistence to localStorage in browser environments. This allows your application state to be saved between sessions, providing a smoother user experience.

### How it works:

- When the store is initialized, it attempts to load the state from localStorage.
- Whenever the state is updated using setState or createSlice, the new state is saved to localStorage.

### Important notes:

- LocalStorage persistence is only available in browser environments.
- Be mindful of storing sensitive data in localStorage.
- Large amounts of data in localStorage can affect performance.

## Examples

- **Todo List:** A more complex example showing how to manage a list of todo items with slices and state updates.

```typescript
import { Store } from "@uche-exe/statey";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const store = new Store({
  initialState: {
    todos: [] as Todo[],
  },
});

const addTodo = async (text: string) => {
  const newTodo: Todo = {
    id: Date.now(),
    text,
    completed: false,
  };
  await store.setState({
    slice: "todos",
    value: [...store.state.todos, newTodo],
  });
}

// ... other functions for toggling todo completion, deleting todos, etc. ...
```

## Contributing

Contributions are welcome! If you find a bug, have a feature request, or want to improve the documentation, please feel free to open an issue or submit a pull request.
