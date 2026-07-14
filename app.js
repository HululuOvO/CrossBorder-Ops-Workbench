const state = {
  listingRows: [],
  listingText: "",
};

const colorTerms = [
  ["黑色", "Black", "Negro", "常用中性色", "#17191d"],
  ["白色", "White", "Blanco", "常用中性色", "#ffffff"],
  ["灰色", "Gray / Grey", "Gris", "美国常用 Gray，英国和澳大利亚可用 Grey", "#8b9098"],
  ["浅灰色", "Light Gray", "Gris claro", "家居用品常用表达", "#d5d7da"],
  ["深灰色", "Dark Gray", "Gris oscuro", "深色家居用品常用表达", "#4b4f56"],
  ["银色", "Silver", "Plateado", "用于金属外观颜色", "#c3c7cc"],
  ["金色", "Gold", "Dorado", "表示颜色，不代表材质", "#c9a227"],
  ["米色", "Beige", "Beige", "柔和家居色", "#d8cbb5"],
  ["奶油色", "Cream", "Crema", "柔和家居色", "#f4ead0"],
  ["棕色", "Brown", "Marrón", "常见木纹类颜色", "#7a5138"],
  ["浅棕色", "Light Brown", "Marrón claro", "浅木色表达", "#b78a68"],
  ["深棕色", "Dark Brown", "Marrón oscuro", "深木色表达", "#4d3125"],
  ["原木色", "Natural Wood", "Madera natural", "适用于自然木材外观", "#c79e68"],
  ["透明", "Clear", "Transparente", "适用于透明产品", "rgba(221,235,240,.6)"],
  ["红色", "Red", "Rojo", "常用颜色", "#d22f2f"],
  ["酒红色", "Burgundy", "Borgoña", "深红色调", "#7c2434"],
  ["粉色", "Pink", "Rosa", "常用颜色", "#ef9db7"],
  ["玫瑰金", "Rose Gold", "Oro rosa", "表示玫瑰金色调", "#c88b7b"],
  ["橙色", "Orange", "Naranja", "常用颜色", "#ef7f27"],
  ["黄色", "Yellow", "Amarillo", "常用颜色", "#efd54f"],
  ["绿色", "Green", "Verde", "常用颜色", "#3d8a55"],
  ["浅绿色", "Light Green", "Verde claro", "柔和浅色", "#9dca9e"],
  ["深绿色", "Dark Green", "Verde oscuro", "深色产品表达", "#235837"],
  ["蓝色", "Blue", "Azul", "常用颜色", "#3977c3"],
  ["浅蓝色", "Light Blue", "Azul claro", "柔和浅色", "#8fc3e7"],
  ["藏青色", "Navy Blue", "Azul marino", "常见深蓝产品色", "#253852"],
  ["紫色", "Purple", "Morado", "常用颜色", "#7652a8"],
  ["米白色", "Off White", "Blanco roto", "家居用品常用表达", "#f3f0e8"],
  ["卡其色", "Khaki", "Caqui", "服饰与家居常用色", "#a89468"],
  ["青色", "Cyan", "Cian", "蓝绿色调", "#36aeba"],
  ["薄荷绿", "Mint Green", "Verde menta", "柔和蓝绿色", "#9ed7c0"],
  ["湖蓝色", "Lake Blue", "Azul lago", "明亮蓝绿色", "#2e9dac"],
  ["香槟色", "Champagne", "Champán", "浅金色调", "#d9c7a2"],
  ["彩色", "Multicolor", "Multicolor", "适用于多色组合套装", "#b869a9"],
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
  setupWarehouseChecklist();
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

    if (element.classList.contains("module-card")) {
      element.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          showView(element.dataset.viewJump);
        }
      });
    }
  });

  const menuButton = document.getElementById("mobileMenuButton");
  const backdrop = document.getElementById("sidebarBackdrop");
  menuButton.addEventListener("click", () => document.body.classList.toggle("sidebar-open"));
  backdrop.addEventListener("click", closeMobileMenu);

  const initialView = window.location.hash.replace("#", "") || "dashboard";
  showView(document.getElementById(initialView) ? initialView : "dashboard", false);
}

