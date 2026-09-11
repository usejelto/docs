const navigationStorageKey = 'jelto.docs.openCategories'

// A guide navigation reloads the shell. Keep each disclosure independent and
// share its state between the desktop and mobile copies within this tab.
export function rememberNavigationGroups() {
  const groups = new Map<string, HTMLDetailsElement[]>()
  for (const element of document.querySelectorAll<HTMLDetailsElement>('.docs-sidebar .nav-group[data-nav-group]')) {
    const id = element.dataset.navGroup
    if (!id) continue
    groups.set(id, [...(groups.get(id) ?? []), element])
  }

  let open = new Set([...groups].filter(([, copies]) => copies.some((element) => element.open)).map(([id]) => id))
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(navigationStorageKey) ?? 'null')
    if (Array.isArray(saved) && saved.every((id) => typeof id === 'string')) {
      open = new Set(saved.filter((id) => groups.has(id)))
    }
  } catch { /* Native navigation remains usable when storage is unavailable. */ }

  for (const [id, copies] of groups) {
    if (copies.some((element) => element.querySelector('[aria-current="page"]'))) open.add(id)
    for (const element of copies) element.open = open.has(id)
  }

  const save = () => {
    try { sessionStorage.setItem(navigationStorageKey, JSON.stringify([...open])) }
    catch { /* Remember state in the current page even when storage is disabled. */ }
  }
  save()

  const cleanup: (() => void)[] = []
  for (const [id, copies] of groups) {
    for (const element of copies) {
      const onToggle = () => {
        if (open.has(id) === element.open) return
        if (element.open) open.add(id)
        else open.delete(id)
        for (const copy of copies) copy.open = element.open
        save()
      }
      element.addEventListener('toggle', onToggle)
      cleanup.push(() => element.removeEventListener('toggle', onToggle))
    }
  }
  return () => { for (const remove of cleanup) remove() }
}

// Keep existing /docs/#category links useful when the directory is collapsed.
export function revealDirectoryTarget() {
  let id: string
  try { id = decodeURIComponent(window.location.hash.slice(1)) } catch { return }
  const target = document.getElementById(id)
  if (target instanceof HTMLDetailsElement && target.classList.contains('directory-group')) {
    target.open = true
  }
}
