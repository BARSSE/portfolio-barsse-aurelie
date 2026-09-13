// ---------- menu déroulant ----------
  const menuBtn = document.getElementById('menuBtn');
  const dropdown = document.getElementById('dropdownMenu');

  menuBtn.addEventListener('click', () => {
    const isOpen = dropdown.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-wrap')) {
      dropdown.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  dropdown.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      dropdown.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // ---------- formulaire de contact ----------
  // Adresse de destination : remplace-la par ta vraie adresse email.
  const CONTACT_EMAIL = "barsse.aurelie@gmail.com";

  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nom = document.getElementById('nom').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    const subject = encodeURIComponent(`Contact portfolio — ${nom}`);
    const body = encodeURIComponent(`Nom : ${nom}\nEmail : ${email}\n\n${message}`);

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    status.textContent = "> ouverture de ton client mail...";
  });

  // ---------- flux RSS — veille PQC ----------
  // Sources de veille : ANSSI (CERT-FR), Cloudflare, NIST, IBM.
  // Flux généralistes filtrés par mots-clés PQC ci-dessous (voir PQC_KEYWORDS).
  const RSS_FEEDS = [
    // Le flux natif cert.ssi.gouv.fr/feed/ renvoie une erreur 404 depuis la refonte
    // du site ANSSI (fin 2025) : on passe par Google Actualités, filtré sur leurs domaines.
    { url: "https://news.google.com/rss/search?q=(post-quantique+OR+%22cryptographie+post-quantique%22)+(site:cyber.gouv.fr+OR+site:cert.ssi.gouv.fr)&hl=fr&gl=FR&ceid=FR:fr", label: "ANSSI" },
    { url: "https://blog.cloudflare.com/tag/post-quantum/rss", label: "Cloudflare" },
    { url: "https://www.nist.gov/news-events/cybersecurity/rss.xml", label: "NIST / CSRC" },
    { url: "https://news.google.com/rss/search?q=%22post-quantum%22+site:ibm.com&hl=fr&gl=FR&ceid=FR:fr", label: "IBM" },
  ];

  // Mots-clés utilisés pour ne garder que les articles liés à la veille PQC
  // (utile pour les flux généralistes comme celui du CERT-FR ou de NIST).
  const PQC_KEYWORDS = [
    "post-quantum", "post quantum", "postquantum", "quantum-safe", "quantum safe",
    "quantique", "pqc", "kyber", "dilithium", "ml-kem", "ml-dsa", "slh-dsa",
    "crystals", "sphincs", "cryptographie", "cryptography", "chiffrement",
    "lattice", "harvest now", "algorithme quantique", "quantum computer", "ordinateur quantique"
  ];


  async function loadRSS() {
    const container = document.getElementById('rssContainer');
    if (RSS_FEEDS.length === 0) return;

    container.innerHTML = '<div class="rss-loading">$ chargement des flux...</div>';
    let allItems = [];

    for (const feed of RSS_FEEDS) {
      try {
        const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
        const res = await fetch(api);
        const data = await res.json();
        if (data.items) {
          allItems = allItems.concat(
            data.items.map(item => ({
              title: item.title,
              link: item.link,
              date: item.pubDate,
              source: feed.label
            }))
          );
        }
      } catch (err) {
        console.error('Erreur flux RSS :', feed.url, err);
      }
    }

    // Ne garder que les articles en lien avec la veille PQC
    const filtered = allItems.filter(item => {
      const haystack = (item.title || '').toLowerCase();
      return PQC_KEYWORDS.some(kw => haystack.includes(kw));
    });

    const finalItems = filtered.length > 0 ? filtered : allItems;

    if (finalItems.length === 0) {
      container.innerHTML = '<div class="rss-loading">$ aucun article récupéré — le service de conversion RSS (rss2json.com) est peut-être temporairement limité. Réessaie dans quelques minutes ou recharge la page.</div>';
      return;
    }

    finalItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    const toShow = finalItems.slice(0, 10);

    container.innerHTML = toShow.map(item => `
      <div class="rss-item">
        <div class="rss-date">${item.date ? new Date(item.date).toLocaleDateString('fr-FR') : ''}</div>
        <div class="rss-title"><a href="${item.link}" target="_blank" rel="noopener">${item.title}</a></div>
        <div class="rss-source">${item.source}</div>
      </div>
    `).join('');
  }

  loadRSS();
