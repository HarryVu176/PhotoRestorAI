/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { Analytics } from '@vercel/analytics/react';
import { 
  generateImageEdit, 
  generateImageFilter, 
  generateImageAdjustment,
  generateImageDescription,
  generateFreeEditSuggestions,
  generateCreativeEditSuggestions,
  generateMemorialSuggestions,
  generateCompositeSuggestions,
  generateRetouchSuggestions,
  generateFreeEditImage,
  generateMemorialImage,
  generateCompositedImage,
  generateRetouchedImage
} from './services/geminiService';
// Removed stats service imports for hackathon version
// Removed AuthProvider and useAuth imports for hackathon version
import Header from './components/Header';
import Footer from './components/Footer';
import FilterPanel from './components/FilterPanel';
import RestorationStylesPanel from './components/RestorationStylesPanel';
import AdjustmentPanel from './components/AdjustmentPanel';
import CropPanel from './components/CropPanel';
import MagicPanel from './components/MagicPanel';
import ComparisonViewer from './components/ComparisonViewer';
import RestorePanel from './components/RestorePanel';
import FloatingActionButtons from './components/FloatingActionButtons';
import MobileToolbar from './components/MobileToolbar';
import ToastNotification from './components/ToastNotification';
import ProcessingOverlay from './components/ProcessingOverlay';
import MemorialPanel from './components/MemorialPanel';
import FreeEditPanel from './components/FreeEditPanel';
import CompositePanel from './components/CompositePanel';
import RetouchPanel from './components/RetouchPanel';
// Removed LoginModal import for hackathon version
// Removed UserQuotaManager import for hackathon version
import { UndoIcon, RedoIcon, EyeIcon, MagicWandIcon, RetouchIcon, CropIcon, AdjustIcon, FilterIcon, DownloadIcon, ResetIcon, UploadIcon, ArrowLeftIcon, CommandIcon, PhotoIcon, PortraitIcon, PencilIcon, LayersIcon, CogIcon, SparklesIcon } from './components/icons';
// Removed quota service imports for hackathon version
import StartScreen from './components/StartScreen';

// Helper to convert a data URL string to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

type Tab = 'magic' | 'creativeEdit' | 'memorial' | 'composite' | 'retouch' | 'restorationStyles' | 'crop';

