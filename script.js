let currentProducts = [];

window.onload = () => renderUrlInputs();

function renderUrlInputs() {
  const num = parseInt(document.getElementById('numProducts').value);
  const form = document.getElementById('urlForm');
  form.innerHTML = '';

  for (let i = 1; i <= num; i++) {
    const div = document.createElement('div');
    div.className = 'input-group';
    div.innerHTML = `
      <label for="url${i}">Product URL ${i}:</label>
      <input type="url" id="url${i}" name="url${i}" placeholder="Enter product URL ${i}" required />
    `;
    form.appendChild(div);
  }
}

function extractProductName(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');

    if (hostname.includes('amazon')) {
      let path = urlObj.pathname;
      if (path.includes('/dp/')) {
        let beforeDp = path.split('/dp/')[0];
        let parts = beforeDp.split('/');
        return cleanName(parts.filter(Boolean).pop() || '');
      }
      return cleanName(path.split('/').filter(Boolean).pop() || hostname);
    }

    if (hostname.includes('flipkart.com')) {
      let path = urlObj.pathname;
      if (path.includes('/p/')) {
        let parts = path.split('/p/');
        return cleanName(parts[1].split('?')[0].split('/')[0]);
      }
      return cleanName(path.split('/').filter(Boolean).pop() || hostname);
    }

    return cleanName(urlObj.pathname.split('/').filter(Boolean).pop() || hostname);
  } catch (e) {
    return "Unknown Product";
  }
}

function cleanName(text) {
  if (!text) return "Unknown Product";
  text = decodeURIComponent(text);
  text = text.replace(/[-_]+/g, ' ');
  return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function randomRating() {
  return (Math.random() * 1.5 + 3.5).toFixed(1); // 3.5 to 5.0
}

function randomPrices() {
  const price = Math.floor(Math.random() * 15000 + 2000);
  const discountPercent = Math.floor(Math.random() * 30 + 10);
  const originalPrice = Math.floor(price / (1 - discountPercent / 100));
  return { price, originalPrice, discountPercent };
}

function compareProducts() {
  const num = parseInt(document.getElementById('numProducts').value);
  const urls = [];

  for (let i = 1; i <= num; i++) {
    let urlInput = document.getElementById('url' + i).value.trim();
    if (urlInput) urls.push(urlInput);
  }

  if (urls.length < 2) {
    alert('Please enter at least two product URLs to compare.');
    return;
  }

  currentProducts = urls.map(url => {
    const name = extractProductName(url);
    const rating = randomRating();
    const { price, originalPrice, discountPercent } = randomPrices();
    return { name, rating, price, originalPrice, discountPercent, url };
  });

  displayComparison(currentProducts);
  document.getElementById('downloadCsvBtn').style.display = 'block';
}

function displayComparison(products) {
  const resultDiv = document.getElementById("comparisonResult");
  resultDiv.innerHTML = "";

  const bestPrice = Math.min(...products.map(p => p.price));
  const bestRating = Math.max(...products.map(p => parseFloat(p.rating)));

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${product.name}</h3>
      <p class="price-line">
        <span class="highlight price ${product.price === bestPrice ? 'best-price' : ''}">₹${product.price.toLocaleString('en-IN')}</span>
        <span class="original-price">₹${product.originalPrice.toLocaleString('en-IN')}</span>
        <span class="discount-percent">-${product.discountPercent}%</span>
      </p>
      <p class="rating ${parseFloat(product.rating) === bestRating ? 'best-rating' : ''}">⭐ ${product.rating}/5</p>
      <p><a href="${product.url}" target="_blank" rel="noopener noreferrer">View Product 🔗</a></p>
    `;
    resultDiv.appendChild(card);
  });
}

function downloadCSV() {
  if (currentProducts.length === 0) {
    alert("No products to export. Please compare products first.");
    return;
  }

  const header = ["Product Name", "Price (₹)", "Original Price (₹)", "Discount (%)", "Rating", "Product URL"];
  const rows = currentProducts.map(p => [
    `"${p.name}"`, p.price, p.originalPrice, p.discountPercent, p.rating, `"${p.url}"`
  ]);

  const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", "product_comparison.csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
