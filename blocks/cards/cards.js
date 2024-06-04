import { createOptimizedPicture } from '../../scripts/aem.js';

export default function CardsPortfolio (block) {
  const link = block.querySelector('a');
  let data = [];

  block.textContent = '';

  function createCards(groups) {  
    const updatedCards = [];
  
    groups.forEach((group) => {
      group.forEach((item, i) => {
        const optimizedDemoImage = createOptimizedPicture(item.AccountLogoURL, item.Opportunity, true, [{ width: '350' }]);
  
        if (item.Featured === 'true') {
          updatedCards.push(`
            <div class="small-card">
              <div class="card-flip wrapper">
                <div class="card card-images featured">
                  <span>Featured</span>
                  <div class="demo-title">${item.Opportunity}</div>
                  ${optimizedDemoImage.outerHTML}
                </div>
                <div class="card card-info">
                  <a class="demo-site-link" href="${item.DemoURL}">Demo Site</a>
                </div>
              </div>
            </div>
          `);
        } else {
          updatedCards.push(`
            <div class="small-card">
              <div class="card-flip wrapper">
                <div class="card card-images">
                  <div class="demo-title">${item.Opportunity}</div>
                  ${optimizedDemoImage.outerHTML}
                </div>
                <div class="card card-info">
                  <a class="demo-site-link" href="${item.DemoURL}">Demo Site</a>
                </div>
              </div>
            </div>
          `);
        }
  
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