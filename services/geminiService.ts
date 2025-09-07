/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Helper function to convert a File object to a Gemini API Part
const fileToPart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string; } }> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    
    const mimeType = mimeMatch[1];
    const data = arr[1];
    return { inlineData: { mimeType, data } };
};

const handleApiResponse = (
    response: GenerateContentResponse,
    context: string // e.g., "edit", "filter", "adjustment"
): string => {
    // 1. Check for prompt blocking first
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }

    // 2. Try to find the image part
    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        console.log(`Received image data (${mimeType}) for ${context}`);
        return `data:${mimeType};base64,${data}`;
    }

    // 3. If no image, check for other reasons
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Image generation for ${context} stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }
    
    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image for the ${context}. ` + 
        (textFeedback 
            ? `The model responded with text: "${textFeedback}"`
            : "This can happen due to safety filters or if the request is too complex. Please try rephrasing your prompt to be more direct.");

    console.error(`Model response did not contain an image part for ${context}.`, { response });
    throw new Error(errorMessage);
};

/**
 * Generates an edited image using generative AI based on a text prompt and a specific point.
 * @param originalImage The original image file.
 * @param userPrompt The text prompt describing the desired edit.
 * @param hotspot The {x, y} coordinates on the image to focus the edit.
 * @returns A promise that resolves to the data URL of the edited image.
 */
export const generateImageEdit = async (
    originalImage: File,
    userPrompt: string,
    hotspot?: { x: number, y: number } | any
): Promise<string> => {
    console.log('Starting generative edit at:', hotspot);
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    
    let prompt = '';
    
    // Check if this is a magic restoration with custom options
    if (typeof hotspot === 'object' && hotspot && !('x' in hotspot && 'y' in hotspot)) {
        // This is magic restoration with custom options
        prompt = `You are a world-class AI photo restoration expert. Your task is to perform a comprehensive, professional-grade restoration on the provided image. The goal is to produce a result that is crystal-clear, vibrant, and looks as if it were taken with a modern high-quality camera.

COMPREHENSIVE RESTORATION GUIDELINES:
- Perform a COMPLETE restoration across the ENTIRE image, not just localized edits.
- Enhance overall image quality, clarity, contrast, and sharpness throughout, while maintaining a natural look (no over-sharpening or "plastic" effects).
- Fix any lighting and exposure issues. Colorize the photo with **vibrant, bright, and natural tones** for a lifelike result.
- Remove all visual imperfections, including noise, grain, dust, scratches, and compression artifacts.
- Reconstruct and sharpen ALL blurred, damaged, or degraded areas with natural, realistic detail.
- For very old, severely damaged, or degraded photos, intelligently re-create missing parts in a photorealistic way.
- Apply CONSISTENT and BALANCED colorization across the entire photo. Avoid partial or patchy coloring.
- Preserve all original facial features, body proportions, and authentic historical details. Do NOT alter the person's identity or the objects' fundamental appearance.

CRITICAL QUALITY STANDARDS:
- Strive for MAXIMUM sharpness and crystal-clear detail throughout the ENTIRE image.
- Ensure UNIFORM color restoration that is **vibrant, natural, and bright**; every area must receive equal attention for a consistent look.
- Achieve COMPLETE detail reconstruction for any damaged or missing areas.
- The final result should be of professional, studio-quality, rivaling modern digital photography.
- Eliminate ALL blur, haze, softness, noise, and compression artifacts.
${userPrompt ? `\nUser's additional notes to consider: "${userPrompt}"` : ''}

Output: Return ONLY the final restored image. Do not return text.`;
    } else if (hotspot && 'x' in hotspot && 'y' in hotspot) {
        // This is a targeted edit with hotspot
        prompt = `You are an expert photo editor AI. Your task is to perform a natural, localized edit on the provided image based on the user's request.
User Request: "${userPrompt}"
Edit Location: Focus on the area around pixel coordinates (x: ${hotspot.x}, y: ${hotspot.y}).

Editing Guidelines:
- The edit must be realistic and blend seamlessly with the surrounding area.
- The rest of the image (outside the immediate edit area) must remain identical to the original.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.

