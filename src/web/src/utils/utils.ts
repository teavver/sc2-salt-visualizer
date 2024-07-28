import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cl = clsx
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

// Auto-scrolling other containers
export const isElementVisible = (elem: Element, excludeElem: Element) => {
    let parent: Element | null = elem.parentElement
    while (parent) {
        if (parent === document.body) break
        if (parent.scrollHeight > parent.clientHeight) {
            if (parent.contains(excludeElem)) {
                return true // Skip scrolling if within the same container (super annoying)
            }
            const parentRect = parent.getBoundingClientRect()
            const elemRect = elem.getBoundingClientRect()
            if (
                elemRect.top >= parentRect.top &&
                elemRect.bottom <= parentRect.bottom &&
                elemRect.left >= parentRect.left &&
                elemRect.right <= parentRect.right
            ) {
                return true
            }
            return false
        }
        parent = parent.parentElement
    }
    return true
}