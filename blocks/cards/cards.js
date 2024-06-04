import { createOptimizedPicture } from '../../scripts/aem.js';
import { formatDate } from './helper-functions.js';

export default function CardsPortfolio (block) {
  const link = block.querySelector('a');
  let data = [];

  block.textContent = '';

  function createCards(groups) {  
    const updatedCards = [];
  
    const createCardHTML = (item, isFeatured) => {
      const optimizedDemoImage = createOptimizedPicture(item.AccountLogoURL, item.Opportunity, true, [{ width: '350' }]);
      return `
        <div class="small-card">
          <div class="card-flip wrapper">
            <div class="card card-images ${isFeatured ? 'featured' : ''}">
              ${isFeatured ? '<span>Featured</span>' : ''}
              <a class="demo-title" href="${item.DemoURL}" target="_blank">${item.Opportunity}</a>
              ${optimizedDemoImage.outerHTML}
            </div>
            <div class="card card-info">
              <div class="date-live-wrapper">
                <span>${formatDate(item.Added)}</span>
                <span>XSC: ${item.XSC}</span>
              </div>
              <div class="github-drive-wrapper">
                ${item.DemoGit ? 
                `<div class="icon">
                  <a class="github-link" href="${item.DemoGit} target="_blank""><img src="/icons/github-logo.svg" alt="GitHub Logo"/></a>
                </div>`
                : ""}
              </div>
              <div class="site-xsc-wrapper">
                <a class="demo-site-link" href="${item.DemoURL}">Live Demo Site</a>
              </div>
            </div>
          </div>
        </div>
      `;
    };
    
    groups.forEach((group) => {
      group.forEach((item) => {
        const isFeatured = item.Featured === 'true';
        updatedCards.push(createCardHTML(item, isFeatured));
      });
    });
  
    block.innerHTML = `<div class="portfolio-card-container"><div class="small-card-container">${updatedCards.join('')}</div></div>`;
  
    // Add card-flip animation
    const cards = document.querySelectorAll('.card-flip');
    [...cards].forEach((card) => {
      card.addEventListener('click', function() {
        card.classList.toggle('is-flipped');
      });
  
      // Prevent the card from flipping when clicking on a link or button
      const linksAndButtons = card.querySelectorAll('a, button');
      [...linksAndButtons].forEach((el) => {
        el.addEventListener('click', (event) => {
          event.stopPropagation();
        });
      });
    });
  }

  function sortData(data) {
    let result = [];
    let temp = [];
  
    for (let i = 0; i < data.length; i++) {
      temp.push(data[i]);
      if (temp.length === 8) { //groups of 8
        result.push(temp);
        temp = [];
      }
    }
  
    if (temp.length > 0) {
      result.push(temp);
    }
  
    return result;
  }

  async function initialize() {
    const response = await fetch(link?.href);

    if (response.ok) {
      const jsonData = await response.json();
      data = jsonData?.data;
      
      let sortedGroups = sortData(data);
      createCards(sortedGroups);
    } else {
      console.log("Unable to get json data for cards portfolio");
    }
  }

  initialize();
}