Output: Return ONLY the final edited image. Do not return text.`;
    } else {
        // Default case
        prompt = userPrompt;
    }
    
    const textPart = { text: prompt };

    console.log('Sending image and prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
    });
    console.log('Received response from model.', response);

    return handleApiResponse(response, 'edit');
};

/**
 * Generates an image with a filter applied using generative AI.
 * @param originalImage The original image file.
 * @param filterPrompt The text prompt describing the desired filter.
 * @returns A promise that resolves to the data URL of the filtered image.
 */
export const generateImageFilter = async (
    originalImage: File,
    filterPrompt: string,
): Promise<string> => {
    console.log(`Starting filter generation: ${filterPrompt}`);
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to apply a stylistic filter to the entire image based on the user's request. Do not change the composition or content, only apply the style.
Filter Request: "${filterPrompt}"

Safety & Ethics Policy:
- Filters may subtly shift colors, but you MUST ensure they do not alter a person's fundamental race or ethnicity.
- You MUST REFUSE any request that explicitly asks to change a person's race (e.g., 'apply a filter to make me look Chinese').

Output: Return ONLY the final filtered image. Do not return text.`;
    const textPart = { text: prompt };

    console.log('Sending image and filter prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
    });
    console.log('Received response from model for filter.', response);
    
    return handleApiResponse(response, 'filter');
};

/**
 * Generates an image with a global adjustment applied using generative AI.
 * @param originalImage The original image file.
 * @param adjustmentPrompt The text prompt describing the desired adjustment.
 * @returns A promise that resolves to the data URL of the adjusted image.
 */
export const generateImageAdjustment = async (
    originalImage: File,
    adjustmentPrompt: string,
): Promise<string> => {
    console.log(`Starting global adjustment generation: ${adjustmentPrompt}`);
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to perform a natural, global adjustment to the entire image based on the user's request.
User Request: "${adjustmentPrompt}"

Editing Guidelines:
- The adjustment must be applied across the entire image.
- The result must be photorealistic.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.

Output: Return ONLY the final adjusted image. Do not return text.`;
    const textPart = { text: prompt };

    console.log('Sending image and adjustment prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
    });
    console.log('Received response from model for adjustment.', response);
    
    return handleApiResponse(response, 'adjustment');
};

/**
 * Generates an image with a free-form edit applied using generative AI.
 * @param originalImage The original image file.
 * @param userPrompt The text prompt describing the desired edit.
 * @returns A promise that resolves to the data URL of the edited image.
 */
export const generateFreeEditImage = async (
    originalImage: File,
    userPrompt: string,
): Promise<string> => {
    console.log(`Starting free-form edit generation: ${userPrompt}`);
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to perform a natural, photorealistic edit on the entire image based on the user's request.
User Request: "${userPrompt}"

Editing Guidelines:
- The adjustment must be applied across the entire image unless specified otherwise by the prompt.
- The result must be photorealistic. Do not create cartoons or drawings unless explicitly asked.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.

Output: Return ONLY the final edited image. Do not return text.`;
    const textPart = { text: prompt };

    console.log('Sending image and free-edit prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
    });
    console.log('Received response from model for free edit.', response);
    
    return handleApiResponse(response, 'free edit');
};

/**
 * Generates a formal memorial portrait from an image.
 * @param originalImage The original image file.
 * @param userPrompt The text prompt describing the desired portrait style.
 * @returns A promise that resolves to the data URL of the final portrait.
 */
