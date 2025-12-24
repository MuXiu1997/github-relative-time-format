let activeResolve: ((value: string | null) => void) | null = null

/**
 * Show a GitHub-style modal for option editing
 */
export async function showOptionModal(
  title: string,
  currentValue: string,
  type: 'text' | 'boolean',
): Promise<string | null> {
  // 0. Ensure single instance: close any existing GRTF modal
  if (activeResolve) {
    activeResolve(null)
    activeResolve = null
  }

  const existingDialog = document.querySelector('dialog[data-grtf-modal]') as HTMLDialogElement
  if (existingDialog) {
    existingDialog.close()
    existingDialog.remove()
  }

  return new Promise((resolve) => {
    activeResolve = resolve

    // 1. Create Dialog element
    const dialog = document.createElement('dialog')
    dialog.dataset.grtfModal = ''
    dialog.className = 'Box Box--overlay d-flex flex-column anim-fade-in fast'

    // Simple reset and base styles for the dialog
    dialog.style.cssText = `
      width: 448px;
      padding: 0;
      border: 1px solid var(--color-border-default, #30363d);
      border-radius: 6px;
      background-color: var(--bgColor-default, var(--color-canvas-overlay, #161b22));
      color: var(--color-fg-default, #c9d1d9);
      box-shadow: var(--color-shadow-large, 0 8px 24px rgba(1, 4, 9, 0.2));
      position: fixed;
      top: 10%;
      left: 50%;
      transform: translateX(-50%);
      margin: 0;
      display: flex;
    `

    // 2. Build internal structure
    const isBoolean = type === 'boolean'
    const isChecked = currentValue === 'true'

    dialog.innerHTML = `
      <div class="Box-header d-flex flex-items-center">
        <h3 class="Box-title flex-auto">${title}</h3>
        <button class="btn-octicon" type="button" id="modal-close" aria-label="Close">
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path></svg>
        </button>
      </div>
      <div class="Box-body">
        ${isBoolean
            ? `
          <div class="form-checkbox">
            <label>
              <input type="checkbox" id="modal-input" ${isChecked ? 'checked' : ''}>
              Enable
            </label>
          </div>
          `
            : `
          <input type="text" id="modal-input" class="form-control input-block" value="${currentValue}" spellcheck="false">
          `
        }
      </div>
      <div class="Box-footer text-right">
        <button class="btn btn-secondary mr-2" type="button" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" type="button" id="modal-save">Save</button>
      </div>
    `

    // Inject Backdrop style if not present (to handle the standard dialog backdrop)
    if (!document.getElementById('grtf-modal-style')) {
      const style = document.createElement('style')
      style.id = 'grtf-modal-style'
      style.textContent = `
        dialog[data-grtf-modal]::backdrop {
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(2px);
        }
        dialog[data-grtf-modal] {
          background-color: var(--bgColor-default, var(--color-canvas-overlay, #161b22)) !important;
        }
      `
      document.head.appendChild(style)
    }

    document.body.appendChild(dialog)
    dialog.showModal()

    // 3. Event Handling
    const input = dialog.querySelector('#modal-input') as HTMLInputElement
    const close = () => {
      activeResolve = null
      dialog.close()
      document.body.removeChild(dialog)
    }

    dialog.querySelector('#modal-save')?.addEventListener('click', () => {
      const result = isBoolean ? (input.checked ? 'true' : 'false') : input.value
      const resolveFn = resolve
      close()
      resolveFn(result)
    })

    dialog.querySelector('#modal-cancel')?.addEventListener('click', () => {
      const resolveFn = resolve
      close()
      resolveFn(null)
    })

    dialog.querySelector('#modal-close')?.addEventListener('click', () => {
      const resolveFn = resolve
      close()
      resolveFn(null)
    })

    // Handle ESC key (built-in dialog 'cancel' event)
    dialog.addEventListener('cancel', () => {
      activeResolve = null
      document.body.removeChild(dialog)
      resolve(null)
    })

    // Auto-focus logic
    setTimeout(() => {
      if (isBoolean) {
        input.focus()
      }
      else {
        input.focus()
        input.select()
      }
    }, 0)
  })
}
