const state = {
  listingRows: [],
  listingText: "",
};

const colorTerms = [
  ["黑色", "Black", "Negro", "Common neutral color"],
  ["白色", "White", "Blanco", "Common neutral color"],
  ["灰色", "Gray / Grey", "Gris", "Use Gray for US, Grey for UK/AU when needed"],
  ["浅灰色", "Light Gray", "Gris claro", "Common home goods expression"],
  ["深灰色", "Dark Gray", "Gris oscuro", "Common home goods expression"],
  ["银色", "Silver", "Plateado", "Use for metallic appearance"],
  ["金色", "Gold", "Dorado", "Use for color, not material claim"],
  ["米色", "Beige", "Beige", "Soft home color"],
  ["奶油色", "Cream", "Crema", "Soft home color"],
  ["棕色", "Brown", "Marrón", "Common wood-like color"],
  ["浅棕色", "Light Brown", "Marrón claro", "Soft wood-like color"],
  ["深棕色", "Dark Brown", "Marrón oscuro", "Soft wood-like color"],
  ["原木色", "Natural Wood", "Madera natural", "Use when the product has a natural wood look"],
  ["透明色", "Clear", "Transparente", "Use for transparent products"],
  ["红色", "Red", "Rojo", "Common color"],
  ["酒红色", "Burgundy", "Borgoña", "Deep red tone"],
  ["粉色", "Pink", "Rosa", "Common color"],
  ["玫瑰金", "Rose Gold", "Oro rosa", "Use as color tone"],
  ["橙色", "Orange", "Naranja", "Common color"],
  ["黄色", "Yellow", "Amarillo", "Common color"],
  ["绿色", "Green", "Verde", "Common color"],
  ["浅绿色", "Light Green", "Verde claro", "Soft color"],
  ["深绿色", "Dark Green", "Verde oscuro", "Deep color"],
  ["蓝色", "Blue", "Azul", "Common color"],
  ["浅蓝色", "Light Blue", "Azul claro", "Soft color"],
  ["深蓝色", "Navy Blue", "Azul marino", "Common product color"],
  ["紫色", "Purple", "Morado", "Common color"],
  ["米白色", "Off White", "Blanco roto", "Common home goods expression"],
  ["彩色", "Multicolor", "Multicolor", "Use for mixed-color sets"],
];

const selectors = {
  views: () => document.querySelectorAll(".view"),
  navItems: () => document.querySelectorAll(".nav-item"),
};

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupTopbar();
  setupListingTool();
  setupWalmartTool();
  setupConverter();
  renderColorTable();
  document.getElementById("colorFilter").addEventListener("input", renderColorTable);
});

function setupNavigation() {
  document.querySelectorAll("[data-view], [data-view-jump]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const view = element.dataset.view || element.dataset.viewJump;
      if (!view) return;
      event.preventDefault();
      showView(view);
    });
  });

  const initialView = window.location.hash.replace("#", "") || "dashboard";
  showView(initialView);
}

function showView(viewId) {
  selectors.views().forEach((view) => view.classList.toggle("active", view.id === viewId));
  selectors.navItems().forEach((item) => item.classList.toggle("active", item.dataset.view === viewId));
  window.history.replaceState(null, "", `#${viewId}`);
}

function setupTopbar() {
  const today = new Date();
  document.getElementById("todayPill").textContent = today.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  document.getElementById("shareGuideButton").addEventListener("click", () => {
    showToast("Publish this folder with GitHub Pages: Settings > Pages > Deploy from branch.");
  });

  document.getElementById("globalSearch").addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    if (!query) return;
    const target = ["amazon", "walmart", "warehouse", "converter", "colors", "sop"].find((id) => id.includes(query));
    if (target) showView(target);
  });
}

