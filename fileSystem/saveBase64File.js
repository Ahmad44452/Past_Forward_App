import * as FileSystem from "expo-file-system";
import { randomUUID } from "expo-crypto";

export const saveBase64File = async (base64Data, fileExtension) => {
  try {
    console.log("storing file");
    const randomFileName = `${randomUUID}.${fileExtension}`;

    const filePath = `${FileSystem.documentDirectory}${randomFileName}`;

    // Write the base64 data to the file

    await FileSystem.writeAsStringAsync(filePath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log("Returning path ", filePath);
    return filePath;
  } catch (error) {
    console.error("Error saving file:", error);
    throw error;
  }
};

// Usage example

// const saveAndGetUri = async () => {
//   const base64Data = "your_base64_string_here";

//   const fileExtension = "png"; // Adjust the extension as needed

//   try {
//     const fileUri = await saveBase64File(base64Data, fileExtension);

//     console.log("File saved at:", fileUri);

//     // You can now use this fileUri to access the file
//   } catch (error) {
//     console.error("Failed to save file:", error);
//   }
// };
