import { portfolioProjects } from './js/projectList.js';

// Header
fetch('nav.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('nav-placeholder').innerHTML = data;
  });

// Footer
fetch('footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('footer-placeholder').innerHTML = data;
  });


// Generated Portfolio List
function renderPortfolioItems(projects, { append = false, featuredOnly = false } = {}) {
  const grid = document.getElementById("portfolio-grid");
  const template = document.getElementById("portfolio-card-template");

  if (!grid || !template) return;
  if (!append) grid.innerHTML = "";

  const itemsToRender = featuredOnly
    ? projects.filter((project) => Boolean(project.featured))
    : projects;

  const fragment = document.createDocumentFragment();

  itemsToRender.forEach((project) => {
    const clone = template.content.cloneNode(true);

    // Background Image on .card-media
    const cardMedia = clone.querySelector(".card-media");
    if (cardMedia && project.image) {
      cardMedia.style.backgroundImage = `url("${project.image}")`;
      cardMedia.setAttribute("aria-label", project.imageAlt || `${project.title} preview`);
    }

    // Tags
    const tagList = clone.querySelector(".card-tags");
    if (tagList) {
      if (Array.isArray(project.tags) && project.tags.length > 0) {
        project.tags.forEach((tag) => {
          const li = document.createElement("li");
          li.className = "tag-pill";
          li.textContent = tag;
          tagList.appendChild(li);
        });
      } else {
        tagList.remove();
      }
    }

    // Text
    clone.querySelector(".card-title").textContent = project.title;
    clone.querySelector(".card-description").textContent = project.description;

    // Helper for optional buttons
    const configureLink = (selector, btnData) => {
      const link = clone.querySelector(selector);
      if (!link) return false;

      if (btnData?.url && btnData?.label) {
        link.textContent = btnData.label;
        link.href = btnData.url;
        link.setAttribute("aria-label", `${btnData.label} for ${project.title}`);
        return true;
      }

      link.remove();
      return false;
    };

    const hasPrimary = configureLink(".btn-primary", project.primaryBtn);
    const hasSecondary = configureLink(".btn-secondary", project.secondaryBtn);

    // Optional: Clean up button wrapper if neither button exists
    const actionsContainer = clone.querySelector(".card-actions"); // Adjust selector to match your HTML
    if (actionsContainer && !hasPrimary && !hasSecondary) {
      actionsContainer.remove();
    }

    fragment.appendChild(clone);
  });

  grid.appendChild(fragment);
}

function initPortfolioFilters(featuredOnly = false) {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const statusEl = document.getElementById("filter-status");

  // Scope base dataset first so counts and results stay accurate on featured-only pages
  const baseProjects = featuredOnly
    ? portfolioProjects.filter((project) => Boolean(project.featured))
    : portfolioProjects;

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedTag = btn.dataset.filter;

      filterButtons.forEach((b) => {
        const isCurrent = b === btn;
        b.classList.toggle("is-active", isCurrent);
        b.setAttribute("aria-pressed", String(isCurrent));
      });

      const filtered =
        selectedTag === "all"
          ? baseProjects
          : baseProjects.filter((project) => project.tags?.includes(selectedTag));

      renderPortfolioItems(filtered);

      if (statusEl) {
        statusEl.textContent = `Showing ${filtered.length} ${
          filtered.length === 1 ? "project" : "projects"
        }${selectedTag === "all" ? "" : ` in ${selectedTag}`}.`;
      }
    });
  });
}

// Initialize based on data-featured-only attribute on #portfolio-grid
const grid = document.getElementById("portfolio-grid");
const showOnlyFeatured = grid?.dataset.featuredOnly === "true";

renderPortfolioItems(portfolioProjects, { featuredOnly: showOnlyFeatured });
initPortfolioFilters(showOnlyFeatured);
