import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'


const uploadOnCloudinary = async (filePath) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    try {
        if(!filePath){
        return null
    }

    // Check if file exists before uploading
    if (!fs.existsSync(filePath)) {
        console.log(`File does not exist: ${filePath}`)
        return null
    }

    const uploadResult = await cloudinary.uploader.upload(filePath)

    // Safely delete the file after successful upload
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
    } catch (deleteError) {
        console.log(`Error deleting file ${filePath}:`, deleteError)
    }

    return uploadResult.secure_url


    } catch (error) {
        console.log('Cloudinary upload error:', error)

        // Try to delete the file even if upload failed
        try {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
        } catch (deleteError) {
            console.log(`Error deleting file after failed upload ${filePath}:`, deleteError)
        }

        return null
    }

}
export default uploadOnCloudinary