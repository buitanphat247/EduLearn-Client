# SocialContext Split Strategy

## 📋 Tổng quan

**File:** `app/social/SocialContext.tsx`  
**Size:** ~1200 lines  
**Status:** ⚠️ **TOO LARGE** - Cần split thành nhiều contexts nhỏ hơn

## 🎯 Mục tiêu

1. **Giảm re-renders**: Component chỉ re-render khi state liên quan thay đổi
2. **Code organization**: Dễ maintain và test hơn
3. **Performance**: Tối ưu memory và render performance

## 📦 Proposed Context Split

### 1. **SocialDataContext** (Read-only data)
- `currentUser`
- `contacts`
- `friendRequests`
- `receivedFriendRequests`
- `conversations`
- `messages`
- `blockedUsers`
- `blockedUserIds`
- `blockedByUserIds`
- `lastReadMessageIds`

### 2. **SocialActionsContext** (Actions/Functions)
- `fetchContacts`
- `fetchConversations`
- `fetchFriendRequests`
- `loadMessages`
- `sendMessage`
- `startChat`
- `markConversationAsRead`
- `deleteConversation`
- `blockUser`
- `unblockUser`

### 3. **SocialUIContext** (UI State)
- `activeConversationId`
- `isSettingsOpen`
- `setIsSettingsOpen`
- `isProfileOpen`
- `setIsProfileOpen`
- `isAddFriendOpen`
- `setIsAddFriendOpen`
- `loadingMessages`
- `loadingConversations`
- `groupCount`

### 4. **SocialStateContext** (State setters - nếu cần)
- `setContacts`
- `setFriendRequests`
- `setActiveConversationId`

## 🔧 Implementation Strategy

### Option 1: Multiple Contexts (Recommended)

```typescript
// app/context/social/SocialDataContext.tsx
export const SocialDataContext = createContext<SocialDataContextType | undefined>(undefined);

// app/context/social/SocialActionsContext.tsx
export const SocialActionsContext = createContext<SocialActionsContextType | undefined>(undefined);

// app/context/social/SocialUIContext.tsx
export const SocialUIContext = createContext<SocialUIContextType | undefined>(undefined);

// app/context/social/SocialProvider.tsx
export function SocialProvider({ children }: { children: React.ReactNode }) {
  // ... state management
  
  return (
    <SocialDataContext.Provider value={dataValue}>
      <SocialActionsContext.Provider value={actionsValue}>
        <SocialUIContext.Provider value={uiValue}>
          {children}
        </SocialUIContext.Provider>
      </SocialActionsContext.Provider>
    </SocialDataContext.Provider>
  );
}
```

### Option 2: Context Selectors (Alternative)

```typescript
// Use selectors để chỉ subscribe phần cần thiết
export function useSocialData() {
  const context = useContext(SocialContext);
  return useMemo(() => ({
    currentUser: context.currentUser,
    contacts: context.contacts,
    // ... only data
  }), [context.currentUser, context.contacts, /* ... */]);
}

export function useSocialActions() {
  const context = useContext(SocialContext);
  return useMemo(() => ({
    fetchContacts: context.fetchContacts,
    sendMessage: context.sendMessage,
    // ... only actions
  }), [context.fetchContacts, context.sendMessage, /* ... */]);
}
```

## 📊 Benefits

### Before Split
- ❌ Component re-render khi bất kỳ state nào thay đổi
- ❌ Context value quá lớn (30+ properties)
- ❌ Khó maintain (1200 lines)

### After Split
- ✅ Component chỉ re-render khi state liên quan thay đổi
- ✅ Context values nhỏ hơn, dễ optimize
- ✅ Dễ maintain và test từng context riêng biệt

## 🚀 Migration Steps

1. **Phase 1: Create new contexts**
   - Tạo `SocialDataContext`
   - Tạo `SocialActionsContext`
   - Tạo `SocialUIContext`

2. **Phase 2: Migrate state**
   - Move state vào contexts tương ứng
   - Update providers

3. **Phase 3: Update consumers**
   - Update components sử dụng `useSocial()` hook
   - Sử dụng hooks riêng: `useSocialData()`, `useSocialActions()`, `useSocialUI()`

4. **Phase 4: Remove old context**
   - Xóa `SocialContext.tsx` cũ
   - Cleanup imports

## ⚠️ Considerations

1. **Breaking Changes**: Cần update tất cả components sử dụng SocialContext
2. **Testing**: Cần test lại tất cả social features
3. **Performance**: Monitor re-render counts sau khi split
4. **Gradual Migration**: Có thể migrate từng phần để tránh breaking changes lớn

## 📝 Example Usage

### Before
```typescript
const { currentUser, sendMessage, isSettingsOpen } = useSocial();
// Re-renders khi bất kỳ state nào thay đổi
```

### After
```typescript
const currentUser = useSocialData().currentUser;
const sendMessage = useSocialActions().sendMessage;
const isSettingsOpen = useSocialUI().isSettingsOpen;
// Chỉ re-render khi state liên quan thay đổi
```
