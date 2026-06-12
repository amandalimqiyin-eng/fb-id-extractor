// content.js — extracts page + post IDs from Facebook DOM

function extractFacebookIDs() {
  const result = { pageId: null, postId: null, method: null }
  const html = document.documentElement.innerHTML
  const url = window.location.href

  // ── 1. Numeric post URL: /123456789/posts/987654321 ─────────────────
  const numericPostUrl = url.match(/facebook\.com\/(\d+)\/posts\/(\d+)/)
  if (numericPostUrl) {
    result.pageId = numericPostUrl[1]
    result.postId = numericPostUrl[2]
    result.method = 'url-numeric'
    return result
  }

  // ── 2. throwback_story_fbid + page_id from same tracking blob ────────
  // In innerHTML the tracking JSON is double-escaped, so both IDs appear as:
  // throwback_story_fbid\":{escaped}\",page_id\":{escaped}\"
  // Using [^\d]+ handles any escaping variant between the key and digits
  const throwbackMatch = html.match(/throwback_story_fbid[^\d]+(\d{10,})/)
  if (throwbackMatch) {
    result.postId = throwbackMatch[1]
    // Grab page_id from within the next 200 chars of the same blob
    const idx = html.indexOf(throwbackMatch[0])
    const chunk = html.substring(idx, idx + 200)
    const pageMatch = chunk.match(/page_id[^\d]+(\d{8,})/)
    if (pageMatch) {
      result.pageId = pageMatch[1]
      result.method = 'throwback_tracking'
      return result
    }
  }

  // ── 3. Fallback: share_fbid for post ID ──────────────────────────────
  const shareFbid = html.match(/"share_fbid"\s*:\s*"(\d{10,})"/)
  if (shareFbid) {
    result.postId = shareFbid[1]
    result.method = 'share_fbid'
  }

  if (!result.postId) {
    const topLevel = html.match(/"top_level_post_id"\s*:\s*"(\d{10,})"/)
    if (topLevel) result.postId = topLevel[1]
  }

  // ── 4. Page ID via delegate_page with is_business_page_active ────────
  const bizPageMatch = html.match(/"delegate_page"\s*:\s*\{\s*"is_business_page_active"\s*:\s*(?:true|false)\s*,\s*"id"\s*:\s*"(\d+)"/)
  if (bizPageMatch) {
    result.pageId = bizPageMatch[1]
    result.method = (result.method || '') + '+delegate_page'
  }

  // Fallback: owning_profile id
  if (!result.pageId) {
    const owningMatch = html.match(/"owning_profile"\s*:\s*\{[^}]*?"id"\s*:\s*"(\d+)"/)
    if (owningMatch) result.pageId = owningMatch[1]
  }

  // Fallback: data-ft attributes
  if (!result.pageId || !result.postId) {
    const dataFtElements = document.querySelectorAll('[data-ft]')
    for (const el of dataFtElements) {
      try {
        const ft = JSON.parse(el.getAttribute('data-ft'))
        if (ft.top_level_post_id && !result.postId) result.postId = String(ft.top_level_post_id)
        if (ft.page_id && !result.pageId) result.pageId = String(ft.page_id)
        if (ft.content_owner_id_new && !result.pageId) result.pageId = String(ft.content_owner_id_new)
        if (result.postId && result.pageId) { result.method = 'data-ft'; break }
      } catch (e) {}
    }
  }

  return result
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractIDs') {
    const ids = extractFacebookIDs()
    sendResponse(ids)
  }
  return true
})
