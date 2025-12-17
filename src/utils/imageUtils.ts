export const getProxiedUrl = (url: string) => {
  if (!url) return "";
  
  console.log("getProxiedUrl: Processing URL:", url);
  
  // Check if it's a Google Drive share link
  if (url.includes("drive.google.com") && (url.includes("/file/d/") || url.includes("id="))) {
    // Extract file ID
    let fileId = "";
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      fileId = match[1];
    } else {
      const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        fileId = idMatch[1];
      }
    }
    
    if (fileId) {
      // Use lh3.googleusercontent.com which serves the image directly without redirects
      // This is the most reliable method for public Drive files
      const proxiedUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
      console.log("getProxiedUrl: Converted to:", proxiedUrl);
      return proxiedUrl;
    } else {
      console.log("getProxiedUrl: Could not extract file ID from URL");
    }
  }
  
  // Check if it's already a Googleusercontent URL (direct image link)
  if (url.includes("lh3.googleusercontent.com") || url.includes("lh4.googleusercontent.com") || url.includes("lh5.googleusercontent.com") || url.includes("lh6.googleusercontent.com")) {
    console.log("getProxiedUrl: Already a direct Google image URL");
    return url;
  }
  
  // Check if it's a direct image URL (ends with image extension)
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const isDirectImage = imageExtensions.some(ext => url.toLowerCase().includes(ext));
  
  if (isDirectImage) {
    console.log("getProxiedUrl: Direct image URL detected");
    return url;
  }
  
  console.log("getProxiedUrl: Returning original URL");
  return url;
};