function showView(viewId, scroll = true) {
  selectors.views().forEach((view) => view.classList.toggle("active", view.id === viewId));
  selectors.navItems().forEach((item) => item.classList.toggle("active", item.dataset.view === viewId));
  window.history.replaceState(null, "", `#${viewId}`);
  closeMobileMenu();
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeMobileMenu() {
  document.body.classList.remove("sidebar-open");
}

function setupTopbar() {
  const today = new Date();
  document.getElementById("todayPill").textContent = today.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  document.getElementById("shareGuideButton").addEventListener("click", () => {
    showToast("发布到 GitHub Pages：进入仓库 Settings → Pages → 选择 main 分支。");
  });

  document.getElementById("privacyButton").addEventListener("click", () => {
    showToast("公开版不会把 Excel 上传到服务器，解析和生成均在当前浏览器完成。");
  });

  const searchMap = [
    [["amazon", "亚马逊", "建单", "商品"], "amazon"],
    [["walmart", "沃尔玛", "ean"], "walmart"],
    [["warehouse", "仓库", "海外仓", "谷仓"], "warehouse"],
    [["converter", "换算", "单位", "cm", "kg"], "converter"],
    [["color", "颜色", "词库"], "colors"],
    [["sop", "流程", "知识库"], "sop"],
  ];

  document.getElementById("globalSearch").addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    if (!query) return;
    const match = searchMap.find(([keywords]) => keywords.some((keyword) => String(keyword).includes(query) || query.includes(String(keyword))));
    if (match) showView(match[1]);
  });
}

function setupListingTool() {
  const fileInput = document.getElementById("productFile");
  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      state.listingRows = await readProductFile(file);
      const drop = fileInput.closest(".file-drop");
      drop.querySelector("strong").textContent = file.name;
      drop.querySelector("small").textContent = `已识别 ${state.listingRows.length} 行产品资料`;
      showToast(`已读取 ${state.listingRows.length} 行产品资料。`);
    } catch (error) {
      state.listingRows = [];
      showToast(error.message || "无法读取这个文件，请检查格式。");
    }
  });

  document.getElementById("listingForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const pastedRows = parseTableText(document.getElementById("productPaste").value);
    const rows = state.listingRows.length ? state.listingRows : pastedRows;
    renderListingResults(rows);
  });

  document.getElementById("clearListing").addEventListener("click", () => {
    state.listingRows = [];
    state.listingText = "";
    document.getElementById("productFile").value = "";
    document.getElementById("productPaste").value = "";
    const drop = document.getElementById("productFile").closest(".file-drop");
    drop.querySelector("strong").textContent = "上传产品资料表";
    drop.querySelector("small").textContent = "支持 XLSX、XLS、CSV、TSV · 文件仅在当前浏览器处理";
    renderEmptyState(document.getElementById("listingResults"), "description", "尚未生成字段", "上传或粘贴产品资料后，点击“生成字段”。");
  });

  document.getElementById("copyAllListing").addEventListener("click", () => {
    if (!state.listingText) {
      showToast("请先生成字段。");
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
    showToast("示例数据已填入。");
  });
}

function setupConverter() {
  document.getElementById("converterForm").addEventListener("submit", (event) => {
    event.preventDefault();
    renderConverter();
  });
  ["lengthValue", "lengthUnit", "weightValue", "weightUnit"].forEach((id) => {
    document.getElementById(id).addEventListener("input", renderConverter);
    document.getElementById(id).addEventListener("change", renderConverter);
  });
  renderConverter();
}

function setupWarehouseChecklist() {
  const checks = [...document.querySelectorAll('[data-check-group="warehouse"] input[type="checkbox"]')];
  const update = () => {
    const completed = checks.filter((input) => input.checked).length;
    const percentage = Math.round((completed / checks.length) * 100);
    document.getElementById("warehouseProgressLabel").textContent = `${completed} / ${checks.length}`;
    document.getElementById("warehouseProgressValue").textContent = `${percentage}%`;
    document.getElementById("warehouseProgressBar").style.width = `${percentage}%`;
  };
  checks.forEach((input) => input.addEventListener("change", update));
  document.getElementById("resetWarehouse").addEventListener("click", () => {
    checks.forEach((input) => { input.checked = false; });
    update();
    showToast("检查清单已重置。");
  });
  update();
}

async function readProductFile(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  if (["csv", "tsv"].includes(extension)) return parseTableText(await file.text());
  if (!window.XLSX) throw new Error("Excel 读取组件仍在加载，请稍后再试，或把文件另存为 CSV。");

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
  const candidates = workbook.SheetNames.map((name) => ({
    name,
    rows: sheetToRows(workbook.Sheets[name]),
  })).filter((sheet) => sheet.rows.length);

  if (!candidates.length) throw new Error("文件中没有识别到有效产品资料。");
  candidates.sort((a, b) => scoreRows(b.rows) - scoreRows(a.rows));
  return candidates[0].rows;
}

