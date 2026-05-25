# Plan chỉnh sửa UI Chat Bot Screen giống ảnh mẫu

## 1. Mục tiêu

Thiết kế lại màn hình `Mobile/src/screens/ChatScreen.js` theo phong cách trong ảnh:

- Nền sáng hồng tím rất nhẹ, nhiều khoảng trắng, cảm giác mềm và hiện đại.
- Header riêng với nút back, tiêu đề `Gemini AI Chat`, nút filter/settings bên phải.
- Segmented control `Chat` / `Agent` dạng pill lớn.
- Model selector dạng pill nổi ở giữa: `Gemini 3.1 Flash`.
- Tin nhắn bot có avatar tròn bên trái, bubble trắng bo góc lớn, shadow nhẹ.
- Quick prompts nằm sát phía trên input.
- Input bar nổi ở đáy, có icon sparkle bên trái, text input giữa, nút gửi tròn màu tím bên phải.
- Giữ nguyên logic chat/agent hiện có, chỉ tái cấu trúc UI và styles.

## 2. Công nghệ và code sẽ dùng

Project mobile hiện dùng:

- React Native `0.79.6`
- Expo `~53.0.12`
- React `19`
- `StyleSheet`, `SafeAreaView`, `KeyboardAvoidingView`, `FlatList`, `Pressable`, `TextInput`, `ActivityIndicator`
- API service hiện có ở `Mobile/src/services/aiService.js`
- Màu theme hiện có ở `Mobile/src/constants/colors.js`

Không cần thêm thư viện mới ở phase đầu. Nếu muốn gradient thật giống ảnh hơn thì cân nhắc thêm `expo-linear-gradient`, nhưng plan mặc định sẽ dùng `View`, `shadow`, màu nền và lớp phủ `rgba` để tránh phát sinh dependency.

## 3. File cần chỉnh

### Bắt buộc

- `Mobile/src/screens/ChatScreen.js`
  - Tách UI thành các component nhỏ trong cùng file hoặc chuyển sang folder component nếu muốn.
  - Chỉnh layout chính, header, mode switcher, model selector, message bubble, quick chips, input bar.
  - Giữ nguyên logic gọi API và xử lý Agent.

### Nên chỉnh thêm

- `Mobile/src/constants/colors.js`
  - Thêm token màu riêng cho chatbot nếu muốn dùng lại nhiều nơi.

Ví dụ:

```js
CHAT_BG: "#FFF7FC",
CHAT_PURPLE: "#8B3DFF",
CHAT_PURPLE_LIGHT: "#F1E5FF",
CHAT_PINK: "#FF8BDD",
CHAT_BORDER: "rgba(139, 61, 255, 0.16)",
CHAT_SHADOW: "rgba(139, 61, 255, 0.18)",
```

- `Mobile/src/navigation/AppNavigator.js`
  - Nếu muốn header giống ảnh 100%, đổi screen `Chat` thành `headerShown: false` để tự render header trong `ChatScreen`.

```js
<Stack.Screen
  name="Chat"
  component={ChatScreen}
  options={{ headerShown: false }}
/>
```

## 4. Component nên tách trong `ChatScreen.js`

### `ChatHeader`

Nhiệm vụ:

- Render nút back bên trái.
- Render title `Gemini AI Chat`.
- Render nút settings/filter bên phải.

Props:

```js
function ChatHeader({ navigation, onOpenSettings }) {}
```

Code chính:

```js
<View style={styles.header}>
  <Pressable style={styles.headerIconButton} onPress={() => navigation.goBack()}>
    <Text style={styles.headerIcon}>{"<"}</Text>
  </Pressable>

  <Text style={styles.headerTitle}>Gemini AI Chat</Text>

  <Pressable style={styles.filterButton} onPress={onOpenSettings}>
    <Text style={styles.filterIcon}>≡</Text>
  </Pressable>
</View>
```

