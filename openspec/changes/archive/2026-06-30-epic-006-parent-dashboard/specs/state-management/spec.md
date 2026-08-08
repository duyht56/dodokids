## MODIFIED Requirements

### Requirement: Auth Store Shape
The `authStore` state shape SHALL include an `offlineTask` field alongside the existing `progress`, `child`, `parentUnlocked`, and `isOnboarded` fields.

Updated shape (additions only):
```typescript
offlineTask: {
  taskId: string | null;
  status: 'pending' | 'done' | 'skipped';
  completedAt: string | null;  // ISO 8601
} | null;
```

Default value: `offlineTask: null`.

`offlineTask` SHALL be persisted to AsyncStorage (included in `partialize`).

#### Scenario: Initial store state
- **WHEN** the app is launched fresh with no AsyncStorage data
- **THEN** `authStore.offlineTask` is `null`

#### Scenario: Hydration from storage
- **WHEN** the app restarts and AsyncStorage contains a serialized `offlineTask`
- **THEN** `authStore.offlineTask` is populated with the stored value on first render

## ADDED Requirements

### Requirement: setOfflineTask Action
The `authStore` SHALL expose a `setOfflineTask(task: AuthStore['offlineTask']) => void` action that replaces the `offlineTask` field atomically.

#### Scenario: Optimistic update on done
- **WHEN** the user taps "✅ Đã làm" and `setOfflineTask({ taskId, status: 'done', completedAt: new Date().toISOString() })` is called
- **THEN** `authStore.offlineTask.status` immediately reflects `'done'` before the BE `PATCH` resolves
