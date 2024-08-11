# Flipping Book Downloader
This repository contains a simple script for downloading a FlippingBook's book pages as images, which are then save to the local disk. 

## How does it work?
It works by taking a public FlippingBook link, which must have public access through the internet, and making calls to its API to fetch the pages metadata, form the appropiate pages link, and then downloading each image and saving the files to the local disk.

The necessary steps needed to run the script are:

1. Copy the `.env.sample` file to a `.env` file.
2. Fill the `BASE_URL` environment variable with the base URL of the cover page of the book.
3. Replace the `IMAGES_FOLDER` environment variable with the route to the folder where the images must be saved.
4. Run the script with `node ./index.js`

Example of a functional `.env` file:
```
IMAGES_FOLDER=./pages
BASE_URL=https://hgpdvol1.academiadominicanahistoria.org.do
```

The _(hopefully)_ end result is a folder with the images corresponding to all the pages of the published book