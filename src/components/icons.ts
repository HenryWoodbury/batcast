import { ElementDefinition, IconDefinition } from "../lib/types";

export const iconButton = (el: IconDefinition) => {
  const iconEl: ElementDefinition = {
    tag: 'span',
    css: [`batcast-icon-button-icon`, `batcast-${el.name}`]
  }
  const css = el.css ? [ ...el.css, `batcast-wrapper-${el.name}`, 'batcast-icon-button'] : [`batcast-wrapper-${el.name}`, 'batcast-icon-button'];
  const baseAttr = [
    { name: 'role', value: 'button' },
    { name: 'aria-label', value: el.label },
    { name: 'data-name', value: el.name }
  ];
  if (el.attr) {
    baseAttr.push(...el.attr);
  }
  const iconButton: ElementDefinition = {
    tag: 'a',
    attr: baseAttr,
    children: [ iconEl ],
    css: css
  };
  return iconButton;
}

