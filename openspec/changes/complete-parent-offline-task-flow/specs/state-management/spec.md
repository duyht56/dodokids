## REMOVED Requirements

### Requirement: authStore offlineTask field
**Reason**: A single persisted mobile task record conflicts with the server's per-lesson `offlineTasks` map and causes Dashboard/list drift.

**Migration**: Remove `offlineTask`, `setOfflineTask`, their TypeScript interface, and their persisted AsyncStorage slice. Same-device unlock continues to use the existing persisted `progress.completedLessons`; task completion itself is refreshed from the Parent API.
