# FB ID Extractor

A Chrome extension that extracts the **Page ID** and **Post ID** from any Facebook post and generates a combined URL in the format:

```
http://www.facebook.com/PAGEID_POSTID
```

![FB ID Extractor](icon128.png)

## Installation

1. Download or clone this repo
   ```bash
   git clone https://github.com/amandalimqiyin-eng/fb-id-extractor.git
   ```

2. Open Chrome and go to `chrome://extensions`

3. Enable **Developer mode** (toggle in the top right)

4. Click **Load unpacked** and select the cloned/downloaded folder

5. The extension icon will appear in your Chrome toolbar

## Usage

1. Navigate to any Facebook post (e.g. `https://www.facebook.com/pagename/posts/pfbid...`)
2. Click the **FB ID Extractor** icon in your toolbar
3. The extension will display:
   - **Page ID** — the numeric ID of the Facebook page
   - **Post ID** — the numeric ID of the post
   - **Combined URL** — ready to copy and use

## Example

| Field | Value |
|-------|-------|
| Post URL | `https://www.facebook.com/asiaonecom/posts/pfbid0CuE5k...` |
| Page ID | `121790674546188` |
| Post ID | `1428516925967455` |
| Combined URL | `http://www.facebook.com/121790674546188_1428516925967455` |

## Files

| File | Description |
|------|-------------|
| `manifest.json` | Chrome extension manifest (MV3) |
| `content.js` | ID extraction logic injected into Facebook pages |
| `popup.html` | Extension popup UI |
| `popup.js` | Popup logic and copy functionality |
| `icon16/48/128.png` | Extension icons |

## Notes

- Works on `pfbid`-style post URLs (the modern Facebook URL format)
- Also works on numeric post URLs (`/123456789/posts/987654321`)
- Requires the page to be fully loaded before extracting