Ghi chú: nếu không dùng icon library, dùng text symbol tạm. Nếu sau này thêm icon package thì thay bằng `ChevronLeft`, `SlidersHorizontal`.

### `ModeSegmentedControl`

Nhiệm vụ:

- Hiển thị 2 tab `Chat` và `Agent`.
- Tab active có nền trắng/hồng, border tím hồng và shadow.
- Tab inactive chữ xám tím.

Props:

```js
function ModeSegmentedControl({ activeMode, isFreePlan, onChangeMode }) {}
```

Code chính:

```js
const modes = [
  { value: "chat", label: "Chat", icon: "💬" },
  { value: "agent", label: isFreePlan ? "Agent 🔒" : "Agent", icon: "🤖" }
];
```

### `ModelSelectorPill`

Nhiệm vụ:

- Hiển thị pill giữa màn hình dưới segmented control.
- Text theo model đang active.
- Có icon sparkle bên trái và chevron xuống bên phải.

Props:

```js
function ModelSelectorPill({ label, onPress }) {}
```

Code chính:

```js
<Pressable style={styles.modelPill} onPress={onPress}>
  <View style={styles.modelIconCircle}>
    <Text style={styles.modelIcon}>✦</Text>
  </View>
  <Text style={styles.modelLabel}>{label}</Text>
  <Text style={styles.modelChevron}>⌄</Text>
</Pressable>
```

### `AssistantAvatar`

Nhiệm vụ:

- Render avatar tròn bên trái bot bubble.
- Giống ảnh: nền hồng tím nhẹ, icon robot/sparkle ở giữa.

Code chính:

```js
function AssistantAvatar() {
  return (
    <View style={styles.assistantAvatar}>
      <Text style={styles.assistantAvatarText}>🤖</Text>
    </View>
  );
}
```

### `MessageBubble`

Nhiệm vụ:

- Giữ logic cũ: user, bot, system, error, intent, undo.
- Chỉnh layout bot bubble có avatar ngoài bubble.
- User bubble căn phải màu tím hoặc hồng đậm.
- Bot bubble trắng, bo 22, shadow nhẹ.
- Time nằm dưới bubble, lệch theo bubble.

Props giữ như hiện tại:

```js
function MessageBubble({ message, onConfirm, onCancel, onUndo, isProcessing }) {}
```

Thay đổi bố cục:

```js
<View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
  {!isUser && <AssistantAvatar />}
  <View style={styles.messageColumn}>
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
      {/* Nội dung message giữ như hiện tại */}
    </View>
    <Text style={styles.timeText}>{message.time}</Text>
  </View>
</View>
```

### `QuickPromptChips`

Nhiệm vụ:

- Render title `Thử gõ nhanh các lệnh sau:`.
- Render chips nằm ngang, bo pill, shadow nhẹ.
- Chỉ hiện khi chưa có message người dùng và không loading.

Props:

```js
function QuickPromptChips({ data, onSelect }) {}
```

Data nên sửa lại cho đúng tiếng Việt:

```js
const QUICK_ACTIONS = [
  {
    label: "💰 Gợi ý tiết kiệm",
    text: "Gợi ý cách tiết kiệm dựa trên thói quen chi tiêu của tôi"
  },
  {
    label: "🧠 Tâm lý chi tiêu",
    text: "Tại sao tôi hay mua sắm bốc đồng và làm sao để kiểm soát?"
  },
  {
    label: "💬 Đang lo về tiền",
    text: "Tôi đang stress và lo lắng về tài chính, bạn có thể lắng nghe không?"
  }
];
```

### `ChatInputBar`

Nhiệm vụ:

- Input nổi ở đáy giống ảnh.
- Trái có icon sparkle.
- Giữa là `TextInput`.
- Phải là nút gửi tròn tím.
- Disabled khi input rỗng hoặc đang loading.

Props:

```js
function ChatInputBar({
  value,
  onChangeText,
  onSend,
  placeholder,
  loading
}) {}
```

Code chính:

