// ui rendering stuff
class UIRenderer {
  // render grid 
  static renderIdeas(ideas, imageObserver) {
    const grid = document.getElementById("ideasGrid");
    grid.innerHTML = "";

    ideas.forEach((idea, index) => {
      const card = UIRenderer.createIdeaCard(idea, imageObserver);
      grid.appendChild(card);
    });
  }

  // create single card 
  static createIdeaCard(idea, imageObserver) {
    const card = document.createElement("div");
    card.className = "idea-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Read more about ${idea.title}`);
    
    card.onclick = () => UIRenderer.showIdeaDetail(idea);
    card.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        UIRenderer.showIdeaDetail(idea);
      }
    };

    // TODO fix image url issues
    const originalImageUrl = idea.small_image?.[0]?.url;
    const imageUrl = UIRenderer.getProxiedImageUrl(originalImageUrl);
    
    const publishedDate = new Date(idea.published_at).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    card.innerHTML = `
      <div class="card-image">
        <img class="lazy-placeholder" 
             data-src="${imageUrl}" 
             data-original="${originalImageUrl || ''}"
             alt="${idea.title}" 
             style="opacity: 0;"
             onerror="UIRenderer.handleImageError(this)">
      </div>
      <div class="card-content">
        <h3 class="card-title">${idea.title}</h3>
        <p class="card-date">
          <time datetime="${idea.published_at}">${publishedDate}</time>
        </p>
      </div>
    `;

    // setup lazy loading
    const img = card.querySelector("img");
    if (imageObserver) {
      imageObserver.observe(img);
    } else {
      // fallback for old browsers
      img.src = img.dataset.src;
      img.classList.remove("lazy-placeholder");
      img.style.opacity = "1";
    }

    return card;
  }

  // modal detail popup
  static showIdeaDetail(idea) {
    const modal = document.getElementById("modal");
    const modalImage = document.getElementById("modalImage");
    const modalTitle = document.getElementById("modalTitle");
    const modalDate = document.getElementById("modalDate");
    const modalText = document.getElementById("modalText");

    // fix image handling
    const originalImageUrl = idea.medium_image?.[0]?.url || idea.small_image?.[0]?.url;
    const imageUrl = UIRenderer.getProxiedImageUrl(originalImageUrl);
    
    modalImage.src = imageUrl;
    modalImage.alt = idea.title;
    modalImage.onerror = function() {
      UIRenderer.handleImageError(this);
    };
    
    modalTitle.textContent = idea.title;
    modalDate.textContent = new Date(idea.published_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // clean html tags
    const cleanContent = UIRenderer.stripHtml(idea.content);
    modalText.innerHTML = cleanContent;

    // show modal
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
    
    modal.focus();
  }

  // pagination buttons
  static renderPagination(meta, goToPageCallback) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    if (meta.last_page <= 1) return;

    const current = meta.current_page;
    const total = meta.last_page;

    // first page button
    const fastBackBtn = UIRenderer.createPaginationButton(
      "fast-backward",
      "First Page",
      "./assets/fast-forward.png",
      current === 1,
      () => goToPageCallback(1)
    );
    pagination.appendChild(fastBackBtn);

    // prev button
    const prevBtn = UIRenderer.createPaginationButton(
      "left",
      "Previous",
      "./assets/right-arrow.png",
      current === 1,
      () => goToPageCallback(current - 1)
    );
    pagination.appendChild(prevBtn);

    // page numbers calculation
    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(total, current + 2);

    // adjust range near beginning/end
    if (current <= 3) {
      endPage = Math.min(5, total);
    }
    if (current >= total - 2) {
      startPage = Math.max(1, total - 4);
    }

    // first page if needed
    if (startPage > 1) {
      const firstBtn = UIRenderer.createPageButton(1, false, goToPageCallback);
      pagination.appendChild(firstBtn);

      if (startPage > 2) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        ellipsis.className = "ellipsis";
        ellipsis.setAttribute("aria-hidden", "true");
        pagination.appendChild(ellipsis);
      }
    }

    // page range
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = UIRenderer.createPageButton(i, i === current, goToPageCallback);
      pagination.appendChild(pageBtn);
    }

    // last page if needed
    if (endPage < total) {
      if (endPage < total - 1) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        ellipsis.className = "ellipsis";
        ellipsis.setAttribute("aria-hidden", "true");
        pagination.appendChild(ellipsis);
      }

      const lastBtn = UIRenderer.createPageButton(total, false, goToPageCallback);
      pagination.appendChild(lastBtn);
    }

    // next button
    const nextBtn = UIRenderer.createPaginationButton(
      "right",
      "Next",
      "./assets/right-arrow.png",
      current === total,
      () => goToPageCallback(current + 1)
    );
    pagination.appendChild(nextBtn);

    // last page button
    const fastForwardBtn = UIRenderer.createPaginationButton(
      "fast-forward",
      "Last Page",
      "./assets/fast-forward.png",
      current === total,
      () => goToPageCallback(total)
    );
    pagination.appendChild(fastForwardBtn);
  }

  // arrow buttons for pagination
  static createPaginationButton(className, altText, imageSrc, disabled, clickHandler) {
    const button = document.createElement("button");
    button.className = `arrow-btn ${className}`;
    button.innerHTML = `<img src="${imageSrc}" alt="${altText}">`;
    button.disabled = disabled;
    button.setAttribute("aria-label", altText);
    
    if (!disabled) {
      button.addEventListener("click", clickHandler);
    }
    
    return button;
  }

  // page number buttons
  static createPageButton(pageNumber, isActive, goToPageCallback) {
    const button = document.createElement("button");
    button.textContent = pageNumber;
    button.className = isActive ? "active" : "";
    button.setAttribute("aria-label", `Go to page ${pageNumber}`);
    button.setAttribute("aria-current", isActive ? "page" : "false");
    
    if (!isActive) {
      button.addEventListener("click", () => goToPageCallback(pageNumber));
    }
    
    return button;
  }

  // remove html tags
  static stripHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  // fix cors image issues
  static getProxiedImageUrl(originalUrl) {
    if (!originalUrl) {
      return UIRenderer.getPlaceholderImage();
    }

    // replace blocked domain
    if (originalUrl.includes('assets.suitdev.com')) {
      return originalUrl.replace('assets.suitdev.com', 'suitmedia.static-assets.id');
    }

    return originalUrl;
  }

  // handle broken images
  static handleImageError(img) {
    // try alternative url first
    const originalUrl = img.getAttribute('data-original');
    const currentSrc = img.src;
    
    if (originalUrl && originalUrl.includes('assets.suitdev.com') && !currentSrc.includes('static-assets.id')) {
      // try alternative domain
      const altUrl = originalUrl.replace('assets.suitdev.com', 'suitmedia.static-assets.id');
      img.src = altUrl;
      return;
    }
    
    // use placeholder if all fails
    img.src = UIRenderer.getPlaceholderImage();
    img.alt = 'Image not available';
    
    img.style.backgroundColor = '#f8f9fa';
    img.style.borderRadius = '8px';
    img.classList.remove('lazy-placeholder');
    img.style.opacity = '1';
  }

  // placeholder image
  static getPlaceholderImage(width = 300, height = 200) {
    return `https://via.placeholder.com/${width}x${height}/f8f9fa/999999?text=Image+Not+Available`;
  }
}
