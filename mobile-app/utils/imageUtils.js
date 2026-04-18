export const getProxiedUrl = (url) => {
  if (!url) return "";
  
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
      return proxiedUrl;
    }
  }
  
  // Check if it's already a Googleusercontent URL (direct image link)
  if (url.includes("lh3.googleusercontent.com") || url.includes("lh4.googleusercontent.com") || url.includes("lh5.googleusercontent.com") || url.includes("lh6.googleusercontent.com")) {
    return url;
  }
  
  return url;
};
