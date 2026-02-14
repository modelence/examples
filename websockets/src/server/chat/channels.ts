import { ServerChannel } from "modelence/server";
import { ChatMessage } from "@/shared/types/chatMessage";

export const chatServerChannel = new ServerChannel<ChatMessage>("chat");