```js
<View style={styles.inputShell}>
  <View style={styles.inputInner}>
    <View style={styles.inputSparkle}>
      <Text style={styles.inputSparkleText}>✦</Text>
    </View>

    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#A99AB2"
      value={value}
      onChangeText={onChangeText}
      editable={!loading}
      multiline
    />

    <Pressable
      style={[styles.sendCircle, (!value.trim() || loading) && styles.sendCircleDisabled]}
      onPress={onSend}
      disabled={!value.trim() || loading}
    >
      <Text style={styles.sendIcon}>➤</Text>
    </Pressable>
  </View>
</View>
```

## 5. Function hiện có cần giữ

Các function logic sau nên giữ nguyên hành vi:

- `cleanMarkdown(text)`
  - Dọn markdown trước khi render message bot.

- `getActiveParams()`
  - Xác định provider, model id, model label theo `activeMode`, `chatModel`, `agentModel`.

- `buildHistory(msgs)`
  - Lấy lịch sử hội thoại gửi lên API.

- `sendMessage(textToSend)`
  - Gửi message theo mode `chat` hoặc `agent`.
  - Giữ xử lý `pendingIntent`, loading, error.

- `executeExportAction(intent)`
  - Xử lý export/email report.

- `handleConfirmAction(intent, confirmedData)`
  - Confirm thao tác Agent.

- `handleCancelConfirmation()`
  - Hủy thao tác Agent.

- `handleUndo(operationId)`
  - Hoàn tác thao tác Agent.

- `handleModeSwitch(mode)`
  - Đổi mode và chặn Agent với FREE plan.

- `handleModelChange(model)`
  - Đổi model theo plan user.

- `getModelLabel()`
  - Lấy label model đang active để hiển thị loading/model pill.

## 6. Function nên thêm

### `getCurrentTimeLabel()`

Tránh lặp nhiều lần đoạn format time.

```js
const getCurrentTimeLabel = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
```

Sau đó thay các đoạn:

```js
time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
```

bằng:

```js
time: getCurrentTimeLabel()
```

### `getInputPlaceholder()`

Tách placeholder theo mode.

```js
const getInputPlaceholder = () => {
  if (activeMode === "agent") {
    return "Tạo/sửa/xóa dữ liệu, xuất excel...";
  }

  return "Trò chuyện, hỏi đáp tài chính...";
};
```

### `hasUserStartedChat()`

Dùng để quyết định hiển thị quick chips.

```js
const hasUserStartedChat = messages.some((message) => message.sender === "user");
```

### `handleQuickPrompt(prompt)`

Tách logic bấm chip.

```js
const handleQuickPrompt = (prompt) => {
  sendMessage(prompt.text);
};
```

### `openModelPicker()`

Phase đầu có thể dùng `Alert.alert`. Phase sau có thể đổi thành bottom sheet.

```js
const openModelPicker = () => {
  const options = activeMode === "chat"
    ? [
        { label: "Nova Lite", value: "ninerouter" },
        { label: "GPT-OSS 120B", value: "gptoss" }
      ]
    : [
        { label: "Nova Lite", value: "ninerouter" },
        { label: "Gemini 3.1 Flash", value: "gemini" }
      ];

  Alert.alert(
    "Chọn model",
    "Chọn model AI muốn sử dụng",
    [
      ...options.map((option) => ({
        text: option.label,
        onPress: () => handleModelChange(option.value)
      })),
      { text: "Hủy", style: "cancel" }
    ]
  );
};
```

### `renderMessage`

Tách render item cho `FlatList`.

```js
const renderMessage = ({ item }) => (
  <MessageBubble
    message={item}
    onConfirm={handleConfirmAction}
    onCancel={handleCancelConfirmation}
    onUndo={handleUndo}
    isProcessing={isProcessingCrud}
  />
);
```

## 7. Bố cục màn hình từ trên xuống dưới

### Root

