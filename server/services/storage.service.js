const cloudinary = require('../config/cloudinary');
const config = require('../config');

/**
 * Abstracted storage service.
 * Currently uses Cloudinary, but the interface allows swapping providers.
 */
class StorageService {
  /**
   * Upload a file buffer to cloud storage.
   * @param {Buffer} fileBuffer - The file data
   * @param {Object} options - Upload options
   * @param {string} options.folder - Folder name in cloud storage
   * @param {string} options.publicId - Optional custom public ID
   * @returns {Promise<{url: string, publicId: string}>}
   */
  async upload(fileBuffer, options = {}) {
    const { folder = 'v3classes', publicId } = options;

    // Check if Cloudinary is configured
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey) {
      // Fallback: return a placeholder URL in development
      console.warn('[StorageService] Cloudinary not configured. Using placeholder URL.');
      return {
        url: `https://via.placeholder.com/400x300?text=${encodeURIComponent(folder)}`,
        publicId: `placeholder_${Date.now()}`,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder,
        resource_type: 'auto',
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Delete a file from cloud storage.
   * @param {string} publicId - The public ID of the file to delete
   * @returns {Promise<void>}
   */
  async delete(publicId) {
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey) {
      console.warn('[StorageService] Cloudinary not configured. Skipping delete.');
      return;
    }

    await cloudinary.uploader.destroy(publicId);
  }

  /**
   * Upload from a file path (for local files).
   * @param {string} filePath - Local file path
   * @param {Object} options - Upload options
   * @returns {Promise<{url: string, publicId: string}>}
   */
  async uploadFromPath(filePath, options = {}) {
    const { folder = 'v3classes' } = options;

    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey) {
      console.warn('[StorageService] Cloudinary not configured. Using placeholder URL.');
      return {
        url: `https://via.placeholder.com/400x300?text=${encodeURIComponent(folder)}`,
        publicId: `placeholder_${Date.now()}`,
      };
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }
}

module.exports = new StorageService();
