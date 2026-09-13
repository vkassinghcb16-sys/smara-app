import { useState } from 'react';
import { AppProvider, useApp } from './store/AppStore';
import { BottomNav } from './components/BottomNav';
import type { Tab } from './components/BottomNav';
import { Fab } from './components/Fab';
import { QuickAddSheet } from './components/QuickAddSheet';
import { ItemEditSheet } from './components/ItemEditSheet';
import { ImHereChooserSheet, ImHereView } from './components/ImHere';
import { AspirationEditSheet } from './components/AspirationEditSheet';
import { Toast } from './components/Toast';
import { BuyPage } from './pages/BuyPage';
import { SomedayPage } from './pages/SomedayPage';
import { AspirationsPage } from './pages/AspirationsPage';
import { HistoryPage } from './pages/HistoryPage';
import { LOCATION_META } from './types';
import type { Aspiration, BuyLocation, Item } from './types';

interface ToastState {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

function buildAddedMessage(info: { name: string; category: string | null; locations: BuyLocation[] }): string {
  if (!info.category && info.locations.length === 0) {
    return `Added "${info.name}" — no category yet, that's okay.`;
  }
  const bits: string[] = [];
  if (info.category) bits.push(info.category);
  if (info.locations.length > 0) bits.push(info.locations.map((l) => LOCATION_META[l].emoji + ' ' + LOCATION_META[l].short).join(' + '));
  return `Added "${info.name}" → ${bits.join(' · ')}`;
}

function Shell() {
  const { state } = useApp();
  const [tab, setTab] = useState<Tab>('buy');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [hereChooserOpen, setHereChooserOpen] = useState(false);
  const [hereLocation, setHereLocation] = useState<BuyLocation | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [aspirationSheet, setAspirationSheet] = useState<'closed' | 'new' | Aspiration>('closed');
  const [toast, setToast] = useState<ToastState | null>(null);

  // Keep the edit sheet's data fresh if the underlying item changes elsewhere.
  const liveEditingItem = editingItem ? state.items.find((i) => i.id === editingItem.id) ?? null : null;

  const openQuickAdd = () => setQuickAddOpen(true);
  const openAspirationAdd = () => setAspirationSheet('new');

  return (
    <div className="app-shell">
      <main className="app-main">
        {tab === 'buy' && (
          <BuyPage onOpenItem={setEditingItem} onImHere={() => setHereChooserOpen(true)} onAdd={openQuickAdd} />
        )}
        {tab === 'someday' && <SomedayPage onOpenItem={setEditingItem} onAdd={openQuickAdd} />}
        {tab === 'aspirations' && (
          <AspirationsPage onEdit={(a) => setAspirationSheet(a)} onAdd={openAspirationAdd} />
        )}
        {tab === 'history' && <HistoryPage />}
      </main>

      <Fab
        label={tab === 'aspirations' ? 'Add aspiration' : 'Add item'}
        onClick={tab === 'aspirations' ? openAspirationAdd : openQuickAdd}
      />
      <BottomNav active={tab} onChange={setTab} />

      {quickAddOpen && (
        <QuickAddSheet
          onClose={() => setQuickAddOpen(false)}
          onAdded={(info) => {
            setToast({
              message: buildAddedMessage(info),
              actionLabel: 'Edit',
              onAction: () => {
                const item = state.items.find((i) => i.id === info.id);
                if (item) setEditingItem(item);
                setToast(null);
              },
            });
          }}
        />
      )}

      {liveEditingItem && <ItemEditSheet item={liveEditingItem} onClose={() => setEditingItem(null)} />}

      {hereChooserOpen && (
        <ImHereChooserSheet
          onClose={() => setHereChooserOpen(false)}
          onChoose={(loc) => {
            setHereChooserOpen(false);
            setHereLocation(loc);
          }}
        />
      )}

      {hereLocation && (
        <ImHereView location={hereLocation} onClose={() => setHereLocation(null)} onEdit={setEditingItem} />
      )}

      {aspirationSheet !== 'closed' && (
        <AspirationEditSheet
          aspiration={
            aspirationSheet === 'new' ? null : state.aspirations.find((a) => a.id === aspirationSheet.id) ?? null
          }
          onClose={() => setAspirationSheet('closed')}
        />
      )}

      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