```js
<SafeAreaView style={styles.container}>
  <KeyboardAvoidingView style={styles.keyboardView}>
    <ChatHeader />
    <ModeSegmentedControl />
    <ModelSelectorPill />
    <FlatList />
    <QuickPromptChips />
    <ChatInputBar />
  </KeyboardAvoidingView>
</SafeAreaView>
```

### Chi tiết layout

1. `container`
   - `flex: 1`
   - background màu hồng rất nhạt.
   - Có thể thêm các `View` absolute nền để tạo cảm giác glow nhẹ.

2. `ChatHeader`
   - Cao khoảng `72`.
   - Padding ngang `24`.
   - `flexDirection: "row"`.
   - Nút back rộng/cao `44`.
   - Title chiếm phần còn lại, font `26`, weight `800`.
   - Nút filter `52x52`, bo `18`, nền trắng, border tím nhạt.

3. `ModeSegmentedControl`
   - Margin ngang `24`.
   - Cao khoảng `64`.
   - Border radius `32`.
   - Border tím nhạt.
   - Mỗi tab `flex: 1`, bo `30`.
   - Active tab có shadow hồng/tím.

4. `ModelSelectorPill`
   - `alignSelf: "center"`.
   - Margin top `22`.
   - Padding ngang `24`, cao `58`.
   - Bo `29`.
   - Nền trắng hồng.
   - Shadow nhẹ.

5. `FlatList`
   - Chiếm phần giữa màn hình.
   - `contentContainerStyle` padding ngang `24`, padding top `28`, padding bottom đủ để không bị input che.
   - Bubble bot có avatar nằm bên trái.

6. `QuickPromptChips`
   - Nằm trên input.
   - Padding ngang `24`, margin bottom `16`.
   - Chip cao `52`, bo `26`.
   - Horizontal scroll.

7. `ChatInputBar`
   - Nằm cuối màn hình.
   - Padding ngang `24`, padding bottom theo safe area.
   - Shell nền trắng, bo `36`, shadow tím.
   - Input inner cao tối thiểu `68`.
   - Send button `58x58`, tròn, màu tím.

## 8. Style gợi ý

```js
const UI = {
  bg: "#FFF7FC",
  text: "#14071F",
  muted: "#91859D",
  border: "rgba(139, 61, 255, 0.16)",
  purple: "#8B3DFF",
  purpleDark: "#6D22E8",
  purpleSoft: "#F3E9FF",
  pink: "#FF8BDD",
  bubble: "#FFFFFF",
  shadow: "rgba(139, 61, 255, 0.18)"
};
```

Các style chính:

```js
container: {
  flex: 1,
  backgroundColor: UI.bg
},
header: {
  minHeight: 72,
  paddingHorizontal: 24,
  flexDirection: "row",
  alignItems: "center",
  gap: 16
},
headerTitle: {
  flex: 1,
  color: UI.text,
  fontSize: 26,
  fontWeight: "800"
},
modeContainer: {
  marginHorizontal: 24,
  height: 64,
  padding: 4,
  flexDirection: "row",
  borderRadius: 32,
  borderWidth: 1,
  borderColor: UI.border,
  backgroundColor: "rgba(255, 255, 255, 0.72)"
},
modeTab: {
  flex: 1,
  borderRadius: 28,
  alignItems: "center",
  justifyContent: "center"
},
modeTabActive: {
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "rgba(255, 139, 221, 0.6)",
  shadowColor: UI.pink,
  shadowOpacity: 0.28,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 5
},
modelPill: {
  alignSelf: "center",
  marginTop: 22,
  height: 58,
  paddingHorizontal: 24,
  borderRadius: 29,
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  backgroundColor: "rgba(255, 255, 255, 0.86)",
  borderWidth: 1,
  borderColor: UI.border,
  shadowColor: UI.purple,
  shadowOpacity: 0.12,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3
},
messageRow: {
  width: "100%",
  flexDirection: "row",
  marginBottom: 18
},
botRow: {
  alignItems: "flex-start"
},
userRow: {
  justifyContent: "flex-end"
},
assistantAvatar: {
  width: 54,
  height: 54,
  borderRadius: 27,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
  backgroundColor: UI.purpleSoft,
  borderWidth: 1,
  borderColor: "rgba(255, 139, 221, 0.45)"
},
botBubble: {
  maxWidth: "86%",
  paddingHorizontal: 20,
  paddingVertical: 18,
  borderRadius: 22,
  backgroundColor: UI.bubble,
  borderWidth: 1,
  borderColor: "rgba(20, 7, 31, 0.06)",
  shadowColor: "#000000",
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2
},
userBubble: {
  maxWidth: "82%",
  paddingHorizontal: 18,
  paddingVertical: 14,
  borderRadius: 22,
  backgroundColor: UI.purple
},
inputShell: {
  paddingHorizontal: 24,
  paddingTop: 8,
  paddingBottom: 20
},
inputInner: {
  minHeight: 76,
  padding: 10,
  flexDirection: "row",
  alignItems: "center",
  borderRadius: 38,
  backgroundColor: "rgba(255, 255, 255, 0.94)",
  borderWidth: 1,
  borderColor: UI.border,
  shadowColor: UI.purple,
  shadowOpacity: 0.2,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 6
},
sendCircle: {
  width: 58,
  height: 58,
  borderRadius: 29,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: UI.purple
}
```

