# Image Setup Instructions

## Required Images

To complete the setup, you need to add these images to your `public` folder:

### 1. Logo Images
- **File**: `public/logo-dms-mehedi.png`
- **Description**: Your main DMS logo with the arrow (as shown in the image)
- **Size**: Recommended 200x200px or higher
- **Format**: PNG with transparent background

### 2. Profile Images
- **File**: `public/profile-main.jpg`
- **Description**: Your professional headshot (main profile image)
- **Size**: Recommended 400x400px or higher
- **Format**: JPG

- **File**: `public/profile-secondary.jpg`
- **Description**: Your professional portrait with suit (secondary profile image)
- **Size**: Recommended 400x400px or higher
- **Format**: JPG

### 3. Project Images (Optional)
- `public/project-chat.jpg` - Real-time chat system screenshot
- `public/project-ai.jpg` - AI-powered portfolio screenshot
- `public/project-strategy.jpg` - Digital strategy platform screenshot

### 4. Testimonial Images (Optional)
- `public/testimonial-1.jpg` - Sarah Johnson avatar
- `public/testimonial-2.jpg` - Michael Chen avatar
- `public/testimonial-3.jpg` - Emily Rodriguez avatar

### 5. SEO Image (Optional)
- `public/og-image.jpg` - Open Graph image for social sharing

## How to Add Images

1. **Create the public folder** if it doesn't exist:
   ```bash
   mkdir public
   ```

2. **Add your images** to the public folder with the exact filenames listed above

3. **Update image paths** in `src/lib/assets.ts` if you use different filenames

## Current Status

✅ **Assets file created** - `src/lib/assets.ts`
✅ **Home section updated** - Uses assets for content and profile image
✅ **About section updated** - Uses assets for content and profile image  
✅ **Navbar updated** - Uses assets for logo and navigation links
✅ **Supabase integration** - Real-time chat system working
✅ **Firebase removed** - Only Supabase for chat functionality

## Next Steps

1. Add your images to the `public` folder
2. Test the application with `pnpm dev`
3. Verify all images load correctly
4. Update any content in `src/lib/assets.ts` as needed

## Environment Variables

Make sure you have these in your `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
