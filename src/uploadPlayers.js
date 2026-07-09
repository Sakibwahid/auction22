import Papa from "papaparse";
import { db } from "./lib/firebase/config";
import { doc, writeBatch } from "firebase/firestore";

export async function uploadPlayersToFirestore() {
  console.log("Reading CSV...");

 Papa.parse("/updated.csv",  {
    download: true,
    header: true,
    skipEmptyLines: true,

    complete: async ({ data }) => {
      try {
        console.log(`Found ${data.length} players`);

        let batch = writeBatch(db);
        let count = 0;
        let uploaded = 0;

        for (const player of data) {
          // Skip invalid rows
          if (!player.ID) continue;

          const playerData = {};

          // Remove empty values
          Object.keys(player).forEach((key) => {
            const value = player[key];

            if (value === "") {
              playerData[key] = null;
            } else if (!isNaN(value) && value !== "") {
              playerData[key] = Number(value);
            } else {
              playerData[key] = value;
            }
          });

          const docRef = doc(db, "players", String(player.ID));

          batch.set(docRef, playerData);

          count++;
          uploaded++;

          // Firestore max batch = 500
          if (count === 500) {
            await batch.commit();
            console.log(`${uploaded} players uploaded...`);

            batch = writeBatch(db);
            count = 0;
          }
        }

        if (count > 0) {
          await batch.commit();
        }

        console.log("================================");
        console.log("✅ Upload Complete");
        console.log(`Total Uploaded: ${uploaded}`);
        console.log("================================");
      } catch (err) {
        console.error(err);
      }
    },

    error(err) {
      console.error("CSV Error:", err);
    },
  });
}