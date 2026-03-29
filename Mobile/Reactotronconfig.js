import { NativeModules, Platform } from "react-native";

const createNoopTron = () => ({
  log: () => {},
  warn: () => {},
  error: () => {},
  display: () => {}
});

const getHost = () => {
  if (Platform.OS === "android") {
    const scriptURL = NativeModules.SourceCode?.scriptURL || "";
    const match = scriptURL.match(/\/\/([^:]+):\d+/);

    if (match?.[1]) {
      return match[1];
    }

    return "10.0.2.2";
  }

  return "localhost";
};

const loadReactotron = () => {
  try {
    const dynamicRequire = eval("require");
    const moduleValue = dynamicRequire("reactotron-react-native");
    return moduleValue?.default || moduleValue;
  } catch {
    return null;
  }
};

const Reactotron = loadReactotron();

if (Reactotron) {
  Reactotron.configure({
    name: "MoneyManager",
    host: getHost()
  })
    .useReactNative()
    .connect();

  console.tron = Reactotron;
} else {
  console.tron = createNoopTron();
  console.log("Reactotron disabled: package not installed.");
}

export default Reactotron || console.tron;
