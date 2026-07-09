import { useEffect } from "react";
import { uploadPlayersToFirestore } from "../uploadPlayers";

export default function Upload() {
  useEffect(() => {
    uploadPlayersToFirestore();
  }, []);

  return <h1>Uploading players...</h1>;
}