function setupListingTool() {
  const fileInput = document.getElementById("productFile");
  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      state.listingRows = await readProductFile(file);
      showToast(`Loaded ${state.listingRows.length} product rows.`);
    } catch (error) {
      showToast(error.message || "Could not read this file.");
    }
  });

  document.getElementById("listingForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const pastedRows = parseTableText(document.getElementById("productPaste").value);
    const rows = state.listingRows.length ? state.listingRows : pastedRows;
    renderListingResults(rows);
  });

  document.getElementById("clearListing").addEventListener("click", () => {
    state.listingRows = [];
    document.getElementById("productFile").value = "";
    document.getElementById("productPaste").value = "";
    document.getElementById("listingResults").className = "result-stack empty-state";
    document.getElementById("listingResults").textContent = "Upload or paste product rows, then generate fields.";
  });

  document.getElementById("copyAllListing").addEventListener("click", () => {
    if (!state.listingText) {
      showToast("Generate results first.");
      return;
    }
    copyText(state.listingText);
  });
}

function setupWalmartTool() {
  document.getElementById("walmartForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const eans = document
      .getElementById("eanList")
      .value.split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);
    const rows = parseTableText(document.getElementById("walmartRows").value);
    renderWalmartResults(eans, rows);
  });

  document.querySelector('[data-fill-demo="walmart"]').addEventListener("click", () => {
    document.getElementById("eanList").value = "1234567890123\n1234567890130";
    document.getElementById("walmartRows").value =
      "sku,brand,product_name,category,color,material,price,length,width,height,dimension_unit,weight,weight_unit\nCB001,Northline Home,Kitchen Rack,Home / Storage / Racks,White,Metal,24.99,40,25,15,cm,1.2,kg\nCB002,Harbor Nest,Bathroom Shelf,Home / Bath / Shelves,Black,Plastic,18.99,30,12,10,cm,900,g";
  });
}

function setupConverter() {
  document.getElementById("converterForm").addEventListener("submit", (event) => {
    event.preventDefault();
    renderConverter();
  });
  renderConverter();
}

async function readProductFile(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  if (["csv", "tsv"].includes(extension)) {
    return parseTableText(await file.text());
  }
  if (!window.XLSX) {
    throw new Error("XLSX support is still loading. Please try again, or save the file as CSV.");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { defval: "" }).map(normalizeRow);
}

function parseTableText(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const delimiter = trimmed.includes("\t") ? "\t" : ",";
  const rows = parseDelimited(trimmed, delimiter);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => normalizeHeader(header));
  return rows
    .slice(1)
    .filter((row) => row.some((cell) => String(cell || "").trim()))
    .map((row) => {
      const output = {};
      headers.forEach((header, index) => {
        output[header] = row[index] ?? "";
      });
      return normalizeRow(output);
    });
}

function parseDelimited(text, delimiter) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (!quoted && char === delimiter) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  rows.push(row);
  return rows;
}

