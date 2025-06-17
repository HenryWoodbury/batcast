import { type ElementDefinition } from './types.ts';

// TODO: Handle SVG attributes. Using <img with a data-url or css with a background 
// data-url may be more efficient than creating SVG elements
const xmlNS = "http://www.w3.org/2000/svg";

export const renderElement = (el: ElementDefinition) => {
  const domEl = el.tag === 'svg' 
    ? document.createElementNS(xmlNS, el.tag)
    : document.createElement(el.tag);
  if (el.css) {
    const validCss = el.css.filter(v => !!v);
    domEl.classList.add(...validCss);
  }
  if (el.id)
    domEl.id = el.id;
  if (el.text)
    domEl.append(document.createTextNode(el.text));
  if (el.attr) {
    const validAttr = el.attr.filter(v => v.name && v.value);
    validAttr.forEach(attr => {
      domEl.setAttribute(attr.name, attr.value || '');
    });
  }
  if (el.style) {
    domEl.style.display = el.style.display;
    domEl.style.color = el.style.color;
    domEl.style.borderColor = el.style.borderColor;
    domEl.style.backgroundColor = el.style.backgroundColor;
  }
  return domEl;
}

export const renderTree = (elDef: ElementDefinition) => {
  const parentEl = renderElement(elDef);
  return renderDeep(parentEl, elDef);
}

export const renderDeep = (parentEl: HTMLElement | SVGElement, elDef: ElementDefinition) => {
  if (elDef.children) {
    elDef.children.forEach(child => {
      const childEl = renderElement(child);
      parentEl.append(childEl);
      if (child.children) {
        renderDeep(childEl, child);
      }
    });
  }
  return parentEl;
}