const AppContent: React.FC = () => {
  // Removed authentication for hackathon version

  const [history, setHistory] = useState<File[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [prompt, setPrompt] = useState<string>('');
  const [creativeEditPrompt, setCreativeEditPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [editHotspot, setEditHotspot] = useState<{ x: number, y: number } | null>(null);
  const [displayHotspot, setDisplayHotspot] = useState<{ x: number, y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('magic');
  
  // AI suggestion states
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [isDescribing, setIsDescribing] = useState<boolean>(false);
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>();
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Removed quota management for hackathon version
  
  const imgRef = useRef<HTMLImageElement>(null);
  const imageDisplayRef = useRef<HTMLDivElement>(null);

  const currentImage = history[historyIndex] ?? null;
  const originalImage = history[0] ?? null;

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  // Smooth scroll to image display
  const scrollToImage = useCallback(() => {
    if (imageDisplayRef.current) {
      imageDisplayRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  }, []);

  // Removed authentication and quota management for hackathon version

  // Timer effect for processing time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading && loadingStartTime) {
      interval = setInterval(() => {
        setProcessingTime(Math.floor((Date.now() - loadingStartTime) / 1000));
      }, 1000);
    } else {
      setProcessingTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading, loadingStartTime]);

  // Removed user stats initialization for hackathon version

  // AI suggestion functions
  const generateAIDescription = useCallback(async (imageFile: File) => {
    setIsDescribing(true);
    try {
      const description = await generateImageDescription(imageFile);
      if (description) {
        setInitialPrompt(description);
      } else {
        // Fallback to sample descriptions if AI fails
        const descriptions = [
          "vintage family photo from the 1980s with warm colors",
          "old photograph with some fading and scratches",
          "portrait photo that could benefit from color enhancement",
          "black and white photo that could be colorized",
          "group photo with lighting issues"
        ];
        const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
        setInitialPrompt(randomDescription);
      }
    } catch (error) {
      console.error('Failed to generate description:', error);
      // Fallback to sample descriptions
      const descriptions = [
        "vintage family photo from the 1980s with warm colors",
        "old photograph with some fading and scratches",
        "portrait photo that could benefit from color enhancement"
      ];
      const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
      setInitialPrompt(randomDescription);
    } finally {
      setIsDescribing(false);
    }
  }, []);

  const generateSuggestions = useCallback(async (imageFile: File, type: string) => {
    setIsSuggesting(true);
    setSuggestions([]);
    
    try {
      let newSuggestions: string[] = [];
      
      switch (type) {
        case 'memorial':
          newSuggestions = await generateMemorialSuggestions(imageFile);
          break;
        case 'creativeEdit':
          newSuggestions = await generateCreativeEditSuggestions(imageFile);
          break;
        case 'composite':
          // For composite, we need two images. For now, use base image only
          // This should be updated when composite functionality is fully implemented
          newSuggestions = [
            "Blend the images seamlessly together",
            "Place the source object into the base scene",
            "Combine both subjects in natural composition"
          ];
          break;
        case 'retouch':
          newSuggestions = await generateRetouchSuggestions(imageFile);
          break;
        default:
          newSuggestions = [];
      }
      
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      // Fallback to default suggestions if AI fails
      let fallbackSuggestions: string[] = [];
      
      switch (type) {
        case 'memorial':
          fallbackSuggestions = [
            "Create a formal portrait with neutral background",
            "Change clothes to traditional formal attire",
            "Add subtle lighting for memorial photo"
          ];
          break;
        case 'creativeEdit':
          fallbackSuggestions = [
            "Apply cinematic color grading with enhanced contrast",
            "Transform to golden hour lighting with warm atmosphere",
            "Enhance with professional portrait quality and clarity"
          ];
          break;
        case 'composite':
          fallbackSuggestions = [
            "Blend the images seamlessly together",
            "Place the source object into the base scene",
            "Combine both subjects in natural composition"
          ];
          break;
        case 'retouch':
          fallbackSuggestions = [
            "Remove distracting background elements",
            "Apply professional skin retouching while maintaining natural texture",
            "Clean up dust spots and technical imperfections"
          ];
          break;
        default:
          fallbackSuggestions = [];
      }
      
      setSuggestions(fallbackSuggestions);
    } finally {
      setIsSuggesting(false);
    }
  }, []);

  // Special function for composite suggestions that needs both base and source images
  const generateCompositeSuggestionsWithBothImages = useCallback(async (sourceImage: File) => {
    if (!currentImage) return;
    
    setIsSuggesting(true);
    setSuggestions([]);
    
    try {
      const newSuggestions = await generateCompositeSuggestions(currentImage, sourceImage);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to generate composite suggestions:', error);
      // Fallback suggestions
      setSuggestions([
        "Blend the images seamlessly together",
        "Place the source object into the base scene",
        "Combine both subjects in natural composition"
      ]);
    } finally {
      setIsSuggesting(false);
    }
  }, [currentImage]);

  // Removed duplicate user stats initialization for hackathon version

  // Format processing time
  const formatProcessingTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Start loading with timer
  const startLoadingWithTimer = () => {
    setIsLoading(true);
    setLoadingStartTime(Date.now());
    setProcessingTime(0);
  };

  // Stop loading
  const stopLoading = () => {
    setIsLoading(false);
    setLoadingStartTime(null);
    setProcessingTime(0);
  };

  // Effect to create and revoke object URLs safely for the current image
  useEffect(() => {
    if (currentImage) {
      const url = URL.createObjectURL(currentImage);
      setCurrentImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCurrentImageUrl(null);
    }
  }, [currentImage]);
  
  // Effect to create and revoke object URLs safely for the original image
  useEffect(() => {
    if (originalImage) {
      const url = URL.createObjectURL(originalImage);
      setOriginalImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setOriginalImageUrl(null);
    }
  }, [originalImage]);


  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const addImageToHistory = useCallback((newImageFile: File) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newImageFile);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    // Reset transient states after an action
    setCrop(undefined);
    setCompletedCrop(undefined);
    
    // Scroll to image after a short delay to ensure the new image is rendered
    setTimeout(() => {
      scrollToImage();
    }, 100);
  }, [history, historyIndex, scrollToImage]);

  const handleImageUpload = useCallback((file: File) => {
    setError(null);
    setHistory([file]);
    setHistoryIndex(0);
    setEditHotspot(null);
    setDisplayHotspot(null);
    setActiveTab('magic');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setIsComparing(false);
    
    // Clear previous AI states
    setSuggestions([]);
    setInitialPrompt('');
    
    // Generate AI description for magic restoration panel
    generateAIDescription(file);
  }, [generateAIDescription]);

  const handleFreeEditorGenerate = useCallback(async () => {
    if (!currentImage) {
      setError('No image loaded to edit.');
      return;
    }
    
    if (!creativeEditPrompt.trim()) {
        setError('Please enter a description for your free edit.');
        return;
    }

    startLoadingWithTimer();
    setError(null);
    
    try {
        const editedImageUrl = await generateImageFilter(currentImage, creativeEditPrompt);
        const newImageFile = dataURLtoFile(editedImageUrl, `free-edit-${Date.now()}.png`);
        addImageToHistory(newImageFile);
        setCreativeEditPrompt('');
        
        // Removed user stats tracking for hackathon version
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to generate the image. ${errorMessage}`);
        console.error(err);
    } finally {
        stopLoading();
    }
  }, [currentImage, creativeEditPrompt, addImageToHistory]);

  const handleGenerate = useCallback(async () => {
    if (!currentImage) {
      setError('No image loaded to edit.');
      return;
    }
    
    if (!prompt.trim()) {
        setError('Please enter a description for your edit.');
        return;
    }

    if (!editHotspot) {
        setError('Please click on the image to select an area to edit.');
        return;
    }

    startLoadingWithTimer();
    setError(null);
    
    try {
        const editedImageUrl = await generateImageEdit(currentImage, prompt, editHotspot);
        const newImageFile = dataURLtoFile(editedImageUrl, `edited-${Date.now()}.png`);
        addImageToHistory(newImageFile);
        setEditHotspot(null);
        setDisplayHotspot(null);
        
        // Removed user stats tracking for hackathon version
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to generate the image. ${errorMessage}`);
        console.error(err);
    } finally {
        stopLoading();
    }
  }, [currentImage, prompt, editHotspot, addImageToHistory]);
  
  const handleApplyFilter = useCallback(async (filterPrompt: string) => {
    if (!currentImage) {
      setError('No image loaded to apply a filter to.');
      return;
    }

    startLoadingWithTimer();
    setError(null);
    
    try {
        const filteredImageUrl = await generateImageFilter(currentImage, filterPrompt);
        const newImageFile = dataURLtoFile(filteredImageUrl, `filtered-${Date.now()}.png`);
        addImageToHistory(newImageFile);
        
        // Removed user stats tracking for hackathon version
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to apply the filter. ${errorMessage}`);
        console.error(err);
    } finally {
        stopLoading();
    }
  }, [currentImage, addImageToHistory]);
  
  const handleApplyAdjustment = useCallback(async (adjustmentPrompt: string) => {
    if (!currentImage) {
      setError('No image loaded to apply an adjustment to.');
      return;
    }

    startLoadingWithTimer();
    setError(null);
    
    try {
        const adjustedImageUrl = await generateImageAdjustment(currentImage, adjustmentPrompt);
        const newImageFile = dataURLtoFile(adjustedImageUrl, `adjusted-${Date.now()}.png`);
        addImageToHistory(newImageFile);
        
        // Removed user stats tracking for hackathon version
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to apply the adjustment. ${errorMessage}`);
        console.error(err);
    } finally {
        stopLoading();
    }
  }, [currentImage, addImageToHistory]);

  const handleApplyMagic = useCallback(async (customOptions?: {
    enhanceDetails?: boolean;
    fixLighting?: boolean;
    removeNoise?: boolean;
    colorCorrection?: boolean;
    removeArtifacts?: boolean;
    customPrompt?: string;
    subjectDescription?: string;
  }) => {
    if (!currentImage) {
      setError('No image loaded to restore.');
      return;
    }
    
    startLoadingWithTimer();
    setError(null);
    
    try {
        const magicPrompt = customOptions?.customPrompt || "Restore and enhance this photo with professional quality, fix any damage, improve colors, and enhance overall image quality";
        const restoredImageUrl = await generateImageEdit(currentImage, magicPrompt, customOptions);
        const newImageFile = dataURLtoFile(restoredImageUrl, `magic-restored-${Date.now()}.png`);
        addImageToHistory(newImageFile);
        
        // Removed user stats tracking for hackathon version
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to apply magic restoration. ${errorMessage}`);
        console.error(err);
    } finally {
        stopLoading();
    }
  }, [currentImage, addImageToHistory]);

  const handleApplyCrop = useCallback(() => {
    if (!completedCrop || !imgRef.current) {
        setError('Please select an area to crop.');
        return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        setError('Could not process the crop.');
        return;
    }

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = completedCrop.width * pixelRatio;
    canvas.height = completedCrop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );
    
    const croppedImageUrl = canvas.toDataURL('image/png');
    const newImageFile = dataURLtoFile(croppedImageUrl, `cropped-${Date.now()}.png`);
    addImageToHistory(newImageFile);

    // Removed user stats tracking for hackathon version

  }, [completedCrop, addImageToHistory]);

  // New enhanced handlers for the improved panels
  const handleApplyRestore = useCallback(async (prompt: string) => {
    if (!currentImage) {
      setError('No image loaded to restore.');
      return;
    }

    startLoadingWithTimer();
    setError(null);
    
    try {
      const customOptions = prompt ? { customPrompt: prompt } : undefined;
      const magicPrompt = customOptions?.customPrompt || "Restore and enhance this photo with professional quality, fix any damage, improve colors, and enhance overall image quality";
      const restoredImageUrl = await generateImageEdit(currentImage, magicPrompt, customOptions);
      const newImageFile = dataURLtoFile(restoredImageUrl, `magic-restored-${Date.now()}.png`);
      addImageToHistory(newImageFile);
      
      // Removed user stats tracking for hackathon version
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to apply magic restoration. ${errorMessage}`);
      console.error(err);
    } finally {
      stopLoading();
    }
  }, [currentImage, addImageToHistory]);

  const handleApplyMemorial = useCallback(async (prompt: string) => {
    if (!currentImage) {
      setError('No image loaded.');
      return;
    }

    startLoadingWithTimer();
    setError(null);
    
    try {
      const editedImageUrl = await generateMemorialImage(currentImage, prompt);
      const newImageFile = dataURLtoFile(editedImageUrl, `memorial-${Date.now()}.png`);
      addImageToHistory(newImageFile);
      
      // Removed user stats tracking for hackathon version
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to create memorial portrait. ${errorMessage}`);
      console.error(err);
    } finally {
      stopLoading();
    }
  }, [currentImage, addImageToHistory]);

  const handleApplyFreeEdit = useCallback(async (prompt: string) => {
    if (!currentImage) {
      setError('No image loaded.');
      return;
    }

    startLoadingWithTimer();
    setError(null);
    
    try {
      const editedImageUrl = await generateFreeEditImage(currentImage, prompt);
      const newImageFile = dataURLtoFile(editedImageUrl, `free-edit-${Date.now()}.png`);
      addImageToHistory(newImageFile);
      
      // Removed user stats tracking for hackathon version
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to apply free edit. ${errorMessage}`);
      console.error(err);
    } finally {
      stopLoading();
    }
  }, [currentImage, addImageToHistory]);

  const handleApplyComposite = useCallback(async (sourceImage: File, prompt: string) => {
    if (!currentImage) {
      setError('No image loaded.');
      return;
    }

    startLoadingWithTimer();
    setError(null);
    
    try {
      const editedImageUrl = await generateCompositedImage(currentImage, sourceImage, prompt);
      const newImageFile = dataURLtoFile(editedImageUrl, `composite-${Date.now()}.png`);
      addImageToHistory(newImageFile);
      
      // Removed user stats tracking for hackathon version
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to apply composite. ${errorMessage}`);
      console.error(err);
    } finally {
      stopLoading();
    }
  }, [currentImage, addImageToHistory]);

  const handleApplyRetouch = useCallback(async (prompt: string) => {
    if (!currentImage) {
      setError('No image loaded.');
      return;
    }

    startLoadingWithTimer();
    setError(null);
    
    try {
      const editedImageUrl = await generateRetouchedImage(currentImage, prompt);
      const newImageFile = dataURLtoFile(editedImageUrl, `retouch-${Date.now()}.png`);
      addImageToHistory(newImageFile);
      
      // Removed user stats tracking for hackathon version
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to apply retouch. ${errorMessage}`);
      console.error(err);
    } finally {
      stopLoading();
    }
  }, [currentImage, addImageToHistory]);

  // Handle tab changes and generate suggestions
  const handleTabChange = useCallback((newTab: Tab) => {
    setActiveTab(newTab);
    
    // Generate suggestions for tabs that support AI suggestions
    if (currentImage && ['memorial', 'creativeEdit', 'composite', 'retouch'].includes(newTab)) {
      generateSuggestions(currentImage, newTab);
    }
  }, [currentImage, generateSuggestions]);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      setHistoryIndex(historyIndex - 1);
      setEditHotspot(null);
      setDisplayHotspot(null);
    }
  }, [canUndo, historyIndex]);
  
  const handleRedo = useCallback(() => {
    if (canRedo) {
      setHistoryIndex(historyIndex + 1);
      setEditHotspot(null);
      setDisplayHotspot(null);
    }
  }, [canRedo, historyIndex]);

  const handleReset = useCallback(() => {
    if (history.length > 0) {
      setHistoryIndex(0);
      setError(null);
      setEditHotspot(null);
      setDisplayHotspot(null);
    }
  }, [history]);

  const handleUploadNew = useCallback(() => {
      // Create a file input element and trigger click
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      
      fileInput.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          handleImageUpload(target.files[0]);
        }
        document.body.removeChild(fileInput);
      });
      
      document.body.appendChild(fileInput);
      fileInput.click();
  }, [handleImageUpload]);

  const handleLogoClick = useCallback(() => {
      // Reset to initial state - go back to upload screen
      setHistory([]);
      setHistoryIndex(-1);
      setError(null);
      setPrompt('');
    setCreativeEditPrompt('');
      setEditHotspot(null);
      setDisplayHotspot(null);
      setIsComparing(false);
      setActiveTab('magic');
  }, []);

  const handleDownload = useCallback(() => {
      if (currentImage) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(currentImage);
          link.download = `edited-${currentImage.name}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
      }
  }, [currentImage]);
  
  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      handleImageUpload(files[0]);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (activeTab !== 'retouch') return;
    
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();

    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDisplayHotspot({ x: offsetX, y: offsetY });

    const { naturalWidth, naturalHeight, clientWidth, clientHeight } = img;
    const scaleX = naturalWidth / clientWidth;
    const scaleY = naturalHeight / clientHeight;

    const originalX = Math.round(offsetX * scaleX);
    const originalY = Math.round(offsetY * scaleY);

    setEditHotspot({ x: originalX, y: originalY });
};

  const renderContent = () => {
    if (error) {
       return (
           <div className="text-center animate-fade-in bg-red-500/10 border border-red-500/20 p-8 rounded-lg max-w-2xl mx-auto flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-red-300">An Error Occurred</h2>
            <p className="text-md text-red-400">{error}</p>
            <button
                onClick={() => setError(null)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg text-md transition-colors"
              >
                Try Again
            </button>
          </div>
        );
    }
    
    if (!currentImageUrl) {
      return <StartScreen onFileSelect={handleFileSelect} />;
    }

    const imageDisplay = (
      <div className="relative">
        {/* Base image is the original, always at the bottom */}
        {originalImageUrl && (
            <img
                key={originalImageUrl}
                src={originalImageUrl}
                alt="Original"
                className="w-full h-auto object-contain max-h-[60vh] rounded-xl pointer-events-none"
            />
        )}
        {/* The current image is an overlay that fades in/out for comparison */}
        <img
            ref={imgRef}
            key={currentImageUrl}
            src={currentImageUrl}
            alt="Current"
            onClick={handleImageClick}
            className={`absolute top-0 left-0 w-full h-auto object-contain max-h-[60vh] rounded-xl transition-opacity duration-200 ease-in-out ${isComparing ? 'opacity-0' : 'opacity-100'} ${activeTab === 'retouch' ? 'cursor-crosshair' : ''}`}
        />
        
        {/* Desktop Action Buttons - Compare and Download near bottom of image */}
        <div className="hidden md:flex absolute bottom-4 right-0 flex-col gap-2 z-20">
          {canUndo && (
            <>
              <button
                onClick={() => setIsComparing(!isComparing)}
                className="group relative p-3 bg-black/70 hover:bg-black/90 text-white rounded-l-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 backdrop-blur-sm border border-gray-600 border-r-0"
                aria-label="Compare before and after"
              >
                <EyeIcon className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  {isComparing ? 'Hide Compare' : 'Compare'}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-r-4 border-r-gray-900 border-y-4 border-y-transparent"></div>
                </div>
              </button>
              
              <button
                onClick={handleDownload}
                disabled={isLoading}
                className={`group relative p-3 bg-black/70 hover:bg-black/90 text-white rounded-l-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 backdrop-blur-sm border border-gray-600 border-r-0 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label="Download image"
              >
                <DownloadIcon className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  Download
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-r-4 border-r-gray-900 border-y-4 border-y-transparent"></div>
                </div>
              </button>
            </>
          )}
        </div>

        {/* Desktop Upload Button - Below all toolbars */}
        <div className="hidden md:block fixed bottom-8 right-8 z-20">
          <button
            onClick={handleUploadNew}
            className="group relative w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 flex items-center justify-center"
            aria-label="Upload new image"
          >
            <UploadIcon className="w-7 h-7" />
            
            {/* Pulse effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-ping opacity-30"></div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Upload New Image
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-t-4 border-t-gray-900 border-x-4 border-x-transparent"></div>
            </div>
          </button>
        </div>
        
        {/* Floating Action Buttons - Mobile Only */}
        <div className="md:hidden">
          <FloatingActionButtons
            onCompare={() => setIsComparing(!isComparing)}
            onDownload={handleDownload}
            onNewUpload={handleUploadNew}
            canCompare={canUndo}
            isVisible={canUndo && !isLoading}
            isProcessing={isLoading}
          />
        </div>
      </div>
    );
    
    // For ReactCrop, we need a single image element. We'll use the current one.
    const cropImageElement = (
      <img 
        ref={imgRef}
        key={`crop-${currentImageUrl}`}
        src={currentImageUrl} 
        alt="Crop this image"
        className="w-full h-auto object-contain max-h-[60vh] rounded-xl"
      />
    );


    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
        <div ref={imageDisplayRef} className="relative w-full shadow-2xl rounded-xl overflow-hidden bg-black/20">
            {activeTab === 'crop' ? (
              <ReactCrop 
                crop={crop} 
                onChange={c => setCrop(c)} 
                onComplete={c => setCompletedCrop(c)}
                aspect={aspect}
                className="max-h-[60vh]"
              >
                {cropImageElement}
              </ReactCrop>
            ) : imageDisplay }

            {displayHotspot && !isLoading && activeTab === 'retouch' && (
                <div 
                    className="absolute rounded-full w-6 h-6 bg-blue-500/50 border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ left: `${displayHotspot.x}px`, top: `${displayHotspot.y}px` }}
                >
                    <div className="absolute inset-0 rounded-full w-6 h-6 animate-ping bg-blue-400"></div>
                </div>
            )}
        </div>
        
        <div className="w-full max-w-4xl mx-auto bg-slate-800/80 border border-slate-600/80 rounded-xl p-2 flex items-center justify-between lg:justify-center gap-1 lg:gap-2 backdrop-blur-md shadow-lg">
            {[
              { key: 'magic', label: 'Magic', icon: MagicWandIcon },
              { key: 'memorial', label: 'Memorial', icon: PortraitIcon },
              { key: 'creativeEdit', label: 'Creative Edit', icon: PencilIcon },
              { key: 'composite', label: 'Composite', icon: LayersIcon },
              { key: 'retouch', label: 'Retouch', icon: RetouchIcon },
              { key: 'restorationStyles', label: 'Styles', icon: SparklesIcon },
              { key: 'crop', label: 'Crop', icon: CropIcon },
            ].map(({ key, label, icon: Icon }) => (
                 <button
                    key={key}
                    onClick={() => handleTabChange(key as Tab)}
                    className={`flex-auto lg:flex-1 min-w-fit flex items-center justify-center gap-1 font-semibold py-2 sm:py-3 px-1 lg:px-3 rounded-lg transition-all duration-300 text-xs sm:text-sm whitespace-nowrap ${
                        activeTab === key 
                        ? (key === 'magic' 
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                          : key === 'memorial'
                          ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-lg shadow-sky-500/30 scale-105'
                          : key === 'creativeEdit'
                          ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30 scale-105'
                          : key === 'composite'
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30 scale-105'
                          : key === 'retouch'
                          ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30 scale-105'
                          : key === 'restorationStyles'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/30 scale-105'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105') 
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:scale-102'
                    }`}
                >
                    <Icon className="w-5 h-5" />
                    {/* Only show text on large screens */}
                    <span className="hidden lg:inline text-sm">
                      {label}
                    </span>
                </button>
            ))}
        </div>
        
        <div className="w-full">
            {activeTab === 'magic' && (
              <RestorePanel 
                onApplyRestore={handleApplyRestore}
                isRestoring={isLoading}
                isDescribing={isDescribing}
                initialPrompt={initialPrompt}
              />
            )}
            {activeTab === 'memorial' && (
              <MemorialPanel 
                onApplyMemorial={handleApplyMemorial}
                isLoading={isLoading}
                suggestions={suggestions}
                isSuggesting={isSuggesting}
                onGenerateSuggestion={() => generateSuggestions(currentImage!, 'memorial')}
              />
            )}
            {activeTab === 'creativeEdit' && (
              <FreeEditPanel 
                onApplyFreeEdit={handleApplyFreeEdit}
                isLoading={isLoading}
                suggestions={suggestions}
                isSuggesting={isSuggesting}
                onGenerateSuggestion={() => generateSuggestions(currentImage!, 'creativeEdit')}
              />
            )}
            {activeTab === 'composite' && (
              <CompositePanel 
                onApplyComposite={handleApplyComposite}
                isLoading={isLoading}
                onGenerateSuggestion={generateCompositeSuggestionsWithBothImages}
                suggestions={suggestions}
                isSuggesting={isSuggesting}
              />
            )}
            {activeTab === 'retouch' && (
              <RetouchPanel 
                onApplyRetouch={handleApplyRetouch}
                isLoading={isLoading}
                suggestions={suggestions}
                isSuggesting={isSuggesting}
                onGenerateSuggestion={() => generateSuggestions(currentImage!, 'retouch')}
              />
            )}
            {activeTab === 'crop' && <CropPanel onApplyCrop={handleApplyCrop} onSetAspect={setAspect} isLoading={isLoading} isCropping={!!completedCrop?.width && completedCrop.width > 0} processingTime={processingTime} formatProcessingTime={formatProcessingTime} />}
            {activeTab === 'restorationStyles' && <RestorationStylesPanel onApplyStyle={handleApplyFilter} isLoading={isLoading} processingTime={processingTime} formatProcessingTime={formatProcessingTime} />}
        </div>
        
        {/* Desktop Toolbar - hidden on mobile */}
        <div className="hidden md:flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6">
            <button 
                onClick={handleUndo}
                disabled={!canUndo}
                className="flex items-center justify-center text-center bg-slate-700/50 border border-slate-600/50 text-slate-200 font-semibold py-2 sm:py-3 px-3 sm:px-5 rounded-lg transition-all duration-300 ease-in-out hover:bg-slate-600/50 hover:border-slate-500/50 hover:scale-105 active:scale-95 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800/30"
                aria-label="Undo last action"
            >
                <UndoIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Undo</span>
            </button>
            <button 
                onClick={handleRedo}
                disabled={!canRedo}
                className="flex items-center justify-center text-center bg-slate-700/50 border border-slate-600/50 text-slate-200 font-semibold py-2 sm:py-3 px-3 sm:px-5 rounded-lg transition-all duration-300 ease-in-out hover:bg-slate-600/50 hover:border-slate-500/50 hover:scale-105 active:scale-95 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800/30"
                aria-label="Redo last action"
            >
                <RedoIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Redo</span>
            </button>
            
            <div className="h-6 w-px bg-slate-600 mx-1 hidden sm:block"></div>

            <button 
                onClick={handleReset}
                disabled={!canUndo}
                className="flex items-center justify-center text-center bg-transparent border border-slate-600/50 text-slate-200 font-semibold py-2 sm:py-3 px-3 sm:px-5 rounded-lg transition-all duration-300 ease-in-out hover:bg-slate-700/30 hover:border-slate-500/50 hover:scale-105 active:scale-95 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent"
              >
                <ResetIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Reset</span>
            </button>
            <button 
                onClick={handleUploadNew}
                className="flex items-center justify-center text-center bg-slate-700/50 border border-slate-600/50 text-slate-200 font-semibold py-2 sm:py-3 px-3 sm:px-5 rounded-lg transition-all duration-300 ease-in-out hover:bg-slate-600/50 hover:border-slate-500/50 hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
                <UploadIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">New Upload</span>
            </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen text-gray-100 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Header
        onLogoClick={handleLogoClick}
      />
      <main className={`flex-grow w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 flex justify-center ${currentImage ? 'items-start' : 'items-center'}`}>
        {renderContent()}
      </main>
      
      {/* Features Section */}
      <section id="features" className="w-full bg-slate-900/50 border-t border-slate-700/50 section-spacing">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-secondary text-white mb-4">
              Professional Photo Restoration Features
            </h2>
            <p className="body-large text-slate-300 max-w-3xl mx-auto">
              Powered by advanced AI technology for stunning photo enhancement results
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 text-center">
              <MagicWandIcon className="w-12 h-12 text-purple-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-white mb-3">Magic Restoration</h3>
              <p className="text-slate-300">
                One-click AI-powered restoration for damaged, faded, or low-quality photos with professional results.
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 text-center">
              <PortraitIcon className="w-12 h-12 text-rose-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-white mb-3">Memorial Restoration</h3>
              <p className="text-slate-300">
                Specialized AI for restoring precious family photos and vintage memories with respectful care.
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 text-center">
              <PencilIcon className="w-12 h-12 text-amber-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-white mb-3">Creative Editing</h3>
              <p className="text-slate-300">
                Transform your photos with AI-powered creative edits, artistic effects, and style transformations.
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 text-center">
              <LayersIcon className="w-12 h-12 text-teal-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-white mb-3">Smart Composite</h3>
              <p className="text-slate-300">
                Advanced AI compositing for seamless photo combinations, background replacements, and scene merging.
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 text-center">
              <RetouchIcon className="w-12 h-12 text-pink-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-white mb-3">Precision Retouch</h3>
              <p className="text-slate-300">
                Remove unwanted objects, fix imperfections, and enhance specific areas with pinpoint accuracy.
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 text-center">
              <SparklesIcon className="w-12 h-12 text-yellow-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-white mb-3">Restoration Styles</h3>
              <p className="text-slate-300">
                Apply professional restoration styles and vintage effects to match different eras and aesthetics.
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 text-center">
              <CropIcon className="w-12 h-12 text-emerald-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-white mb-3">Smart Cropping</h3>
              <p className="text-slate-300">
                Precision cropping tools with aspect ratio presets and real-time preview capabilities.
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 text-center">
              <AdjustIcon className="w-12 h-12 text-blue-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-white mb-3">AI Adjustments</h3>
              <p className="text-slate-300">
                Intelligent brightness, contrast, saturation, and color balance adjustments powered by AI analysis.
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 text-center">
              <EyeIcon className="w-12 h-12 text-cyan-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-white mb-3">Before/After Comparison</h3>
              <p className="text-slate-300">
                Interactive slider and toggle views to compare your original and enhanced photos in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="w-full bg-slate-800/50 border-t border-slate-700/50 section-spacing">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-secondary text-white mb-4">
              About PhotoRestorAI
            </h2>
            <p className="body-large text-slate-300">
              Professional-grade photo restoration made accessible to everyone
            </p>
          </div>
          
          <div className="prose prose-lg prose-invert max-w-none">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8">
              <p className="text-slate-300 mb-6 text-lg leading-relaxed">
                PhotoRestorAI harnesses the power of Google's cutting-edge Gemini AI technology to bring
                professional photo restoration capabilities directly to your browser. Whether you're dealing with
                vintage family photos, damaged images, memorial pictures, or creative projects, our comprehensive 
                suite of AI-powered tools delivers museum-quality results with just a few clicks.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">🤖 Advanced AI Technology</h3>
                  <p className="text-slate-300">
                    Built on Google's Gemini 2.5 Flash model with specialized computer vision capabilities, 
                    optimized for professional photo restoration and creative enhancement tasks.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">🎨 Multiple Restoration Modes</h3>
                  <p className="text-slate-300">
                    From gentle memorial photo restoration to creative artistic transformations, 
                    our AI adapts to different photo types and enhancement goals.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">🔒 Privacy First</h3>
                  <p className="text-slate-300">
                    Your photos are processed securely through Google's AI services with end-to-end encryption 
                    and are not stored or used for training purposes.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">💻 Browser-Based</h3>
                  <p className="text-slate-300">
                    No downloads or installations required. Works seamlessly in your web browser 
                    on desktop, tablet, and mobile devices.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">⚡ Real-Time Processing</h3>
                  <p className="text-slate-300">
                    Get instant results with our optimized processing pipeline, real-time preview capabilities, 
                    and interactive before/after comparisons.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">🎯 Professional Results</h3>
                  <p className="text-slate-300">
                    Industry-standard photo restoration techniques powered by AI, delivering results 
                    comparable to professional photo editing software.
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-xl p-6 mt-8">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <SparklesIcon className="w-6 h-6 text-yellow-400" />
                  What Makes PhotoRestorAI Special?
                </h3>
                <ul className="text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Specialized AI models for different photo types (memorial, creative, technical)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Advanced compositing and object removal capabilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Mobile-optimized interface with floating action buttons and gesture controls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Comprehensive undo/redo system with history tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Professional-grade output quality with customizable enhancement levels</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
      <Analytics />
      
      {/* Removed Login Modal for hackathon version */}
      
      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      
      {/* Processing Overlay */}
      <ProcessingOverlay
        isVisible={isLoading}
        message="Enhancing your image with AI..."
        processingTime={processingTime}
      />
      
      {/* Removed User Quota Manager for hackathon version */}

      {/* Mobile Toolbar - only visible on mobile when image is loaded */}
      <MobileToolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleReset}
        canUndo={canUndo}
        canRedo={canRedo}
        isVisible={!!currentImage && !isLoading}
        isProcessing={isLoading}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppContent />
  );
};

export default App;