export const generateMemorialImage = async (
    originalImage: File,
    userPrompt: string,
): Promise<string> => {
    console.log(`Starting memorial portrait generation: ${userPrompt}`);
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are a respectful and skilled AI photo editor specializing in creating formal memorial portraits. Your task is to transform the provided image into a dignified, high-quality portrait suitable for an altar or memorial service. You must anticipate and correct common issues in old or casual photos.

**Core Task:**
Transform the input image into a professional, solemn, and beautiful memorial portrait.

**Editing Guidelines & Problem Handling:**

1.  **Subject Focus & Composition:**
    *   If there are multiple people in the photo, isolate the main subject. If it's unclear, focus on the person most centrally framed or in focus.
    *   The final image should be a "head and shoulders" or "chest-up" portrait.
    *   If the subject's head is slightly turned, subtly adjust the pose to be more frontal and direct, suitable for a formal portrait. **CRITICAL: This adjustment must NOT alter their core facial features or identity. The person must remain perfectly recognizable.**

2.  **Facial Integrity:**
    *   You MUST perfectly preserve the person's likeness, including all facial features, structure, and ethnicity. Do NOT alter their fundamental appearance or make them look like a different person.

3.  **Comprehensive Restoration:**
    *   The original photo may be blurry, faded, stained, torn, or have low quality. Perform a full restoration.
    *   Sharpen blurry details, correct colors, fix exposure, and remove all damage (scratches, stains, tears, noise). The final image should be clear and high-resolution.

4.  **Background Replacement:**
    *   Completely replace the original background.
    *   The new background should be simple, neutral, and formal. A light grayish-white background, with a very subtle top-to-bottom gradient, is the preferred default. Avoid distracting or colorful backgrounds unless specified by the user.

5.  **Clothing:**
    *   Be guided by the user's request for clothing.
    *   If the user's request is general (e.g., "create a portrait"), use your best judgment to select formal, respectful attire. For Vietnamese subjects, a black suit, a white shirt, or a traditional Áo Dài are common choices.

**User Request:** "${userPrompt}"

**Final Output:**
Return ONLY the final, high-quality portrait image. Do not return any text.`;
    const textPart = { text: prompt };

    console.log('Sending image and memorial prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
    });
    console.log('Received response from model for memorial portrait.', response);
    
    return handleApiResponse(response, 'memorial portrait');
};

/**
 * Generates a composited image by combining a base image with a source image based on a prompt.
 * @param baseImage The main image.
 * @param sourceImage The image to add or combine.
 * @param userPrompt The text prompt describing how to combine the images.
 * @returns A promise that resolves to the data URL of the composited image.
 */
export const generateCompositedImage = async (
    baseImage: File,
    sourceImage: File,
    userPrompt: string
): Promise<string> => {
    console.log(`Starting composite generation: ${userPrompt}`);
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });

    const baseImagePart = await fileToPart(baseImage);
    const sourceImagePart = await fileToPart(sourceImage);
    const prompt = `You are an expert photo editor AI. Your task is to seamlessly combine the content of a second "source" image into a first "base" image, following the user's instructions. The result must be photorealistic.

User Instructions: "${userPrompt}"

Image Roles:
- The first image provided is the main "base" image (the background or main scene).
- The second image provided is the "source" image, containing the object, person, or element to be integrated into the base image.

Output: Return ONLY the final composited image. Do not return text.`;
    const textPart = { text: prompt };

    console.log('Sending base image, source image, and prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [textPart, baseImagePart, sourceImagePart] },
    });
    console.log('Received response from model for composite.', response);

    return handleApiResponse(response, 'composite');
};

/**
 * Generates a retouched image using generative AI.
 * @param originalImage The original image file.
 * @param userPrompt The text prompt describing the desired retouch.
 * @returns A promise that resolves to the data URL of the retouched image.
 */
export const generateRetouchedImage = async (
    originalImage: File,
    userPrompt: string,
): Promise<string> => {
    console.log(`Starting retouch generation: ${userPrompt}`);
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo retouching specialist AI. Your task is to perform professional retouching on the provided image based on the user's request.

User Request: "${userPrompt}"

Retouching Guidelines:
- Focus on natural beauty enhancement, blemish removal, skin smoothing, and feature enhancement.
- Maintain a realistic and natural appearance - avoid over-processing or "plastic" looks.
- Preserve the person's natural features and identity.
- Apply retouching selectively and professionally.

Output: Return ONLY the final retouched image. Do not return text.`;
    const textPart = { text: prompt };

    console.log('Sending image and retouch prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
    });
    console.log('Received response from model for retouch.', response);
    
    return handleApiResponse(response, 'retouch');
};

/**
 * Generates a description for an image using generative AI.
 * @param imageFile The image file to describe.
 * @returns A promise that resolves to a string description of the image.
 */