function normalizeHeader(header) {
  const raw = String(header || "").trim().toLowerCase();
  const compact = raw.replace(/\s+/g, "").replace(/[()（）:_\-/*]/g, "");
  const map = [
    [["sku", "msku", "aksku", "商品编码", "商品编号"], "sku"],
    [["brand", "品牌", "品牌名称"], "brand"],
    [["productname", "itemname", "title", "品名", "商品名称", "中文名称", "英文名称"], "product_name"],
    [["category", "producttype", "类目", "商品品类", "商品目录"], "category"],
    [["color", "颜色"], "color"],
    [["material", "材质"], "material"],
    [["price", "sellingprice", "售价", "销售价格", "进口申报单价usd", "出口申报单价usd"], "price"],
    [["length", "长", "包装规格长", "商品长"], "length"],
    [["width", "宽", "包装规格宽", "商品宽"], "width"],
    [["height", "高", "包装规格高", "商品高"], "height"],
    [["dimensionunit", "尺寸单位", "包装规格单位"], "dimension_unit"],
    [["weight", "重量", "单品毛重", "包装重量"], "weight"],
    [["weightunit", "重量单位", "单品毛重单位"], "weight_unit"],
    [["packagelength", "包裹长", "包装长度"], "package_length"],
    [["packagewidth", "包裹宽", "包装宽度"], "package_width"],
    [["packageheight", "包裹高", "包装高度"], "package_height"],
    [["packageweight", "包裹重量", "包装重量"], "package_weight"],
    [["link", "url", "productlink", "商品链接", "产品链接"], "link"],
  ];

  const found = map.find(([keys]) => keys.includes(compact));
  return found ? found[1] : compact || raw;
}

function normalizeRow(row) {
  const output = {};
  Object.entries(row).forEach(([key, value]) => {
    output[normalizeHeader(key)] = String(value ?? "").trim();
  });
  return output;
}

function renderListingResults(rows) {
  const container = document.getElementById("listingResults");
  if (!rows.length) {
    container.className = "result-stack empty-state";
    container.textContent = "No product rows found. Check your headers or paste CSV rows.";
    state.listingText = "";
    return;
  }

  const marketplace = document.getElementById("marketplaceSelect").value;
  const storePrefix = document.getElementById("storePrefix").value.trim() || "CB";
  const launchDate = document.getElementById("launchDate").value || "";
  const maxOrderQty = document.getElementById("maxOrderQty").value || "";

  const products = rows.map((row, index) => buildAmazonFields(row, { marketplace, storePrefix, launchDate, maxOrderQty }, index));
  state.listingText = products.map(formatProductText).join("\n\n---\n\n");
  container.className = "result-stack";
  container.innerHTML = "";
  products.forEach((product) => container.appendChild(renderProductCard(product)));
}

function buildAmazonFields(row, options, index) {
  const sku = pick(row, ["sku"]) || `SKU-${index + 1}`;
  const brand = pick(row, ["brand"]) || "Brand Name";
  const category = pick(row, ["category"]) || "Product";
  const categoryLeaf = getCategoryLeaf(category);
  const productName = cleanName(pick(row, ["product_name"]) || categoryLeaf);
  const title = [brand, categoryLeaf, summarizeColor(row.color)].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  const model = normalizeModelNumber(sku, productName, options.marketplace);
  const itemDims = normalizeDimensions(row.length, row.width, row.height, row.dimension_unit || "cm");
  const packageDims = normalizeDimensions(row.package_length || row.length, row.package_width || row.width, row.package_height || row.height, row.dimension_unit || "cm");
  const weight = normalizeWeight(row.weight, row.weight_unit || "");
  const packageWeight = normalizeWeight(row.package_weight || row.weight, row.weight_unit || "");
  const warnings = [];

  if (itemDims.missing) warnings.push("Missing complete product dimensions. Confirm manually.");
  if (!row.weight && !row.package_weight) warnings.push("Missing weight. Confirm manually.");
  if (!row.color) warnings.push("Missing color. Confirm manually.");
  if (!row.material) warnings.push("Missing material. Confirm manually.");

  const fields = [
    ["Product Name", title || "Manual confirmation required"],
    ["Brand Name", brand],
    ["Model Number", model],
    ["Model Name", model],
    ["Manufacturer", brand],
    ["Product Quantity", "1"],
    ["Color", summarizeColor(row.color) || "Manual confirmation required"],
    ["Part Number", model],
    ["Needs Assembly", "No"],
    ["Product Site Launch Date", options.launchDate],
    ["Included Components", categoryLeaf],
    ["Product Length Unit", "Centimeters"],
    ["Product Depth", itemDims.length || "Manual confirmation required"],
    ["Product Height Unit", "Centimeters"],
    ["Product Height", itemDims.height || "Manual confirmation required"],
    ["Product Width Unit", "Centimeters"],
    ["Product Width", itemDims.width || "Manual confirmation required"],
    ["Product Weight", weight.value || "Manual confirmation required"],
    ["Product Weight Unit", "Kilograms"],
    ["SKU", sku],
    ["Your Price", row.price || ""],
    ["Offer Release Date", options.launchDate],
    ["Condition", "New"],
    ["Tax Code", ""],
    ["Sale Start Date", options.launchDate],
    ["Maximum Order Quantity", options.maxOrderQty],
    ["Fulfillment Channel", "Fulfillment by Amazon"],
    ["Package Height Unit", "Centimeters"],
    ["Package Height", packageDims.height || "Manual confirmation required"],
    ["Package Length Unit", "Centimeters"],
    ["Package Length", packageDims.length || "Manual confirmation required"],
    ["Package Width Unit", "Centimeters"],
    ["Package Width", packageDims.width || "Manual confirmation required"],
    ["Package Weight", packageWeight.value || "Manual confirmation required"],
    ["Package Weight Unit", "Kilograms"],
    ["Number of Boxes", "1"],
    ["Country of Origin", "CN - China"],
    ["Batteries Required", "No"],
    ["Dangerous Goods Regulation", "Not Applicable"],
    ["Material", row.material || "Manual confirmation required"],
    ["Product Link", row.link || ""],
  ];

  return {
    heading: `${index + 1}. ${sku}`,
    subheading: `${brand} · ${categoryLeaf}`,
    fields,
    warnings,
  };
}

function normalizeModelNumber(sku, productName, marketplace) {
  const cleanSku = String(sku || "").trim().replace(/\s+/g, "");
  const productCode = abbreviateProductName(productName);
  if (!cleanSku) return "";
  if (cleanSku.toUpperCase().startsWith(marketplace.toUpperCase())) return cleanSku;
  if (/^US/i.test(cleanSku)) return `${marketplace}${productCode}${cleanSku.slice(2)}`;
  if (cleanSku.length > 3) return `${marketplace}${cleanSku.slice(3)}`;
  return `${marketplace}${cleanSku}`;
}

function abbreviateProductName(name) {
  const text = String(name || "").toLowerCase();
  const dictionary = [
    ["cutting board", "CB"],
    ["rack", "RK"],
    ["shelf", "SH"],
    ["holder", "HD"],
    ["organizer", "OG"],
    ["basket", "BK"],
    ["tray", "TR"],
    ["board", "BD"],
    ["caddy", "CD"],
  ];
  const match = dictionary.find(([word]) => text.includes(word));
  return match ? match[1] : "";
}

function renderProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const header = document.createElement("div");
  header.className = "product-card-header";
  header.innerHTML = `<div><h3>${escapeHtml(product.heading)}</h3><p>${escapeHtml(product.subheading)}</p></div>`;
  const copyAll = document.createElement("button");
  copyAll.className = "primary-button";
  copyAll.type = "button";
  copyAll.textContent = "Copy Product";
  copyAll.addEventListener("click", () => copyText(formatProductText(product)));
  header.appendChild(copyAll);
  card.appendChild(header);

  product.fields.forEach(([label, value]) => {
    card.appendChild(renderFieldRow(label, value));
  });

  product.warnings.forEach((warning) => {
    const alert = document.createElement("div");
    alert.className = "alert";
    alert.textContent = warning;
    card.appendChild(alert);
  });

  return card;
}

function renderFieldRow(label, value) {
  const row = document.createElement("div");
  row.className = "field-row";
  const safeValue = value ?? "";
  row.innerHTML = `<strong>${escapeHtml(label)}</strong><span class="result-value">${escapeHtml(safeValue)}</span>`;
  const button = document.createElement("button");
  button.className = "copy-button";
  button.type = "button";
  button.textContent = "Copy";
  button.addEventListener("click", () => copyText(safeValue));
  row.appendChild(button);
  return row;
}

function renderWalmartResults(eans, rows) {
  const container = document.getElementById("walmartResults");
  if (!eans.length || !rows.length) {
    container.className = "result-stack empty-state";
    container.textContent = "Paste EANs and product rows first.";
    return;
  }
  container.className = "result-stack";
  container.innerHTML = "";

  rows.forEach((row, index) => {
    const ean = eans[index] || "Manual confirmation required";
    const brand = row.brand || "Brand Name";
    const category = getCategoryLeaf(row.category || row.product_name || "Product");
    const fields = [
      ["Product ID Type", "EAN"],
      ["Product ID / EAN", ean],
      ["SKU", row.sku || "Manual confirmation required"],
      ["Product Name", [brand, category].filter(Boolean).join(" ")],
      ["Brand", brand],
      ["Product Type / Item Type Search", category],
      ["Color", row.color || "Manual confirmation required"],
      ["Material", row.material || "Manual confirmation required"],
      ["Selling Price", row.price || ""],
      ["Country of Origin", "CN - China"],
      ["Electronic Component", "No"],
      ["Battery Type", "Does Not Contain a Battery"],
      ["Chemical", "No"],
    ];

    const product = {
      heading: `${index + 1}. ${row.sku || "SKU required"} · ${ean}`,
      subheading: `${brand} · ${category}`,
      fields,
      warnings: ean === "Manual confirmation required" ? ["Missing EAN for this product row."] : [],
    };
    container.appendChild(renderProductCard(product));
  });
}

function renderConverter() {
  const length = Number(document.getElementById("lengthValue").value);
  const lengthUnit = document.getElementById("lengthUnit").value;
  const weight = Number(document.getElementById("weightValue").value);
  const weightUnit = document.getElementById("weightUnit").value;
  const container = document.getElementById("converterResults");
  container.innerHTML = "";

  if (length > 0) {
    const cm = toCm(length, lengthUnit);
    container.appendChild(renderFieldRow("Length - cm", formatNumber(cm)));
    container.appendChild(renderFieldRow("Length - mm", formatNumber(cm * 10)));
    container.appendChild(renderFieldRow("Length - in", formatNumber(cm / 2.54)));
  }

  if (weight > 0) {
    const kg = toKg(weight, weightUnit);
    container.appendChild(renderFieldRow("Weight - kg", formatNumber(kg)));
    container.appendChild(renderFieldRow("Weight - g", formatNumber(kg * 1000)));
    container.appendChild(renderFieldRow("Weight - lb", formatNumber(kg * 2.2046226218)));
  }
}

function renderColorTable() {
  const query = document.getElementById("colorFilter")?.value.trim().toLowerCase() || "";
  const tbody = document.getElementById("colorTable");
  tbody.innerHTML = "";
  colorTerms
    .filter((row) => row.join(" ").toLowerCase().includes(query))
    .forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("");
      tbody.appendChild(tr);
    });
}

function pick(row, keys) {
  for (const key of keys) {
    if (row[key]) return row[key];
  }
  return "";
}

function getCategoryLeaf(category) {
  const parts = String(category || "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.at(-1) || String(category || "").trim();
}

function cleanName(value) {
  return String(value || "")
    .replace(/[【】\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function summarizeColor(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const found = colorTerms.find(([cn, en]) => text.includes(cn) || text.toLowerCase().includes(en.split(" ")[0].toLowerCase()));
  return found ? found[1].split("/")[0].trim() : text;
}

function normalizeDimensions(length, width, height, unit) {
  const values = [length, width, height].map((value) => Number(String(value || "").replace(/[^\d.]/g, "")));
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) return { missing: true };
  const normalized = values.map((value) => normalizeLengthValue(value, unit));
  return {
    length: formatNumber(normalized[0]),
    width: formatNumber(normalized[1]),
    height: formatNumber(normalized[2]),
    missing: false,
  };
}

function normalizeLengthValue(value, unit) {
  const normalizedUnit = String(unit || "").toLowerCase();
  if (normalizedUnit.includes("mm")) return value / 10;
  if (normalizedUnit.includes("in")) return value * 2.54;
  if (!normalizedUnit && value > 150) return value / 10;
  if (value > 150 && normalizedUnit.includes("cm")) return value / 10;
  return value;
}

function normalizeWeight(value, unit) {
  const raw = Number(String(value || "").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(raw) || raw <= 0) return { value: "" };
  return { value: formatNumber(toKg(raw, unit || (raw > 50 ? "g" : "kg"))) };
}

function toCm(value, unit) {
  if (unit === "mm") return value / 10;
  if (unit === "in") return value * 2.54;
  return value;
}

function toKg(value, unit) {
  if (unit === "g") return value / 1000;
  if (unit === "lb") return value * 0.45359237;
  return value;
}

function formatNumber(value) {
  if (!Number.isFinite(Number(value))) return "";
  const rounded = Math.round(Number(value) * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatProductText(product) {
  return [product.heading, product.subheading, ...product.fields.map(([label, value]) => `${label}: ${value}`), ...product.warnings.map((warning) => `Warning: ${warning}`)].join("\n");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(String(text ?? ""));
    showToast("Copied.");
  } catch {
    showToast("Copy failed. Select the text manually.");
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
