import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  ScrollView,
  type ScrollViewInstance,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppState } from "@/context/app-state";
import { useNavVisibility } from "@/context/nav-visibility";
import { analyzeInterests, INTEREST_SUGGESTIONS } from "@/lib/match";

const SIZE = 58;
const MARGIN = 12;
/** Movement below this (px) counts as a tap, not a drag. */
const TAP_SLOP = 6;

type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
  links?: { label: string; route: string }[];
};

const GREETING: Message = {
  id: 0,
  from: "bot",
  text: "Hi! I'm IskolarNa. Tell me what you enjoy (hobbies, strengths, the work you imagine doing) and I'll suggest courses.",
};

/**
 * Draggable chatbot bubble (replaces the old "Match" tab). Drag it anywhere; it snaps to the
 * nearest side on release. Tap to open the chat. It reuses the Course Match analyzer.
 */
export function FloatingChatbot() {
  const { setProfile } = useAppState();
  const { barHeight } = useNavVisibility();
  const [area, setArea] = useState({ w: 0, h: 0 });
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const scroller = useRef<ScrollViewInstance>(null);
  const nextId = useRef(1);

  const pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const placed = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const areaRef = useRef(area);
  areaRef.current = area;
  const barRef = useRef(barHeight);
  barRef.current = barHeight;

  const clamp = (x: number, y: number) => {
    const { w, h } = areaRef.current;
    return {
      x: Math.min(Math.max(x, MARGIN), Math.max(MARGIN, w - SIZE - MARGIN)),
      y: Math.min(Math.max(y, MARGIN), Math.max(MARGIN, h - SIZE - MARGIN)),
    };
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          pos.stopAnimation((v) => {
            start.current = { x: v.x, y: v.y };
          });
        },
        onPanResponderMove: (_, g) => {
          pos.setValue({
            x: start.current.x + g.dx,
            y: start.current.y + g.dy,
          });
        },
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) < TAP_SLOP && Math.abs(g.dy) < TAP_SLOP) {
            setOpen(true);
            return;
          }
          const c = clamp(start.current.x + g.dx, start.current.y + g.dy);
          // Snap to the closest left/right edge; keep the chosen height.
          const x =
            c.x + SIZE / 2 < areaRef.current.w / 2
              ? MARGIN
              : areaRef.current.w - SIZE - MARGIN;
          Animated.spring(pos, {
            toValue: { x, y: c.y },
            useNativeDriver: false,
            friction: 7,
          }).start();
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pos],
  );

  const send = (raw: string) => {
    const msg = raw.trim();
    if (msg.length < 2) return;
    const result = analyzeInterests(msg);
    const user: Message = { id: nextId.current++, from: "user", text: msg };
    let bot: Message;
    if (!result) {
      bot = {
        id: nextId.current++,
        from: "bot",
        text: "Tell me a bit more. Mention things you enjoy, like building, helping people, numbers, art, or leading a team.",
      };
    } else {
      setProfile(result.profile);
      const lines = result.courses
        .slice(0, 3)
        .map((m, i) => `${i + 1}. ${m.course.name} (${m.percent}% match)`);
      bot = {
        id: nextId.current++,
        from: "bot",
        text: `Here are your top matches:\n${lines.join("\n")}\n\nYour interest profile has been updated.`,
        links: [
          { label: "View profile", route: "/profile" },
          { label: "Scholarships", route: "/scholarships" },
        ],
      };
    }
    setMessages((m) => [...m, user, bot]);
    setText("");
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 50);
  };

  const onLayout = (w: number, h: number) => {
    setArea({ w, h });
    if (!placed.current && w > 0) {
      placed.current = true;
      // Start bottom-right, just above the bottom bar.
      pos.setValue({ x: w - SIZE - MARGIN, y: h - SIZE - barRef.current - 24 });
    }
  };

  return (
    <View
      pointerEvents="box-none"
      onLayout={(e) =>
        onLayout(e.nativeEvent.layout.width, e.nativeEvent.layout.height)
      }
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {!open && area.w > 0 && (
        <Animated.View
          {...pan.panHandlers}
          accessibilityRole="button"
          accessibilityLabel="Open IskolarNa chatbot. Drag to move."
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            backgroundColor: "#2563EB",
            justifyContent: "center",
            alignItems: "center",
            transform: pos.getTranslateTransform(),
            shadowColor: "#1E3A8A",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          <MaterialCommunityIcons
            name="robot-happy-outline"
            size={30}
            color="#FFFFFF"
          />
        </Animated.View>
      )}

      {open && (
        <KeyboardAvoidingView
          pointerEvents="box-none"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              marginHorizontal: 12,
              marginBottom: barHeight + 12,
              height: Math.min(460, Math.max(280, area.h - barHeight - 60)),
              backgroundColor: "#FFFFFF",
              borderRadius: 22,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              overflow: "hidden",
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.18,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                backgroundColor: "#2563EB",
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800" }}
                >
                  IskolarNa Assistant
                </Text>
                <Text style={{ color: "#DBEAFE", fontSize: 11 }}>
                  Course match chat
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                hitSlop={10}
                accessibilityLabel="Close chat"
              >
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scroller}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 14, gap: 10 }}
              onContentSizeChange={() =>
                scroller.current?.scrollToEnd({ animated: true })
              }
              style={{ flex: 1, backgroundColor: "#F8FAFF" }}
            >
              {messages.map((m) => (
                <View
                  key={m.id}
                  style={{
                    alignItems: m.from === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <View
                    style={{
                      maxWidth: "85%",
                      paddingHorizontal: 12,
                      paddingVertical: 9,
                      borderRadius: 16,
                      backgroundColor:
                        m.from === "user" ? "#2563EB" : "#FFFFFF",
                      borderWidth: m.from === "user" ? 0 : 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        lineHeight: 19,
                        color: m.from === "user" ? "#FFFFFF" : "#0F172A",
                      }}
                    >
                      {m.text}
                    </Text>
                  </View>
                  {m.links && (
                    <View
                      style={{ flexDirection: "row", gap: 8, marginTop: 6 }}
                    >
                      {m.links.map((l) => (
                        <TouchableOpacity
                          key={l.route}
                          onPress={() => {
                            setOpen(false);
                            router.push(l.route as never);
                          }}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: "#BFDBFE",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "700",
                              color: "#2563EB",
                            }}
                          >
                            {l.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
              {messages.length === 1 && (
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {INTEREST_SUGGESTIONS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => send(s)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 16,
                        backgroundColor: "#EFF6FF",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color: "#2563EB",
                        }}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                padding: 10,
                borderTopWidth: 1,
                borderTopColor: "#E2E8F0",
                backgroundColor: "#FFFFFF",
              }}
            >
              <TextInput
                value={text}
                onChangeText={setText}
                onSubmitEditing={() => send(text)}
                returnKeyType="send"
                placeholder="Describe your interests..."
                placeholderTextColor="#94A3B8"
                style={{
                  flex: 1,
                  height: 42,
                  borderRadius: 21,
                  paddingHorizontal: 14,
                  fontSize: 14,
                  color: "#0F172A",
                  backgroundColor: "#F1F5F9",
                }}
              />
              <TouchableOpacity
                onPress={() => send(text)}
                disabled={text.trim().length < 2}
                accessibilityLabel="Send"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor:
                    text.trim().length < 2 ? "#BFDBFE" : "#2563EB",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}