function sheetToRows(sheet) {
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
  const headerIndex = findHeaderRow(matrix);
  if (headerIndex < 0) return [];
  const headers = matrix[headerIndex].map(normalizeHeader);
  return matrix
    .slice(headerIndex + 1)
    .filter((row) => row.some((cell) => String(cell || "").trim()))
    .map((row) => {
      const output = {};
      headers.forEach((header, index) => {
        if (header) output[header] = String(row[index] ?? "").trim();
      });
      return output;
    })
    .filter((row) => Object.values(row).some(Boolean));
}

function findHeaderRow(matrix) {
  let bestIndex = -1;
  let bestScore = 0;
  matrix.slice(0, 25).forEach((row, index) => {
    const normalized = row.map(normalizeHeader);
    const score = normalized.filter((key) => ["sku", "brand", "product_name", "category", "color", "material", "length", "weight", "link"].includes(key)).length;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });
  return bestScore >= 1 ? bestIndex : -1;
}

function scoreRows(rows) {
  if (!rows.length) return 0;
  const keys = new Set(rows.flatMap((row) => Object.keys(row)));
  return rows.length + ["sku", "product_name", "brand", "category", "color", "material"].filter((key) => keys.has(key)).length * 25;
}

function parseTableText(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const delimiter = trimmed.includes("\t") ? "\t" : ",";
  const rows = parseDelimited(trimmed, delimiter);
  if (rows.length < 2) return [];
  const headers = rows[0].map(normalizeHeader);
  return rows
    .slice(1)
    .filter((row) => row.some((cell) => String(cell || "").trim()))
    .map((row) => {
      const output = {};
      headers.forEach((header, index) => {
        if (header) output[header] = String(row[index] ?? "").trim();
      });
      return output;
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
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === delimiter) {
      row.push(cell.trim());
      cell = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell.trim());
  rows.push(row);
  return rows;
}

function normalizeHeader(header) {
  const raw = String(header || "").trim().toLowerCase();
  const compact = raw.replace(/\s+/g, "").replace(/[():_\-/*（）]/g, "");
  const aliases = [
    [["sku", "msku", "aksku", "商品编码", "商品编号", "货号"], "sku"],
    [["brand", "品牌", "品牌名称"], "brand"],
    [["productname", "itemname", "title", "品名", "商品名称", "中文名称", "英文名称", "产品名称"], "product_name"],
    [["category", "producttype", "类目", "商品品类", "商品目录", "产品类型"], "category"],
    [["color", "颜色", "色彩地图"], "color"],
    [["material", "材质", "材料"], "material"],
    [["price", "sellingprice", "售价", "销售价格", "进口申报单价usd", "出口申报单价usd", "采购成本cny"], "price"],
    [["length", "长", "长度", "包装规格长", "商品长", "包装长度"], "length"],
    [["width", "宽", "宽度", "包装规格宽", "商品宽", "包装宽度"], "width"],
    [["height", "高", "高度", "包装规格高", "商品高", "包装高度"], "height"],
    [["dimensionunit", "尺寸单位", "包装规格单位", "长宽高单位"], "dimension_unit"],
    [["weight", "重量", "单品毛重", "单品重量", "包装重量"], "weight"],
    [["weightunit", "重量单位", "单品毛重单位", "单品重量单位"], "weight_unit"],
    [["packagelength", "包裹长度", "包装长"], "package_length"],
    [["packagewidth", "包裹宽度", "包装宽"], "package_width"],
    [["packageheight", "包裹高度", "包装高"], "package_height"],
    [["packageweight", "包裹重量", "包装毛重"], "package_weight"],
    [["link", "url", "productlink", "商品链接", "产品链接"], "link"],
  ];
  const found = aliases.find(([keys]) => keys.includes(compact));
  return found ? found[1] : compact;
}

function renderListingResults(rows) {
  const container = document.getElementById("listingResults");
  if (!rows.length) {
    renderEmptyState(container, "error", "没有识别到产品资料", "请检查表头是否包含 SKU、品名、品牌、类目等字段。");
    state.listingText = "";
    return;
  }

  const options = {
    marketplace: document.getElementById("marketplaceSelect").value,
    storePrefix: document.getElementById("storePrefix").value.trim() || "CB",
    launchDate: document.getElementById("launchDate").value || "",
    maxOrderQty: document.getElementById("maxOrderQty").value || "",
  };
  const products = rows.map((row, index) => buildAmazonFields(row, options, index));
  state.listingText = products.map(formatProductText).join("\n\n--------------------\n\n");
  container.className = "result-stack";
  container.innerHTML = "";
  products.forEach((product) => container.appendChild(renderProductCard(product)));
  showToast(`已生成 ${products.length} 个商品的字段。`);
}

function buildAmazonFields(row, options, index) {
  const sku = pick(row, ["sku"]) || `SKU-${index + 1}`;
  const brand = pick(row, ["brand"]) || "需人工确认";
  const category = pick(row, ["category"]) || pick(row, ["product_name"]) || "Product";
  const categoryLeaf = getCategoryLeaf(category);
  const productName = cleanName(pick(row, ["product_name"]) || categoryLeaf);
  const color = summarizeColor(row.color);
  const title = [brand, categoryLeaf, color].filter((value) => value && value !== "需人工确认").join(" ").replace(/\s+/g, " ").trim();
  const model = normalizeModelNumber(sku, productName, options.marketplace, options.storePrefix);
  const itemDims = normalizeDimensions(row.length, row.width, row.height, row.dimension_unit || "cm");
  const packageDims = normalizeDimensions(row.package_length || row.length, row.package_width || row.width, row.package_height || row.height, row.dimension_unit || "cm");
  const weight = normalizeWeight(row.weight, row.weight_unit || "");
  const packageWeight = normalizeWeight(row.package_weight || row.weight, row.weight_unit || "");
  const warnings = [];
  if (itemDims.missing) warnings.push("商品长宽高不完整，请人工确认后填写。");
  if (!row.weight && !row.package_weight) warnings.push("缺少重量，请人工确认后填写。");
  if (!row.color) warnings.push("缺少颜色，请人工确认后填写。");
  if (!row.material) warnings.push("缺少材质，请人工确认后填写。");

  const fields = [
    ["商品名称", title || "需人工确认"],
    ["品牌名", brand],
    ["型号", model],
    ["型号名称", model],
    ["制造商", brand],
    ["产品数量", "1"],
    ["颜色", color || "需人工确认"],
    ["零件编号", model],
    ["需要组装", "否"],
    ["产品网站发布日期", options.launchDate],
    ["包含的组件", categoryLeaf],
    ["商品深度单位", "Centimeters"],
    ["商品从前到后的深度", itemDims.length || "需人工确认"],
    ["商品高度单位", "Centimeters"],
    ["商品从地面到顶部的高度", itemDims.height || "需人工确认"],
    ["商品宽度单位", "Centimeters"],
    ["商品两侧之间的宽度", itemDims.width || "需人工确认"],
    ["商品重量", weight.value || "需人工确认"],
    ["商品重量单位", "Kilograms"],
    ["SKU", sku],
    ["你的价格", row.price || ""],
    ["提供发布日期", options.launchDate],
    ["商品状况", "New"],
    ["发售日期", options.launchDate],
    ["最大订单数量", options.maxOrderQty],
    ["配送渠道", "Fulfillment by Amazon"],
    ["包装高度单位", "Centimeters"],
    ["包装高度", packageDims.height || "需人工确认"],
    ["包装长度单位", "Centimeters"],
    ["包装长度", packageDims.length || "需人工确认"],
    ["包装宽度单位", "Centimeters"],
    ["包装宽度", packageDims.width || "需人工确认"],
    ["包装重量", packageWeight.value || "需人工确认"],
    ["包装重量单位", "Kilograms"],
    ["箱子数量", "1"],
    ["原产国 / 原产地", "CN - China"],
    ["需要电池吗", "否"],
    ["危险商品规定", "Not Applicable"],
    ["材质", row.material || "需人工确认"],
    ["产品链接", row.link || ""],
  ];
  return {
    heading: `${index + 1}. ${sku}`,
    subheading: `${brand} · ${categoryLeaf}`,
    fields,
    warnings,
  };
}

function normalizeModelNumber(sku, productName, marketplace, storePrefix) {
  const cleanSku = String(sku || "").trim().replace(/\s+/g, "");
  const productCode = abbreviateProductName(productName);
  if (!cleanSku) return "";
  if (cleanSku.toUpperCase().startsWith(marketplace.toUpperCase())) return cleanSku;
  if (/^US/i.test(cleanSku)) return `${marketplace}${storePrefix}${productCode}${cleanSku.slice(2)}`;
  if (cleanSku.length > 3) return `${marketplace}${storePrefix}${productCode}${cleanSku.slice(3)}`;
  return `${marketplace}${storePrefix}${productCode}${cleanSku}`;
}

function abbreviateProductName(name) {
  const text = String(name || "").toLowerCase();
  const dictionary = [
    ["cutting board", "CB"], ["砧板", "CB"], ["rack", "RK"], ["架", "RK"], ["shelf", "SH"],
    ["holder", "HD"], ["organizer", "OG"], ["basket", "BK"], ["tray", "TR"], ["board", "BD"], ["caddy", "CD"],
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
  copyAll.className = "copy-product-button";
  copyAll.type = "button";
  copyAll.innerHTML = '<span class="material-symbols-outlined">content_copy</span>复制当前商品';
  copyAll.addEventListener("click", () => copyText(formatProductText(product)));
  header.appendChild(copyAll);
  card.appendChild(header);
  product.fields.forEach(([label, value]) => card.appendChild(renderFieldRow(label, value)));
  product.warnings.forEach((warning) => {
    const alert = document.createElement("div");
    alert.className = "alert";
    alert.innerHTML = `<span class="material-symbols-outlined">warning</span><span>${escapeHtml(warning)}</span>`;
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
  button.innerHTML = '<span class="material-symbols-outlined">content_copy</span>复制';
  button.addEventListener("click", () => copyText(safeValue));
  row.appendChild(button);
  return row;
}

function renderWalmartResults(eans, rows) {
  const container = document.getElementById("walmartResults");
  if (!eans.length || !rows.length) {
    renderEmptyState(container, "link_off", "无法开始配对", "请同时输入 EAN 和产品资料行。");
    return;
  }
  container.className = "result-stack";
  container.innerHTML = "";
  if (eans.length !== rows.length) showToast(`EAN 有 ${eans.length} 个，产品有 ${rows.length} 行；缺少的配对会提示人工确认。`);

  rows.forEach((row, index) => {
    const ean = eans[index] || "需人工确认";
    const brand = row.brand || "需人工确认";
    const category = getCategoryLeaf(row.category || row.product_name || "Product");
    const dims = normalizeDimensions(row.length, row.width, row.height, row.dimension_unit || "cm");
    const weight = normalizeWeight(row.weight, row.weight_unit || "");
    const fields = [
      ["产品 ID 类型", "EAN"],
      ["产品 ID / EAN", ean],
      ["SKU", row.sku || "需人工确认"],
      ["产品名称", [brand, category].filter(Boolean).join(" ")],
      ["品牌名称", brand],
      ["产品类型 / 类目搜索", category],
      ["颜色", row.color || "需人工确认"],
      ["材质", row.material || "需人工确认"],
      ["售价", row.price || ""],
      ["组装后深度（in）", dims.missing ? "需人工确认" : formatNumber(dims.length / 2.54)],
      ["组装后高度（in）", dims.missing ? "需人工确认" : formatNumber(dims.height / 2.54)],
      ["组装后宽度（in）", dims.missing ? "需人工确认" : formatNumber(dims.width / 2.54)],
      ["组装后重量（lb）", weight.value ? formatNumber(Number(weight.value) * 2.2046226218) : "需人工确认"],
      ["原产国", "CN - China"],
      ["是否包含电子元件", "No"],
      ["电池类型", "Does Not Contain a Battery"],
      ["是否包含化学品", "No"],
    ];
    const product = {
      heading: `${index + 1}. ${row.sku || "缺少 SKU"} · ${ean}`,
      subheading: `${brand} · ${category}`,
      fields,
      warnings: ean === "需人工确认" ? ["当前产品缺少对应 EAN，请人工确认配对。"] : [],
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
  container.className = "result-stack";
  container.innerHTML = "";

  if (length > 0) {
    const cm = toCm(length, lengthUnit);
    container.appendChild(renderFieldRow("长度 · cm", formatNumber(cm)));
    container.appendChild(renderFieldRow("长度 · mm", formatNumber(cm * 10)));
    container.appendChild(renderFieldRow("长度 · in", formatNumber(cm / 2.54)));
  }
  if (weight > 0) {
    const kg = toKg(weight, weightUnit);
    container.appendChild(renderFieldRow("重量 · kg", formatNumber(kg)));
    container.appendChild(renderFieldRow("重量 · g", formatNumber(kg * 1000)));
    container.appendChild(renderFieldRow("重量 · lb", formatNumber(kg * 2.2046226218)));
  }
  if (!(length > 0) && !(weight > 0)) {
    renderEmptyState(container, "error", "请输入有效数值", "数值必须大于 0，长度和重量可以只填写其中一项。");
  }
}

function renderColorTable() {
  const query = document.getElementById("colorFilter")?.value.trim().toLowerCase() || "";
  const tbody = document.getElementById("colorTable");
  tbody.innerHTML = "";
  colorTerms
    .filter((row) => row.slice(0, 4).join(" ").toLowerCase().includes(query))
    .forEach(([cn, en, es, note, swatch]) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td><span class="color-name-cell"><i class="color-swatch" style="--swatch:${escapeHtml(swatch)}"></i>${escapeHtml(cn)}</span></td><td>${escapeHtml(en)}</td><td>${escapeHtml(es)}</td><td>${escapeHtml(note)}</td>`;
      tbody.appendChild(tr);
    });
}

function renderEmptyState(container, icon, title, description) {
  container.className = "result-stack empty-state";
  container.innerHTML = `<span class="empty-icon material-symbols-outlined">${escapeHtml(icon)}</span><strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p>`;
}

function pick(row, keys) {
  for (const key of keys) if (row[key]) return row[key];
  return "";
}

function getCategoryLeaf(category) {
  const parts = String(category || "").split("/").map((part) => part.trim()).filter(Boolean);
  return parts.at(-1) || String(category || "").trim();
}

function cleanName(value) {
  return String(value || "").replace(/[【】\[\]]/g, " ").replace(/\s+/g, " ").trim();
}

function summarizeColor(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const lower = text.toLowerCase();
  const found = colorTerms.find(([cn, en, es]) => text.includes(cn) || lower.includes(en.split(" ")[0].toLowerCase()) || lower.includes(es.split(" ")[0].toLowerCase()));
  return found ? found[1].split("/")[0].trim() : text;
}

function normalizeDimensions(length, width, height, unit) {
  const values = [length, width, height].map(parsePositiveNumber);
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) return { missing: true };
  const normalized = values.map((value) => normalizeLengthValue(value, unit));
  return { length: normalized[0], width: normalized[1], height: normalized[2], missing: false };
}

function normalizeLengthValue(value, unit) {
  const normalizedUnit = String(unit || "").toLowerCase();
  if (normalizedUnit.includes("mm") || normalizedUnit.includes("毫米")) return value / 10;
  if (normalizedUnit.includes("in") || normalizedUnit.includes("inch") || normalizedUnit.includes("英寸")) return value * 2.54;
  if (normalizedUnit.includes("m") && !normalizedUnit.includes("cm") && !normalizedUnit.includes("mm")) return value * 100;
  return value;
}

function normalizeWeight(value, unit) {
  const raw = parsePositiveNumber(value);
  if (!Number.isFinite(raw) || raw <= 0) return { value: "" };
  return { value: formatNumber(toKg(raw, unit || (raw > 50 ? "g" : "kg"))) };
}

function parsePositiveNumber(value) {
  const match = String(value ?? "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : NaN;
}

function toCm(value, unit) {
  if (unit === "mm") return value / 10;
  if (unit === "in") return value * 2.54;
  return value;
}

function toKg(value, unit) {
  const normalizedUnit = String(unit || "").toLowerCase();
  if (normalizedUnit === "g" || normalizedUnit.includes("克")) return value / 1000;
  if (normalizedUnit === "lb" || normalizedUnit.includes("lbs") || normalizedUnit.includes("磅")) return value * 0.45359237;
  return value;
}

function formatNumber(value) {
  if (!Number.isFinite(Number(value))) return "";
  const rounded = Math.round(Number(value) * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatProductText(product) {
  return [product.heading, product.subheading, ...product.fields.map(([label, value]) => `${label}：${value}`), ...product.warnings.map((warning) => `提醒：${warning}`)].join("\n");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(String(text ?? ""));
    showToast("已复制到剪贴板。");
  } catch {
    showToast("复制失败，请手动选择文字复制。");
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
