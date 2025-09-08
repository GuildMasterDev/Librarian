#!/bin/bash

# Create a base icon using ImageMagick
# This creates a book-themed icon for the Librarian app

# Create base icon with book symbol
convert -size 1024x1024 xc:none \
    -fill "gradient:#667eea-#764ba2" \
    -draw "roundrectangle 0,0 1024,1024 100,100" \
    -gravity center \
    -fill white \
    -font Helvetica-Bold \
    -pointsize 500 \
    -annotate +0+0 "📚" \
    assets/icon-base.png

# Generate different sizes for macOS
convert assets/icon-base.png -resize 16x16 assets/icon-16.png
convert assets/icon-base.png -resize 32x32 assets/icon-32.png
convert assets/icon-base.png -resize 64x64 assets/icon-64.png
convert assets/icon-base.png -resize 128x128 assets/icon-128.png
convert assets/icon-base.png -resize 256x256 assets/icon-256.png
convert assets/icon-base.png -resize 512x512 assets/icon-512.png
convert assets/icon-base.png -resize 1024x1024 assets/icon-1024.png

# Create standard icon.png
cp assets/icon-512.png assets/icon.png

# Create Windows ICO file
convert assets/icon-16.png assets/icon-32.png assets/icon-64.png assets/icon-128.png assets/icon-256.png assets/icon.ico

# Create macOS ICNS file (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Create iconset directory
    mkdir -p assets/icon.iconset
    
    # Copy icons with correct naming for iconset
    cp assets/icon-16.png assets/icon.iconset/icon_16x16.png
    cp assets/icon-32.png assets/icon.iconset/icon_16x16@2x.png
    cp assets/icon-32.png assets/icon.iconset/icon_32x32.png
    cp assets/icon-64.png assets/icon.iconset/icon_32x32@2x.png
    cp assets/icon-128.png assets/icon.iconset/icon_128x128.png
    cp assets/icon-256.png assets/icon.iconset/icon_128x128@2x.png
    cp assets/icon-256.png assets/icon.iconset/icon_256x256.png
    cp assets/icon-512.png assets/icon.iconset/icon_256x256@2x.png
    cp assets/icon-512.png assets/icon.iconset/icon_512x512.png
    cp assets/icon-1024.png assets/icon.iconset/icon_512x512@2x.png
    
    # Generate ICNS file
    iconutil -c icns assets/icon.iconset -o assets/icon.icns
    
    # Clean up iconset directory
    rm -rf assets/icon.iconset
fi

echo "Icons generated successfully!"
echo "Generated files:"
ls -la assets/*.png assets/*.ico assets/*.icns 2>/dev/null