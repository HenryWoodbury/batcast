import { customAlphabet } from 'nanoid'
import { renderElement } from '../lib/renders';
import { show, hide } from '../lib/utilities'; 
import { 
  TooltipDefinition, 
  ElementDefinition,
} from '../lib/types';

const nanoCustomId = customAlphabet('1234567890abcdef', 16);

export const tooltip = (el: TooltipDefinition) => {
  const css = el.css ? [ ...el.css, 'tooltip-wrapper'] : ['tooltip-wrapper'];
  const iconType = el.type ? el.type : 'info';
  const iconLook = el.look ? el.look : 'hollow';
  const iconShape = el.shape ? el.shape : 'round';
  const txt = iconType === 'error' ? '!' : iconType === 'question' ? '?' : 'i';
  const uuid = el.id ? el.id : nanoCustomId();
  const tooltipIcon: ElementDefinition = {
    tag: 'a',
    attr: [
      { name: 'role', value: 'button' },
    ],
    css: ['icon', 'tooltip-icon', iconLook, iconType, iconShape],
    text: txt,
    id: `${uuid}Icon`,
  };
  const tooltip: ElementDefinition = {
    tag: 'span',
    css: css,
    id: uuid,
    attr: [
      { name: 'data-tooltip', value: el.tooltip }
    ],
    children: [tooltipIcon],
  }
  renderTooltipPop(`${uuid}IconPop`, el.tooltip);
  return tooltip;
}

const renderTooltipPop = (id: string, tooltip: string) => {
  const toolTipPop: ElementDefinition = {
    tag: 'span',
    css: ['tooltip-pop', 'hide'],
    id: id,
    text: tooltip,
  }
  const ttp = renderElement(toolTipPop);
  const main = document.getElementById('main');
  main.append(ttp);
  return ttp;
}

export const renderPreviewTooltips = (previewId: string) => {
  const tooltips = document.querySelectorAll(`#${previewId} .tooltip-wrapper`);
  tooltips.forEach(tt => {
    const iconElement = tt.firstElementChild;
    if (iconElement) {
      const tooltip = tt.getAttribute('data-tooltip');
      const newId = nanoCustomId();
      iconElement.setAttribute('id', `${newId}Icon`);
      tt.setAttribute('id', newId);
      renderTooltipPop(`${newId}IconPop`, tooltip);
    } else {
      tt.remove();
    }
  });

}

const clamp = (left: number, minLeft: number, maxLeft: number) => {
  if (left < minLeft) return minLeft;
  return left;
}

/*
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );

    The document element's Element.clientWidth is the inner width of a document in CSS pixels, 
    including padding (but not borders, margins, or vertical scrollbars, if present). This is 
    the viewport width.

}
*/

export const activateTooltips = (parentId: string) => {
  const tooltips = document.querySelectorAll(`#${parentId} .tooltip-wrapper`);
  let to: NodeJS.Timeout;
  let hidingTooltipId = '';
  tooltips.forEach(tooltip => {
    const tooltipIcon = document.getElementById(`${tooltip.id}Icon`);
    tooltipIcon.addEventListener('mouseover', (event) => {
      event.preventDefault();
      if (event.target instanceof Element) {
        clearTimeout(to);
        const icon = event.target;
        if (hidingTooltipId && hidingTooltipId !== `${icon.id}Pop`) {
          const lastTooltip = document.getElementById(hidingTooltipId);
          if (lastTooltip) {
            hide(lastTooltip);
          }
          hidingTooltipId = '';
        }
        const tooltip = document.getElementById(`${icon.id}Pop`);
        const x = icon.getBoundingClientRect().left + window.scrollX;
        const y = tooltipIcon.getBoundingClientRect().top + window.scrollY + 24;
        tooltip.style.top = `${y}px`;
        tooltip.classList.add('reveal');
        show(tooltip);
        const w = tooltip.getBoundingClientRect().width;
        const offsetLeft = clamp(x + 12 - w / 2, window.scrollX, document.documentElement.clientWidth + window.scrollX + 12 - w / 2);
        tooltip.style.left = `${offsetLeft}px`;
      }
    });
    tooltipIcon.addEventListener('mouseout', (event) => {
      event.preventDefault();
      if (event.target instanceof Element) {
        const icon = event.target;
        hidingTooltipId = `${icon.id}Pop`;
        const tooltip = document.getElementById(hidingTooltipId);
        tooltip.classList.remove('reveal');
        // figure out way to clear timeouts on quick actions?
        to = setTimeout(() => { 
          hide(tooltip);
          hidingTooltipId = '';
        }, 500);
      }
     });
  });
}
