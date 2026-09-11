import { fireEvent, screen, waitFor, within } from '@testing-library/svelte'
import { afterEach, expect, test, vi } from 'vitest'
import { enhanceImages } from './images'

let dispose: ReturnType<typeof enhanceImages> | undefined
afterEach(async () => { await dispose?.(); document.body.innerHTML = ''; vi.restoreAllMocks() })

test('enhances linked screenshots with their original source, alt and caption while retaining surrounding prose', async () => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.open = true })
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event('close')) })
  document.body.innerHTML = '<div class="docs-prose"><p>Install the script.</p><p><a href="/docs/images/original.png"><img src="/docs/images/thumbnail.png" alt="Copy the highlighted tracking script."></a></p><p><em>Publish the website.</em></p><p>Then verify collection.</p><p>Keep this inline example <a href="/docs/images/other.png"><img src="/docs/images/other.png" alt="Inline example"></a>.</p></div>'
  expect(document.querySelector('a[href="/docs/images/original.png"]')).not.toBeNull()
  dispose = enhanceImages()
  await fireEvent.click(screen.getByRole('button', { name: 'Enlarge image' }))
  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByRole('img', { name: 'Copy the highlighted tracking script.' }).getAttribute('src')).toMatch(/\/docs\/images\/original\.png$/)
  expect(within(dialog).getByText('Publish the website.')).toBeVisible()
  await fireEvent.click(within(dialog).getByRole('button', { name: 'Close dialog' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(screen.getAllByText('Publish the website.')).toHaveLength(1)
  expect(screen.getByText('Install the script.')).toBeVisible()
  expect(screen.getByText('Then verify collection.')).toBeVisible()
  expect(document.querySelector('a[href="/docs/images/other.png"]')).not.toBeNull()
})