export const generateImageDescription = async (imageFile: File): Promise<string> => {
    console.log('Generating image description...');
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });

    const imagePart = await fileToPart(imageFile);
    const prompt = `You are an expert photo analyst. Your task is to look at the provided (potentially damaged) photograph and generate a descriptive prompt that would guide an AI photo restoration tool. Instead of describing the damage, describe the intended original scene as if you were instructing the AI on what to restore.

Focus on key elements:
- Main subjects (e.g., 'a young woman', 'two soldiers').
- Approximate age and ethnicity if clear (e.g., 'in their early 20s', 'Vietnamese').
- Clothing (e.g., 'wearing short-sleeved shirts').
- Pose and setting (e.g., 'standing side-by-side', 'in a studio setting').
- Any other important details that should be preserved or restored.

The output should be a concise phrase that can be used directly in a text input to guide the restoration. For example, instead of saying 'the photo is faded and shows two men', you should output something like: 'Two young Vietnamese soldiers in their 20s, wearing short-sleeved shirts, standing for a portrait.'`;
    const textPart = { text: prompt };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        const description = response.text;
        
        if (!description) {
            console.error('Model did not return a text description.', { response });
            return '';
        }

        console.log('Generated description:', description);
        return description.trim();

    } catch (error) {
        console.error('Error generating image description:', error);
        return '';
    }
};

/**
 * Generates suggestions for how to composite two images.
 * @param baseImage The main image.
 * @param sourceImage The image to add or combine.
 * @returns A promise that resolves to an array of string suggestions.
 */
export const generateCompositeSuggestions = async (
    baseImage: File,
    sourceImage: File
): Promise<string[]> => {
    console.log('Generating composite suggestions...');
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });

    const baseImagePart = await fileToPart(baseImage);
    const sourceImagePart = await fileToPart(sourceImage);
    const prompt = `You are a professional photo compositing specialist with expertise in seamless image blending. Analyze these two images and provide 3 sophisticated, technically-precise prompts for professional image compositing.

**Image Analysis Instructions:**
1. **Base Image (First)**: Identify the primary scene, lighting conditions, perspective, and focal subjects
2. **Source Image (Second)**: Identify the main element to be extracted and integrated
3. **Technical Considerations**: Assess lighting compatibility, scale relationships, and perspective matching

**Compositing Scenarios to Consider:**
- **Portrait Integration**: Seamlessly blend people into new environments while matching lighting and atmosphere
- **Object Placement**: Intelligently position objects with proper shadows, reflections, and perspective
- **Background Replacement**: Replace backgrounds while maintaining natural edge blending and lighting consistency
- **Fashion/Product Integration**: Apply clothing, accessories, or products with realistic physics and lighting
- **Environmental Blending**: Merge elements from different scenes with atmospheric perspective

**Professional Prompt Requirements:**
- Use precise compositing terminology (e.g., "seamlessly blend", "match ambient lighting", "preserve edge detail")
- Include lighting and shadow considerations
- Specify natural perspective and scale matching
- Ensure photorealistic integration

Output requirements:
- Return ONLY a JSON object with a single key "suggestions" which is an array of 3 strings.
- Each suggestion must be a professional, detailed compositing instruction.
- Focus on technical precision and natural integration.

Example Output: {"suggestions": ["Seamlessly blend the person from the source image into the base scene, matching the ambient lighting and adding natural shadows that correspond to the base image's light sources.", "Extract the main object from the source image and integrate it into the base scene with proper perspective scaling and realistic surface reflections.", "Combine both subjects while maintaining natural depth of field, ensuring the lighting direction and color temperature are consistent across all elements."]}
`;
    const textPart = { text: prompt };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, baseImagePart, sourceImagePart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as { suggestions: string[] };
        
        if (!result.suggestions || result.suggestions.length === 0) {
             throw new Error("Model returned empty suggestions array.");
        }
        
        console.log('Generated composite suggestions:', result.suggestions);
        return result.suggestions;
    } catch (error) {
        console.error('Error generating composite suggestions:', error);
        return [];
    }
};

/**
 * Generates creative editing suggestions for a single image (combines free edit and adjustment capabilities).
 * @param imageFile The image to analyze.
 * @returns A promise that resolves to an array of string suggestions.
 */
