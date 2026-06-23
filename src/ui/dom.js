/**
 * Mini-ayudantes para crear DOM sin librerías. `el` cubre el 95% de los casos.
 */

/**
 * Crea un elemento.
 * @param {string} tag
 * @param {Object} [attrs]  Atributos. Claves especiales:
 *   - class: className
 *   - text: textContent
 *   - html: innerHTML
 *   - style: atributo style (string)
 *   - dataset: objeto -> data-*
 *   - onX: addEventListener('x', fn)  (ej. onClick)
 * @param {(Node|string|null)[]|Node|string|null} [children]
 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else {
      node.setAttribute(k, v);
    }
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

/** Reemplaza el contenido de `root` por `node`. */
export function mount(root, node) {
  root.replaceChildren(node);
}
