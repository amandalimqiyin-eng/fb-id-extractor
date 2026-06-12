const main = document.getElementById('main')

function renderNotFacebook() {
  main.innerHTML = `
    <div class="not-fb">
      <strong>Not a Facebook page</strong>
      Navigate to a Facebook post and click this extension to extract the IDs.
    </div>
  `
}

function renderError(msg) {
  main.innerHTML = `
    <div class="content">
      <div class="error">${msg}</div>
    </div>
  `
}

function renderResults(ids, tabUrl) {
  const pageId = ids.pageId || null
  const postId = ids.postId || null
  const combinedUrl = (pageId && postId) ? `http://www.facebook.com/${pageId}_${postId}` : null
  const formattedOutput = combinedUrl ? `metaData.inReplyTo.url:"${combinedUrl}"` : null

  main.innerHTML = `
    <div class="content">
      <div class="field">
        <div class="label">Page ID</div>
        <div class="value-row">
          <span class="value ${!pageId ? 'empty' : ''}" id="pageId">${pageId || 'Not found'}</span>
          <button class="copy-btn" id="copyPage" ${!pageId ? 'disabled' : ''}>Copy</button>
        </div>
      </div>

      <div class="field">
        <div class="label">Post ID</div>
        <div class="value-row">
          <span class="value ${!postId ? 'empty' : ''}" id="postId">${postId || 'Not found'}</span>
          <button class="copy-btn" id="copyPost" ${!postId ? 'disabled' : ''}>Copy</button>
        </div>
      </div>

      <div class="divider"></div>

      <div class="field full-url">
        <div class="label">Combined URL</div>
        <div class="value-row">
          <span class="value ${!formattedOutput ? 'empty' : ''}" id="combinedUrl">
            ${formattedOutput || (pageId && !postId ? 'Post ID not found' : (!pageId && postId ? 'Page ID not found' : 'IDs not found — try scrolling the post into view'))}
          </span>
          <button class="copy-btn" id="copyUrl" ${!formattedOutput ? 'disabled' : ''}>Copy</button>
        </div>
      </div>

      ${formattedOutput ? `
        <button class="copy-all-btn" id="copyAll">Copy Combined URL</button>
      ` : ''}
    </div>
  `

  // Wire up copy buttons
  function makeCopy(btnId, value) {
    const btn = document.getElementById(btnId)
    if (!btn || !value) return
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(value).then(() => {
        btn.textContent = '✓'
        btn.classList.add('copied')
        setTimeout(() => {
          btn.textContent = 'Copy'
          btn.classList.remove('copied')
        }, 1500)
      })
    })
  }

  makeCopy('copyPage', pageId)
  makeCopy('copyPost', postId)
  makeCopy('copyUrl', formattedOutput)

  const copyAll = document.getElementById('copyAll')
  if (copyAll && formattedOutput) {
    copyAll.addEventListener('click', () => {
      navigator.clipboard.writeText(formattedOutput).then(() => {
        copyAll.textContent = '✓ Copied!'
        copyAll.classList.add('copied')
        setTimeout(() => {
          copyAll.textContent = 'Copy Combined URL'
          copyAll.classList.remove('copied')
        }, 1500)
      })
    })
  }
}

// Main logic
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0]
  if (!tab || !tab.url) {
    renderNotFacebook()
    return
  }

  const isFacebook = tab.url.includes('facebook.com')
  if (!isFacebook) {
    renderNotFacebook()
    return
  }

  chrome.tabs.sendMessage(tab.id, { action: 'extractIDs' }, (response) => {
    if (chrome.runtime.lastError) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      }, () => {
        chrome.tabs.sendMessage(tab.id, { action: 'extractIDs' }, (response2) => {
          if (chrome.runtime.lastError || !response2) {
            renderError('Could not read the page. Try refreshing the Facebook page and trying again.')
            return
          }
          renderResults(response2, tab.url)
        })
      })
      return
    }
    if (!response) {
      renderError('Could not read the page. Try refreshing the Facebook page and trying again.')
      return
    }
    renderResults(response, tab.url)
  })
})
