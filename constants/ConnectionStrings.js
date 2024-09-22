import Constants from "expo-constants";

const expoHostUri = Constants.expoConfig?.hostUri?.split(":")[0];
export const EJABBBERD_URI = `ws://143.110.244.168:5443/ws`;
export const BACKEND_URI = `http://${expoHostUri}:3000`;
