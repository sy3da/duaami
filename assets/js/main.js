(function () {
  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // The site is static, so events that ended after the last build are moved to "past" here.
  var now = new Date();
  var today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  document.querySelectorAll("[data-upcoming-list]").forEach(function (list) {
    var pastList = document.querySelector("[data-past-list]");
    var ended = Array.prototype.filter.call(list.children, function (card) {
      return card.dataset.eventDate && card.dataset.eventDate < today;
    });
    ended.forEach(function (card) {
      if (pastList) {
        pastList.prepend(card);
        card.closest("[data-past-section]").hidden = false;
      } else {
        card.remove();
      }
    });
    if (list.children.length === 0) {
      var empty = document.querySelector("[data-upcoming-empty]");
      if (empty) empty.hidden = false;
    }
  });

  // Members directory search
  var search = document.querySelector("[data-member-search]");
  if (search) {
    var cards = document.querySelectorAll("[data-member-grid] .person-card");
    var count = document.querySelector("[data-member-count]");
    var emptyMsg = document.querySelector("[data-member-empty]");
    search.addEventListener("input", function () {
      var q = search.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var match = !q || card.dataset.search.indexOf(q) !== -1;
        card.hidden = !match;
        if (match) visible++;
      });
      count.textContent = visible + (visible === 1 ? " member" : " members");
      emptyMsg.hidden = visible !== 0;
    });
  }

  // Gallery lightbox
  var photos = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  if (photos.length) {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Photo viewer");
    box.innerHTML =
      '<button class="lightbox-close" aria-label="Close">&times;</button>' +
      '<button class="lightbox-nav prev" aria-label="Previous photo">&lsaquo;</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lightbox-nav next" aria-label="Next photo">&rsaquo;</button>';
    document.body.appendChild(box);
    var boxImg = box.querySelector("img");
    var boxCaption = box.querySelector("figcaption");
    var current = 0;
    var lastFocus = null;

    var show = function (i) {
      current = (i + photos.length) % photos.length;
      var link = photos[current];
      boxImg.src = link.getAttribute("href");
      boxImg.alt = link.dataset.caption || "";
      boxCaption.textContent = link.dataset.caption || "";
    };
    var close = function () {
      box.hidden = true;
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    };

    photos.forEach(function (link, i) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        lastFocus = link;
        show(i);
        box.hidden = false;
        document.body.style.overflow = "hidden";
        box.querySelector(".lightbox-close").focus();
      });
    });
    box.querySelector(".lightbox-close").addEventListener("click", close);
    box.querySelector(".prev").addEventListener("click", function () { show(current - 1); });
    box.querySelector(".next").addEventListener("click", function () { show(current + 1); });
    box.addEventListener("click", function (e) {
      if (e.target === box) close();
    });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  // Membership form (Formspree-compatible endpoint)
  var form = document.querySelector("[data-enroll-form]");
  if (form) {
    var status = form.querySelector("[data-form-status]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var button = form.querySelector("button[type=submit]");
      button.disabled = true;
      status.className = "form-status";
      status.textContent = "Sending…";
      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          form.reset();
          status.classList.add("success");
          status.textContent = "Thank you! Your application was received. A board member will be in touch soon.";
        })
        .catch(function () {
          status.classList.add("error");
          status.textContent = "Sorry, something went wrong. Please try again or email us directly.";
        })
        .finally(function () {
          button.disabled = false;
        });
    });
  }
})();
