import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  const isIconCards = block.classList.contains('icon');
  const isArticleCards = block.classList.contains('articles');

  async function fetchJson(link) {
    const response = await fetch(link?.href);

    if (response.ok) {
      const jsonData = await response.json();
      const data = jsonData?.data;
      return data;
    }
    return 'an error occurred';
  }

  const ul = document.createElement('ul');

  if (isIconCards) {
    [...block.children].forEach((row) => {
      const anchor = document.createElement('a');
      anchor.href = '';
      const li = document.createElement('li');
      while (row.firstElementChild) li.append(row.firstElementChild);
      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('a')) {
          const linkURL = div.querySelector('a').innerHTML;
          anchor.href = linkURL;
          div.className = 'cards-hide-markdown';
        } else if (div.children.length === 1 && div.querySelector('picture')) {
          div.className = 'cards-card-image';
        } else if (div.children.length === 1 && div.querySelector('span')) {
          div.className = 'cards-card-icon';
        } else {
          div.className = 'cards-card-body';
        }
      });
      anchor.append(li);
      ul.append(anchor);
    });
  }

  if (isArticleCards) {
    const link = block.querySelector('a');
    const cardData = await fetchJson(link);
    cardData.forEach((item) => {
      const picture = createOptimizedPicture(item.AccountLogoURL, item.Opportunity, false, [{ width: 320 }]);
      picture.lastElementChild.width = '320';
      picture.lastElementChild.height = '180';
      const createdCard = document.createElement('li');
      createdCard.innerHTML = `
        <div class="cards-card-image">
          <div data-align="center">${picture.outerHTML}</div>
        </div>
        <div class="cards-card-body">
          <h5>${item.Opportunity}</h5>
          <p class="button-container">
            <a href="${item.DemoURL}" aria-label="${item['anchor-text']}" title="${item['anchor-text']}" class="button">
              Go to Demo
            </a>
          </p>
        </div>
      `;
      ul.append(createdCard);
    });
  }

  block.textContent = '';
  block.append(ul);
}