## 9. Luồng triển khai đề xuất

### Phase 1: Làm giống layout ảnh

- Ẩn native header của màn `Chat`.
- Thêm `ChatHeader`.
- Đổi `modeContainer` thành segmented pill lớn.
- Đổi model selector thành 1 pill ở giữa thay vì 2 button ngang.
- Chỉnh `FlatList` padding và bubble bot/user.
- Đổi input thành input shell nổi ở đáy.

### Phase 2: Dọn component và function

- Tách `ChatHeader`, `ModeSegmentedControl`, `ModelSelectorPill`, `QuickPromptChips`, `ChatInputBar`.
- Thêm `getCurrentTimeLabel`, `getInputPlaceholder`, `handleQuickPrompt`, `openModelPicker`, `renderMessage`.
- Sửa text bị lỗi encoding trong `SUGGESTED_PROMPTS`, `QUICK_ACTIONS`, welcome message, alert text.

### Phase 3: Tối ưu trải nghiệm

- Thêm bottom sheet chọn model thay cho `Alert.alert`.
- Thêm animation nhẹ khi đổi mode.
- Thêm typing bubble mềm hơn thay vì loading text dài.
- Test trên Android/iOS với bàn phím mở.

## 10. Checklist kiểm thử

- Mở màn Chat không còn native header chồng lên custom header.
- Back button hoạt động.
- Tab `Chat`/`Agent` đổi mode đúng.
- User FREE bị chặn khi mở Agent như logic cũ.
- Model pill hiển thị đúng label theo mode và plan.
- Gửi message chat thường vẫn gọi `sendAiChat`.
- Agent vẫn gọi `parseAiIntent` và hiện `AIConfirmationForm`.
- Confirm/cancel/undo Agent vẫn hoạt động.
- Quick chips chỉ hiện khi chưa có message user.
- Input không bị bàn phím che trên Android và iOS.
- Text dài trong bubble không tràn màn.
- Loading state không làm layout bị nhảy.

## 11. Rủi ro cần chú ý

- File hiện có nhiều text tiếng Việt bị lỗi encoding. Khi chỉnh UI nên sửa luôn sang UTF-8 để tránh hiển thị sai.
- Nếu dùng shadow nhiều, Android cần `elevation`; iOS cần `shadowColor`, `shadowOpacity`, `shadowRadius`, `shadowOffset`.
- Nếu thêm `expo-linear-gradient`, cần cài dependency và test lại build. Phase đầu không bắt buộc.
- Nếu ẩn native header, phải đảm bảo `ChatHeader` tự xử lý safe area và back navigation.

