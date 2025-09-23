import { ClientRoom } from "modelence/client";
import { ChatMessage } from "@/shared/types/chatMessage";
import { useChatStore } from "@/client/stores/chatStore";

const chatClientRoom = new ClientRoom<ChatMessage>("chat", async (data) => {
  console.log("Got some data", data);
  useChatStore.getState().addMessage(data);
});

export default chatClientRoom;