export const generateCreativeEditSuggestions = async (imageFile: File): Promise<string[]> => {
    console.log('Generating creative edit suggestions...');
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });
    
    const imagePart = await fileToPart(imageFile);
    const prompt = `You are a professional photo editor and creative director. Analyze the provided image and generate 3 diverse, sophisticated editing suggestions that showcase different creative approaches. Combine both artistic transformations and technical adjustments.

**Analysis Framework:**
1. **Current Image Assessment**: Evaluate lighting, composition, color palette, mood, and technical quality
2. **Creative Potential**: Identify opportunities for artistic enhancement, style transformation, and mood adjustment
3. **Technical Improvements**: Consider color grading, exposure correction, contrast enhancement, and atmospheric effects

**Suggestion Categories (provide one from each):**
1. **Artistic Style Transformation**: Film emulation, artistic filters, period-specific looks, or genre styling
2. **Atmospheric/Mood Enhancement**: Lighting changes, weather effects, time of day shifts, or emotional tone adjustments  
3. **Color & Technical Enhancement**: Professional color grading, exposure correction, cinematic looks, or technical improvements

**Professional Language Requirements:**
- Use photography and post-processing terminology
- Specify technical details (e.g., "warm color grading", "soft natural lighting", "increased dynamic range")
- Focus on achieving professional, polished results
- Ensure each suggestion offers a distinctly different creative direction

Output requirements:
- Return ONLY a JSON object with a single key "suggestions" which is an array of 3 strings.
- Each suggestion must be detailed, professional, and actionable.
- Ensure suggestions cover different creative approaches for maximum variety.

Example Output: {"suggestions": ["Apply a cinematic color grade with warm highlights and cool shadows, enhancing the dramatic contrast for a modern film look.", "Transform the lighting to golden hour conditions with soft, warm backlighting and gentle lens flares for a romantic atmosphere.", "Enhance the image with professional portrait retouching, increasing clarity and applying subtle HDR processing for commercial photography quality."]}
`;
    const textPart = { text: prompt };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as { suggestions: string[] };

        if (!result.suggestions || result.suggestions.length === 0) {
             throw new Error("Model returned empty suggestions array.");
        }

        console.log('Generated creative edit suggestions:', result.suggestions);
        return result.suggestions;

    } catch (error) {
        console.error('Error generating creative edit suggestions:', error);
        return [];
    }
};

/**
 * Generates creative editing suggestions for a single image.
 * @param imageFile The image to analyze.
 * @returns A promise that resolves to an array of string suggestions.
 */
export const generateFreeEditSuggestions = async (imageFile: File): Promise<string[]> => {
    console.log('Generating free edit suggestions...');
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });
    
    const imagePart = await fileToPart(imageFile);
    const prompt = `You are a creative AI assistant. Analyze the provided image and generate 3 distinct, creative, and actionable prompts for a global photo edit. The prompts should describe a significant transformation of the entire image's mood, style, or content.

Examples of good suggestions:
- "Change the season to a snowy winter landscape."
- "Make the sky a dramatic, fiery sunset."
- "Apply a vintage, sepia-toned film noir style."
- "Transform the photo into a detailed oil painting."

Output requirements:
- Return ONLY a JSON object with a single key "suggestions" which is an array of 3 strings.
- Each string in the array must be a direct, imperative command.
- Do not include explanations or quotation marks in the final string values.

Example Output: {"suggestions": ["Change the season to autumn with golden leaves.", "Make the lighting more dramatic, like a scene from a movie.", "Give this image a futuristic, cyberpunk aesthetic with neon lights."]}
`;
    const textPart = { text: prompt };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as { suggestions: string[] };

        if (!result.suggestions || result.suggestions.length === 0) {
             throw new Error("Model returned empty suggestions array.");
        }

        console.log('Generated free edit suggestions:', result.suggestions);
        return result.suggestions;

    } catch (error) {
        console.error('Error generating free edit suggestions:', error);
        return [];
    }
};

/**
 * Generates suggestions for creating a memorial portrait.
 * @param imageFile The image to analyze.
 * @returns A promise that resolves to an array of string suggestions.
 */
