import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { AppState, Aspiration, BuyLocation, Item } from '../types';
import { loadState, saveState } from '../lib/storage';
import { buildSampleState } from '../lib/sampleData';
import { inferItem, learnFromCorrection } from '../lib/inference';
import { makeId } from '../lib/id';

type Action =
  | { type: 'ADD_ITEM'; item: Item }
  | { type: 'UPDATE_ITEM'; id: string; patch: Partial<Item> }
  | { type: 'DELETE_ITEM'; id: string }
  | { type: 'ADD_ASPIRATION'; aspiration: Aspiration }
  | { type: 'UPDATE_ASPIRATION'; id: string; patch: Partial<Aspiration> }
  | { type: 'DELETE_ASPIRATION'; id: string }
  | { type: 'LEARN'; corrections: AppState['corrections'] };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, items: [action.item, ...state.items] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((it) => (it.id === action.id ? { ...it, ...action.patch } : it)),
      };
    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter((it) => it.id !== action.id) };
    case 'ADD_ASPIRATION':
      return { ...state, aspirations: [action.aspiration, ...state.aspirations] };
    case 'UPDATE_ASPIRATION':
      return {
        ...state,
        aspirations: state.aspirations.map((a) => (a.id === action.id ? { ...a, ...action.patch } : a)),
      };
    case 'DELETE_ASPIRATION':
      return { ...state, aspirations: state.aspirations.filter((a) => a.id !== action.id) };
    case 'LEARN':
      return { ...state, corrections: action.corrections };
    default:
      return state;
  }
}

function initState(): AppState {
  return loadState() ?? buildSampleState();
}

interface Ctx {
  state: AppState;
  addItem: (name: string) => { id: string; category: string | null; locations: BuyLocation[] };
  editItem: (id: string, patch: Partial<Item>, opts?: { learn?: boolean }) => void;
  deleteItem: (id: string) => void;
  markBought: (id: string, from?: BuyLocation) => void;
  unmarkBought: (id: string) => void;
  moveToSomeday: (id: string) => void;
  moveToBuy: (id: string) => void;
  addAspiration: (a: Omit<Aspiration, 'id' | 'createdAt'>) => void;
  editAspiration: (id: string, patch: Partial<Aspiration>) => void;
  deleteAspiration: (id: string) => void;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addItem = useCallback<Ctx['addItem']>(
    (name) => {
      const trimmed = name.trim();
      const guess = inferItem(trimmed, state.corrections);
      const newItem: Item = {
        id: makeId(),
        name: trimmed,
        category: guess.category,
        locations: guess.locations,
        status: 'buy',
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_ITEM', item: newItem });
      return { id: newItem.id, category: newItem.category, locations: newItem.locations };
    },
    [state.corrections],
  );

  const editItem = useCallback<Ctx['editItem']>(
    (id, patch, opts) => {
      const current = state.items.find((it) => it.id === id);
      if (opts?.learn && current) {
        const next = learnFromCorrection(
          current.name,
          state.corrections,
          {
            category: patch.category !== undefined ? patch.category : current.category,
            locations: patch.locations !== undefined ? patch.locations : current.locations,
          },
          { category: current.category, locations: current.locations },
        );
        dispatch({ type: 'LEARN', corrections: next });
      }
      dispatch({ type: 'UPDATE_ITEM', id, patch });
    },
    [state.items, state.corrections],
  );

  const deleteItem = useCallback((id: string) => dispatch({ type: 'DELETE_ITEM', id }), []);

  const markBought = useCallback(
    (id: string, from?: BuyLocation) => {
      dispatch({
        type: 'UPDATE_ITEM',
        id,
        patch: { status: 'bought', purchasedAt: new Date().toISOString(), purchasedFrom: from },
      });
    },
    [],
  );

  const unmarkBought = useCallback((id: string) => {
    dispatch({ type: 'UPDATE_ITEM', id, patch: { status: 'buy', purchasedAt: undefined, purchasedFrom: undefined } });
  }, []);

  const moveToSomeday = useCallback((id: string) => {
    dispatch({ type: 'UPDATE_ITEM', id, patch: { status: 'someday' } });
  }, []);

  const moveToBuy = useCallback((id: string) => {
    dispatch({ type: 'UPDATE_ITEM', id, patch: { status: 'buy' } });
  }, []);

  const addAspiration = useCallback<Ctx['addAspiration']>((a) => {
    dispatch({ type: 'ADD_ASPIRATION', aspiration: { ...a, id: makeId(), createdAt: new Date().toISOString() } });
  }, []);

  const editAspiration = useCallback<Ctx['editAspiration']>((id, patch) => {
    dispatch({ type: 'UPDATE_ASPIRATION', id, patch });
  }, []);

  const deleteAspiration = useCallback((id: string) => dispatch({ type: 'DELETE_ASPIRATION', id }), []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      addItem,
      editItem,
      deleteItem,
      markBought,
      unmarkBought,
      moveToSomeday,
      moveToBuy,
      addAspiration,
      editAspiration,
      deleteAspiration,
    }),
    [state, addItem, editItem, deleteItem, markBought, unmarkBought, moveToSomeday, moveToBuy, addAspiration, editAspiration, deleteAspiration],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
