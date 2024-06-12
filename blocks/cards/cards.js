import { createOptimizedPicture } from '../../scripts/aem.js';
import { formatDate, replaceDoubleQuotesWithSingle } from './helper-functions.js';

export default function CardsPortfolio(block) {
  const link = block.querySelector('a');
  let data = [];
  let currentOption = 'all';

  block.textContent = '';

  function isDevelopmentMode() {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const url = window.location.href;

    const isLocalhost = (hostname === 'localhost' && port === '3000');
    const isPageDomain = url.endsWith('.page') || url.includes('.page/');

    return isLocalhost || isPageDomain;
  }

  function createCards(groups) {
    const updatedCards = [];

    const createSelectOptions = () => {
      return `
        <label for="options">Filter By: </label>
        <select id="options">
          <option value="all" ${currentOption === 'all' ? 'selected' : ''}>All</option>
          <option value="sharepoint" ${currentOption === 'sharepoint' ? 'selected' : ''}>DocBased - SharePoint</option>
          <option value="google-drive" ${currentOption === 'google-drive' ? 'selected' : ''}>DocBased - Google Drive</option>
          <option value="dark-alley" ${currentOption === 'dark-alley' ? 'selected' : ''}>DocBased - Dark Alley</option>
          <option value="experimentation" ${currentOption === 'experimentation' ? 'selected' : ''}>Experimentation</option>
          <option value="commerce" ${currentOption === 'commerce' ? 'selected' : ''}>Commerce</option>
          <option value="forms" ${currentOption === 'forms' ? 'selected' : ''}>Forms</option>
          <option value="crosswalk" ${currentOption === 'crosswalk' ? 'selected' : ''}>Crosswalk</option>
        </select>
      `;
    };

    const createCardHTML = (item, isFeatured) => {
      const optimizedDemoImage = createOptimizedPicture(item.AccountLogoURL, item.Opportunity, true, [{ width: '350' }]);
      const demoNotes = replaceDoubleQuotesWithSingle(item.DemoNotes);

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
                  <a class="github-link" href="${item.DemoGit}" target="_blank"><img src="/icons/github-logo.svg" alt="GitHub Logo"/></a>
                </div>`
                : ""}
                ${item.DocBased ?
                  `<div class="icon">
                    <img src="${item.DocBased === "Google" ? "/icons/google-drive-logo.svg" : item.DocBased === "Microsoft" ? "/icons/sharepoint-logo.svg" : item.DocBased === "DarkAlley" ? "/icons/adobe-logo-placeholder.svg" : "" }" alt="" />
                  </div>`
                : ""}
                ${isDevelopmentMode() ?
                  `<div class="demo-info-wrapper">
                    <button class="demo-info-btn" type="button" title="Click to learn more" data-demo-notes="${demoNotes}" data-demo-title="${item.Opportunity}">Demo Notes</button>
                  </div>`
                : ""}
              </div>
              <div class="related-wrapper">
                ${item.Experimentation ? `<span class="pill experimentation">Experimentation</span>`: ""}
                ${item.Commerce ? `<span class="pill commerce">Commerce</span>` : ""}
                ${item.Forms ?`<span class="pill forms">Forms</span>` : ""}
                ${item.Crosswalk ? `<span class="pill crosswalk">Crosswalk</span>` : ""}
              </div>
              <div class="links-wrapper">
                  ${item.OpportunityURL || item.DemoHub ? `<span>Links: </span>` : "" }
                  ${item.OpportunityURL ? `<a href="${item.OpportunityURL}" target="_blank">Opportunity URL</a>` : ""}
                  ${item.OpportunityURL && item.DemoHub ? ", " : ""}
                  ${item.DemoHub ? `<a href="${item.DemoHub}" target="_blank">DemoHub</a>` : ""}
              </div>
              <div class="site-xsc-wrapper">
                <a class="demo-site-link" href="${item.DemoURL}" target="_blank">Live Demo Site</a>
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

    block.innerHTML = `
      <div class="portfolio-card-container">
        <div class="filter-container">${createSelectOptions()}</div>
        <div class="small-card-container">
          ${updatedCards.join('')}
        </div>
      </div>
      <div class="modal" id="demoModal">
        <div class="modal-content">
          <div class="modal-header">
            <div>Demo Notes</div>
            <span class="close">&times;</span>
          </div>
          <div id="demoNotesContent"></div>
        </div>
      </div>`;

    initEventHandlers();
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

  function handleSelectChange(event) {
    currentOption = event.target.value;

    const filterConditions = {
      "all": (item) => true,
      "sharepoint": (item) => item.DocBased === "Microsoft",
      "google-drive": (item) => item.DocBased === "Google",
      "dark-alley": (item) => item.DocBased === "DarkAlley",
      "experimentation": (item) => item.Experimentation === "true",
      "commerce": (item) => item.Commerce === "true",
      "forms": (item) => item.Forms === "true",
      "crosswalk": (item) => item.Crosswalk === "true",
    };

    const filteredData = data.filter(filterConditions[currentOption]);

    createCards([filteredData]);
  }

  function initEventHandlers() {
    const selectElement = block.querySelector('#options');
    selectElement.addEventListener('change', handleSelectChange);

    // Add card-flip animation
    const cards = block.querySelectorAll('.card-flip');
    [...cards].forEach((card) => {
      card.addEventListener('click', function() {
        // Unflip all other cards
        cards.forEach(c => {
          if (c !== card && c.classList.contains('is-flipped')) {
            c.classList.remove('is-flipped');
          }
        });
        // Toggle the current card
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

    // Add onclick event to demo-info-btn buttons
    const demoInfoButtons = block.querySelectorAll('.demo-info-btn');
    demoInfoButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const demoNotes = button.getAttribute('data-demo-notes');
        const demoTitle = button.getAttribute('data-demo-title');
        const modal = document.getElementById('demoModal');
        const modalContent = document.getElementById('demoNotesContent');
        const modalHeader = modal.querySelector('.modal-header div');

        modalContent.innerHTML = demoNotes;
        modalHeader.textContent = `${demoTitle}`;
        modal.style.display = 'block';
      });
    });

    // Close the modal
    const modal = document.getElementById('demoModal');
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    // Close the modal when clicking outside of it
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  async function initialize() {
    const response = await fetch(link?.href);

    if (response.ok) {
      const jsonData = await response.json();
      data = jsonData.data;
      createCards(sortData(data));
    }
  }

  initialize();
}