export const generateMemorialSuggestions = async (imageFile: File): Promise<string[]> => {
    console.log('Generating memorial suggestions...');
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });
    
    const imagePart = await fileToPart(imageFile);
    const prompt = `You are a creative and culturally-aware AI assistant. Analyze the person in the provided image and generate 3 distinct, actionable prompts for creating a formal memorial portrait. For Vietnamese culture, this often involves specific formal attire.

Your Analysis Process:
1. Identify the main person in the photo.
2. Suggest changing their clothes to something more formal.
3. Suggest a suitable formal background.
4. Suggest a general restoration or framing option.

Prompts should be concise, respectful, and phrased as direct commands.

Output requirements:
- Return ONLY a JSON object with a single key "suggestions" which is an array of 3 strings.
- Do not include explanations or quotation marks in the final string values.

Example Output for a man in a t-shirt: {"suggestions": ["Change his shirt to a formal black suit and tie, with a studio background.", "Isolate his portrait and give him a clean, white collared shirt.", "Restore the photo's quality and add a subtle, dark background."]}
Example Output for a woman: {"suggestions": ["Change her clothing to a traditional, respectful Áo Dài.", "Create a formal portrait with her in a simple blouse against a soft blue background.", "Enhance the photo's clarity and frame it in a digital oval vignette."]}
`;
    const textPart = { text: prompt };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as { suggestions: string[] };

        if (!result.suggestions || result.suggestions.length === 0) {
             throw new Error("Model returned empty suggestions array.");
        }

        console.log('Generated memorial suggestions:', result.suggestions);
        return result.suggestions;

    } catch (error) {
        console.error('Error generating memorial suggestions:', error);
        return [];
    }
};

/**
 * Generates professional retouching suggestions using Gemini AI.
 * @param imageFile The image to analyze.
 * @returns A promise that resolves to an array of string suggestions.
 */
export const generateRetouchSuggestions = async (imageFile: File): Promise<string[]> => {
    console.log('Generating retouch suggestions...');
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });
    
    const imagePart = await fileToPart(imageFile);
    const prompt = `You are a professional photo retoucher specializing in high-end portrait and commercial photography. Analyze the provided image and identify specific retouching opportunities that would benefit from professional attention.

**Retouching Analysis Framework:**
1. **Subject Assessment**: Identify people, objects, and key focal points requiring enhancement
2. **Technical Flaws**: Spot dust, scratches, sensor spots, unwanted reflections, or compression artifacts  
3. **Compositional Issues**: Identify distracting background elements, unwanted objects, or clutter
4. **Skin & Portrait Work**: For portraits, assess skin texture, blemishes, and natural enhancement opportunities

**Professional Retouching Categories:**
- **Object Removal**: Remove distracting background elements, unwanted people, or visual clutter
- **Skin Retouching**: Professional skin enhancement while maintaining natural texture and authenticity
- **Detail Enhancement**: Clean up dust spots, scratches, sensor artifacts, or technical imperfections
- **Background Refinement**: Clean and enhance backgrounds without affecting the main subject
- **Perspective Correction**: Fix lens distortion, straighten horizons, or adjust architectural elements

**Professional Standards:**
- Use industry-standard retouching terminology
- Focus on subtle, natural-looking improvements
- Emphasize maintaining authenticity while enhancing quality
- Suggest techniques that preserve the original character of the image

Output requirements:
- Return ONLY a JSON object with a single key "suggestions" which is an array of 3 strings.
- Each suggestion must be specific, professional, and technically precise.
- Focus on realistic retouching tasks that would genuinely improve the image.

Example Output: {"suggestions": ["Remove distracting background elements while preserving edge detail and maintaining natural depth of field.", "Apply professional skin retouching to smooth minor imperfections while preserving natural skin texture and authenticity.", "Clean up dust spots and sensor artifacts throughout the image using professional spot healing techniques."]}
`;
    const textPart = { text: prompt };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as { suggestions: string[] };

        if (!result.suggestions || result.suggestions.length === 0) {
             throw new Error("Model returned empty suggestions array.");
        }

        console.log('Generated retouch suggestions:', result.suggestions);
        return result.suggestions;

    } catch (error) {
        console.error('Error generating retouch suggestions:', error);
        return [
            "Remove distracting background elements while preserving edge detail",
            "Apply professional skin retouching while maintaining natural texture", 
            "Clean up dust spots and technical imperfections throughout the image"
        ];
    }
};