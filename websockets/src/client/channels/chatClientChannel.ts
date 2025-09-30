import { ClientChannel } from "modelence/client";
import { ChatMessage } from "@/shared/types/chatMessage";
import { useChatStore } from "@/client/stores/chatStore";

const chatClientChannel = new ClientChannel<ChatMessage>("chat", async (data) => {
  console.log("Got some data", data);
  useChatStore.getState().addMessage(data);
});

chatClientChannel.joinRoom("default");

export default chatClientChannel;
