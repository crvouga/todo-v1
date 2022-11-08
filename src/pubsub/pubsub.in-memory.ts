import { v4 } from "uuid";
import type { AppEvent, PubSub } from "./pubsub";

const subscribers = new Map<string, (event: AppEvent) => void>();

const pubsub: PubSub = {
  pub: (event) => {
    for (const subscriber of subscribers.values()) {
      subscriber(event);
    }
  },
  sub: (subscriber) => {
    const id = v4();
    subscribers.set(id, subscriber);
    return () => {
      subscribers.delete(id);
    };
  },
};

export default pubsub;
