import { NextApiRequest, NextApiResponse } from "next";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "langchain/prompts";
import {
  CacheClient,
  Configurations,
  CredentialProvider,
} from "@gomomento/sdk";
import { MomentoChatMessageHistory } from "langchain/stores/message/momento";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const chat = new ChatOpenAI({
    streaming: false,
    callbacks: [
      {
        handleLLMNewToken(token: string) {
          process.stdout.write(token);
        },
      },
    ],
  });

  // See https://github.com/momentohq/client-sdk-javascript for connection options
  const client = new CacheClient({
    configuration: Configurations.Laptop.v1(),
    credentialProvider: CredentialProvider.fromEnvironmentVariable({
      environmentVariableName: "MOMENTO_AUTH_TOKEN",
    }),
    defaultTtlSeconds: 60 * 60 * 24,
  });

  // Create a unique session ID
  const sessionId = new Date().toISOString();
  const cacheName = "langchain";

  const memory = new BufferMemory({
    chatHistory: await MomentoChatMessageHistory.fromProps({
      client,
      cacheName,
      sessionId,
      sessionTtl: 300,
    }),
  });
  console.log(
    `cacheName=${cacheName} and sessionId=${sessionId} . This will be used to store the chat history. You can inspect the values at your Momento console at https://console.gomomento.com.`
  );

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      `The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.`
    ),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);

  const chain = new ConversationChain({
    memory: memory,
    prompt: chatPrompt,
    llm: chat,
  });

  if (req.method === "POST") {
    try {
      // const response = await chat.call([
      //   new SystemChatMessage(
      //     "You are a helpful assistant that translates English to French."
      //   ),
      //   new HumanChatMessage(message),
      // ]);

      const message = req.body.message;

      // const response = await chain.call({
      //   input: message,
      // });
      const responseH = await chain.call({
        input: "hi from London, how are you doing today",
      });

      console.log(responseH);

      const responseI = await chain.call({
        input: "Do you know where I am?",
      });

      console.log(responseI);

      // console.log(response.response);
      // res.status(200).json({ message: response.response });
    } catch (error) {
      console.error("Error during chat.call:", error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).end(); // Method not allowed
  }
}
