/**
 * ImgBB Image Upload Client (Free Image Hosting Tier)
 */

export interface ImgBBUploadResponse {
  success: boolean;
  url?: string;
  displayUrl?: string;
  deleteUrl?: string;
  error?: string;
}

export async function uploadImageToImgBB(fileOrBase64: File | string): Promise<ImgBBUploadResponse> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || process.env.IMGBB_API_KEY;

  if (!apiKey || apiKey === 'your-imgbb-api-key') {
    // Graceful fallback for local development: if image is File, convert to data URL
    if (typeof fileOrBase64 === 'string') {
      return {
        success: true,
        url: fileOrBase64,
        displayUrl: fileOrBase64,
      };
    } else {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            success: true,
            url: reader.result as string,
            displayUrl: reader.result as string,
          });
        };
        reader.readAsDataURL(fileOrBase64);
      });
    }
  }

  try {
    const formData = new FormData();
    formData.append('image', fileOrBase64);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.status === 200 && data.data) {
      return {
        success: true,
        url: data.data.url,
        displayUrl: data.data.display_url,
        deleteUrl: data.data.delete_url,
      };
    } else {
      return {
        success: false,
        error: data.error?.message || 'ImgBB upload failed',
      };
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error uploading to ImgBB',
    };
  }
}
