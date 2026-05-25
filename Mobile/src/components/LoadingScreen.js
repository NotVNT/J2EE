import React from "react";
import Loader from "./Loader";

export default function LoadingScreen({ text = "Đang tải..." }) {
  return <Loader text={text} fullScreen />;
}