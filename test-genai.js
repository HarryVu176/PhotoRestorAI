// Test file to check @google/genai API
import { GoogleGenAI } from "@google/genai";

console.log("Available methods in GoogleGenAI:", Object.getOwnPropertyNames(GoogleGenAI.prototype));

const genai = new GoogleGenAI("test-key");
console.log("Available methods in genai instance:", Object.getOwnPropertyNames(genai));
console.log("genai object:", genai);
