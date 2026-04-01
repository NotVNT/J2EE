import React from "react";
import DevbotLoader from "./DevbotLoader";

export default function LoadingScreen({ text = "Đang tải..." }) {
  return <DevbotLoader text={text} fullScreen />;
}
